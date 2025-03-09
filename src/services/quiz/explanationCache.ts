
interface ExplanationCacheKey {
  questionId: string;
  userAnswer: string;
}

class ExplanationCache {
  private cache: Map<string, string> = new Map();
  private MAX_CACHE_SIZE = 100; // Limit cache size for memory efficiency
  private cacheTTL = 1000 * 60 * 60 * 24; // 24 hours
  private timestamps: Map<string, number> = new Map();

  private generateKey(key: ExplanationCacheKey): string {
    return `${key.questionId}:${key.userAnswer}`;
  }

  get(key: ExplanationCacheKey): string | undefined {
    const cacheKey = this.generateKey(key);
    const timestamp = this.timestamps.get(cacheKey);
    
    // Check if cache entry is expired
    if (timestamp && Date.now() - timestamp > this.cacheTTL) {
      this.cache.delete(cacheKey);
      this.timestamps.delete(cacheKey);
      return undefined;
    }
    
    return this.cache.get(cacheKey);
  }

  set(key: ExplanationCacheKey, explanation: string): void {
    const cacheKey = this.generateKey(key);
    
    // Ensure cache doesn't grow too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entry (first key)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
      this.timestamps.delete(oldestKey);
    }
    
    this.cache.set(cacheKey, explanation);
    this.timestamps.set(cacheKey, Date.now());
  }
  
  // Clear the cache when needed (e.g., on quiz reset)
  clear(): void {
    this.cache.clear();
    this.timestamps.clear();
  }
  
  // Get cache stats for monitoring
  getStats(): { size: number, oldestEntry: number } {
    let oldestTimestamp = Date.now();
    
    for (const timestamp of this.timestamps.values()) {
      if (timestamp < oldestTimestamp) {
        oldestTimestamp = timestamp;
      }
    }
    
    return {
      size: this.cache.size,
      oldestEntry: oldestTimestamp
    };
  }
}

export const explanationCache = new ExplanationCache();
