
interface ExplanationCacheKey {
  questionId: string;
  userAnswer: string;
}

class ExplanationCache {
  private cache: Map<string, string> = new Map();

  private generateKey(key: ExplanationCacheKey): string {
    return `${key.questionId}:${key.userAnswer}`;
  }

  get(key: ExplanationCacheKey): string | undefined {
    return this.cache.get(this.generateKey(key));
  }

  set(key: ExplanationCacheKey, explanation: string): void {
    this.cache.set(this.generateKey(key), explanation);
  }
  
  // Clear the cache when needed (e.g., on quiz reset)
  clear(): void {
    this.cache.clear();
  }
}

export const explanationCache = new ExplanationCache();
