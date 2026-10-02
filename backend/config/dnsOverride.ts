/**
 * config/dnsOverride.ts
 *
 * LOCAL DEV WORKAROUND — conditional DNS server override.
 *
 * Some Windows development networks cannot resolve MongoDB Atlas's
 * mongodb+srv:// SRV records using the default system DNS resolver.
 * Setting FORCE_PUBLIC_DNS=true in backend/.env routes those lookups
 * through Google (8.8.8.8) and Cloudflare (1.1.1.1) instead.
 *
 * DO NOT set FORCE_PUBLIC_DNS=true in production, Kubernetes ConfigMaps,
 * or any cloud deployment environment. Production platforms (cloud VMs,
 * K8s pods) have reliable resolvers and may have NetworkPolicies or
 * firewall egress rules that block traffic to 8.8.8.8/1.1.1.1,
 * which would cause a different DNS failure than the one this fixes.
 */

import dns from 'dns';

export function applyReliableDnsServers(): void {
  if (process.env.FORCE_PUBLIC_DNS === 'true') {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log('[dns] DNS override active — using public resolvers:', dns.getServers());
  } else {
    console.log('[dns] Using default system DNS resolver (FORCE_PUBLIC_DNS not set).');
  }
}
