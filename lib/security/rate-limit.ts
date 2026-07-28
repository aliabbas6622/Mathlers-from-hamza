type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

type Bucket = { hits: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const maxBuckets = 10_000;

/**
 * A bounded, process-local abuse guard for server routes. Production deployments
 * should pair it with their CDN/WAF rate limiting, which is shared across nodes.
 */
export function takeRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    if (!current && buckets.size >= maxBuckets) {
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(bucketKey);
      }
      if (buckets.size >= maxBuckets) return { allowed: true, retryAfterSeconds: 0 };
    }
    buckets.set(key, { hits: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  current.hits += 1;
  return {
    allowed: current.hits <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}
