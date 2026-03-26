import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const DEFAULT_TTL = 60;

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = DEFAULT_TTL
): Promise<T> {
  const cached = await redis.get<T>(key);

  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const fresh = await fetcher();
  await redis.set(key, JSON.stringify(fresh), { ex: ttlSeconds });
  return fresh;
}

export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export async function invalidateCacheKey(key: string) {
  await redis.del(key);
}

export function sermonsCacheKey(userId: string, limit?: number) {
  return limit ? `sermons:${userId}:limit:${limit}` : `sermons:${userId}:all`;
}

export function sermonCacheKey(sermonId: string) {
  return `sermon:${sermonId}`;
}

export function bibleVerseCacheKey(ref: string, version: string) {
  return `bible:${version}:${ref}`;
}
