
interface CacheItem<T> {
  value: T;
  expiry: number;
}

type ExplanationCacheKey = {
  questionId: string;
  userAnswer: string;
};

/**
 * A simple in-memory cache for explanations with TTL support
 */
class ExplanationCache {
  private cache: Map<string, CacheItem<string>> = new Map();
  private readonly defaultTTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Get value from cache
   */
  get(key: ExplanationCacheKey): string | null {
    const cacheKey = this.generateCacheKey(key);
    const item = this.cache.get(cacheKey);
    
    // Return null if item doesn't exist or has expired
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return item.value;
  }

  /**
   * Get value from cache with TTL information
   */
  getWithTTL(key: ExplanationCacheKey): { value: string | null; ttl: number } | null {
    const cacheKey = this.generateCacheKey(key);
    const item = this.cache.get(cacheKey);
    
    // Return null if item doesn't exist
    if (!item) return null;
    
    const now = Date.now();
    const ttl = Math.max(0, item.expiry - now);
    
    // If expired, delete and return null
    if (ttl <= 0) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return { value: item.value, ttl };
  }

  /**
   * Set value in cache with optional TTL
   */
  set(key: ExplanationCacheKey, value: string, ttl: number = this.defaultTTL): void {
    const cacheKey = this.generateCacheKey(key);
    const expiry = Date.now() + ttl;
    this.cache.set(cacheKey, { value, expiry });
  }

  /**
   * Generate a consistent string key from the cache key object
   */
  private generateCacheKey(key: ExplanationCacheKey): string {
    return `${key.questionId}:${key.userAnswer}`;
  }

  /**
   * Clear all expired items from the cache
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get the size of the cache
   */
  size(): number {
    return this.cache.size;
  }
}

// Create and export a singleton instance
export const explanationCache = new ExplanationCache();
