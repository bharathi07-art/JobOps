import mongoose from 'mongoose';
import https from 'https';
import { applyReliableDnsServers } from './dnsOverride';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fetch the machine's current public IP and log it so it can be checked/whitelisted in Atlas. */
function logPublicIp(): void {
  https.get('https://api.ipify.org', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`[mDB] Current public IP: ${data.trim()} — confirm this is whitelisted in Atlas Network Access.`);
    });
  }).on('error', () => {
    console.warn('[mDB] Could not fetch public IP (no internet or ipify unreachable). Check Atlas whitelist manually.');
  });
}

/** Atlas IP-whitelist errors surface as MongoServerSelectionError with these signatures. */
function isAtlasWhitelistError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message + (err.stack ?? '');
  return (
    msg.includes('Could not connect to any servers') ||
    msg.includes('IP whitelist') ||
    msg.includes('whitelist') ||
    msg.includes('not authorized') ||
    // Atlas returns this when the connecting IP is blocked
    msg.includes('MongoServerSelectionError')
  );
}

function logAtlasWhitelistHint(): void {
  console.error('[mDB] ┌─────────────────────────────────────────────────────────────┐');
  console.error('[mDB] │  LIKELY CAUSE: Your current IP is not whitelisted in Atlas.  │');
  console.error('[mDB] │  Fix:                                                         │');
  console.error('[mDB] │  1. Go to https://cloud.mongodb.com                           │');
  console.error('[mDB] │  2. Security → Network Access → Add Current IP Address        │');
  console.error('[mDB] │  3. Restart the server after saving.                          │');
  console.error('[mDB] └─────────────────────────────────────────────────────────────┘');
}

// ── Main export ───────────────────────────────────────────────────────────────

export default async function connDB(): Promise<void> {
  // Apply DNS override first — must run before any SRV lookup.
  // Reads FORCE_PUBLIC_DNS from env; no-op in production when unset.
  applyReliableDnsServers();

  // Always log the public IP first so the Atlas whitelist check is instant.
  logPublicIp();

  const srvUri = process.env.MONGO_URI || process.env.DB_URI;

  if (!srvUri) {
    console.error('[mDB] FATAL: MONGO_URI is not set. Cannot start — MongoDB is a hard dependency for resume analysis, job matching, chat, analytics, and email automation.');
    process.exit(1);
  }

  // ── Attempt 1: SRV URI ────────────────────────────────────────────────────
  try {
    const conn = await mongoose.connect(srvUri);
    console.log(`[mDB] MongoDB connected (SRV): ${conn.connection.host}`);
    return;
  } catch (srvErr: unknown) {
    const isDns =
      srvErr instanceof Error &&
      (srvErr.message.includes('querySrv') ||
        srvErr.message.includes('ENOTFOUND'));
    console.error(
      `[mDB] SRV connection failed${isDns ? ' (DNS/querySrv error)' : ''}:`,
      srvErr instanceof Error ? srvErr.message : srvErr
    );
    if (isAtlasWhitelistError(srvErr)) logAtlasWhitelistHint();
  }

  // ── Attempt 2: explicit MONGO_URI_STANDARD (optional override) ────────────
  const standardUri = process.env.MONGO_URI_STANDARD;
  if (standardUri) {
    try {
      const conn = await mongoose.connect(standardUri);
      console.log(`[mDB] MongoDB connected (MONGO_URI_STANDARD fallback): ${conn.connection.host}`);
      return;
    } catch (stdErr: unknown) {
      console.error(
        '[mDB] MONGO_URI_STANDARD fallback failed:',
        stdErr instanceof Error ? stdErr.message : stdErr
      );
      if (isAtlasWhitelistError(stdErr)) logAtlasWhitelistHint();
    }
  }

  // ── Attempt 3: strip +srv from primary URI ────────────────────────────────
  const strippedUri = srvUri
    .replace('mongodb+srv://', 'mongodb://')
    .split('?')[0];

  if (strippedUri !== srvUri) {
    try {
      const conn = await mongoose.connect(strippedUri);
      console.log(`[mDB] MongoDB connected (stripped-SRV fallback): ${conn.connection.host}`);
      return;
    } catch (fallbackErr: unknown) {
      console.error(
        '[mDB] Stripped-SRV fallback failed:',
        fallbackErr instanceof Error ? fallbackErr.message : fallbackErr
      );
      if (isAtlasWhitelistError(fallbackErr)) logAtlasWhitelistHint();
    }
  }

  // ── All attempts exhausted — hard exit ───────────────────────────────────
  // MongoDB is a hard dependency: resume analysis, job matching, AI chat,
  // analytics, logs, saved jobs, and email automation all require it.
  // Running without it would silently fail every core user action.
  console.error(
    '[mDB] FATAL: All MongoDB connection attempts failed.\n' +
    '[mDB] The server cannot start in a usable state without MongoDB.\n' +
    '[mDB] Check the public IP logged above against Atlas → Network Access.'
  );
  process.exit(1);
}
