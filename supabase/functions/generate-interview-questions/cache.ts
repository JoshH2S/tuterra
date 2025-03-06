
export class CacheManager {
  private cache: Map<string, { data: any; expires: number }>;

  constructor() {
    this.cache = new Map();
  }

  generateKey(request: any): string {
    const keyParts = [
      request.industry,
      request.role,
      request.numberOfQuestions,
      request.categories?.map(c => `${c.name}-${c.weight}`).join(',')
    ];
    return keyParts.join('|');
  }

  async get(key: string): Promise<any> {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  async set(key: string, data: any, duration: number): Promise<void> {
    this.cache.set(key, {
      data,
      expires: Date.now() + duration
    });
  }

  clear(): void {
    this.cache.clear();
  }
}
