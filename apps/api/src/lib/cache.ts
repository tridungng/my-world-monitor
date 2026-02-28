/**
 * Lightweight in-memory TTL cache.
 * No Redis needed for Week 1-2. Swap to ioredis in Week 3.
 */
interface CacheEntry<T> {
    data: T;
    cachedAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function get<T>(key: string, ttlMs: number): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > ttlMs) {
        store.delete(key);
        return null;
    }
    return entry.data;
}

export function set<T>(key: string, data: T): void {
    store.set(key, {data, cachedAt: Date.now()});
}

export async function getOrFetch<T>(
    key: string,
    ttlMs: number,
    fetcher: () => Promise<T>
): Promise<T> {
    const cached = get<T>(key, ttlMs);
    if (cached !== null) return cached;
    const fresh = await fetcher();
    set(key, fresh);
    return fresh;
}