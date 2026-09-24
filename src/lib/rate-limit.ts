import 'server-only';

type Window = { count: number; resetAt: number };
const windows = new Map<string, Window>();

/**
 * Fixed-window limiter held in server memory. On Vercel each warm function
 * instance keeps its own map, so this blunts bursts from one client rather than
 * enforcing a global quota. Pair with the honeypot; move to a shared store
 * (e.g. Upstash Redis) or a Vercel Firewall rule if abuse appears.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (windows.size > 5000) for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= limit;
}
