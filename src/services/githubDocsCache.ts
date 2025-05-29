
import { DocContent } from '@/services/githubApi';

const CACHE_KEY = 'github-docs-cache';
const CACHE_TIMESTAMP_KEY = 'github-docs-cache-timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class GitHubDocsCache {
  static getCachedDocs(): DocContent[] | null {
    try {
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (!timestamp) return null;
      
      const cacheTime = parseInt(timestamp);
      if (Date.now() - cacheTime > CACHE_DURATION) {
        this.clearCache();
        return null;
      }
      
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }
  
  static setCachedDocs(docs: DocContent[]): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(docs));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }
  
  static clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  }
  
  static isCacheValid(): boolean {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const cacheTime = parseInt(timestamp);
    return Date.now() - cacheTime <= CACHE_DURATION;
  }
}
