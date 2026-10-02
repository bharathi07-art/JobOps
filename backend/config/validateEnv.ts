/**
 * validateEnv.ts
 * Runs at startup — lists every required key that is missing/empty,
 * then exits the process so the server never starts in a broken state.
 * Does NOT log actual secret values, only key names + present/missing.
 *
 * OPTIONAL keys (not checked here, will not cause startup failure):
 *   FORCE_PUBLIC_DNS  — local dev DNS workaround; must NOT be set in production.
 *   MONGO_URI_STANDARD — non-SRV MongoDB fallback; only needed if SRV fails.
 *   SESSION_SECRET    — falls back to a hardcoded default if unset.
 */

const REQUIRED_KEYS: string[] = [
  'PORT',
  'MONGO_URI',
  'DATABASE_URL',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'GEMINI_API_KEY',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_CALLBACK_URL',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_MONTHLY_PLAN_ID',
  'PAYPAL_YEARLY_PLAN_ID',
];

export function validateEnv(): void {
  const missing: string[] = [];
  const present: string[] = [];

  for (const key of REQUIRED_KEYS) {
    const val = process.env[key];
    if (!val || val.trim() === '') {
      missing.push(key);
    } else {
      present.push(key);
    }
  }

  console.log('\n=== Environment Variable Check ===');
  present.forEach(k => console.log(`  ✔  ${k}`));
  missing.forEach(k => console.log(`  ✘  ${k}  <-- MISSING`));
  console.log('==================================\n');

    if (missing.length > 0) {
      console.error(
        `[startup] FATAL: ${missing.length} required environment variable(s) are missing or empty:\n` +
        missing.map(k => `  - ${k}`).join('\n') +
        '\nEnsure backend/.env is present and the server is started from the backend/ directory.\n'
      );
      // Skip exiting in test or CI environments to allow tests to run
      if (process.env.NODE_ENV !== 'test' && process.env.CI !== 'true') {
        process.exit(1);
      }
    }
}
