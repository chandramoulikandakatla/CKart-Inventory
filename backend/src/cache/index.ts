/**
 * In-Memory High-Performance TTL & LRU Cache Service
 * 
 * Provides:
 * - Time-To-Live (TTL) expiration
 * - Least-Recently-Used (LRU) capacity eviction
 * - Tag/namespace-based cache invalidation
 * - Performance metrics (hits, misses, evictions)
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags?: string[];
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxEntries: number;
  private defaultTtlMs: number;
  private hits = 0;
  private misses = 0;

  constructor(maxEntries: number = 500, defaultTtlMs: number = 60000) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Get cached item or undefined if expired / not found
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }

    // Refresh LRU order (delete and re-insert)
    this.cache.delete(key);
    this.cache.set(key, entry);
    this.hits++;
    return entry.value as T;
  }

  /**
   * Store item in cache with optional TTL and invalidation tags
   */
  set<T>(key: string, value: T, ttlMs?: number, tags?: string[]): void {
    // Evict oldest entry if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    const duration = ttlMs ?? this.defaultTtlMs;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + duration,
      tags,
    });
  }

  /**
   * Invalidate entries matching a tag (e.g. 'products', 'college_dashboard')
   */
  invalidateTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clear specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Cache telemetry
   */
  getMetrics() {
    return {
      size: this.cache.size,
      maxEntries: this.maxEntries,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(3) : '0.000',
    };
  }
}

// Global application cache instances
export const productCache = new MemoryCache(200, 45000); // 45s TTL for catalog
export const metricsCache = new MemoryCache(50, 30000);  // 30s TTL for aggregated dashboards
