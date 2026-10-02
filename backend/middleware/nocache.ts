import type { Request, Response, NextFunction } from 'express';

/**
 * Express middleware that forces browsers to bypass any caching mechanisms,
 * including the Back‑Forward Cache (bfcache). It sets strict HTTP headers
 * to ensure the response is not stored.
 */
export const nocache = (_req: Request, res: Response, next: NextFunction) => {
  // Prevent standard HTTP caches
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  // Legacy HTTP/1.0 cache control
  res.setHeader('Pragma', 'no-cache');
  // Expire immediately
  res.setHeader('Expires', '0');
  next();
};
