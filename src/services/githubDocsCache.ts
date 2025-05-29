
interface CachedDoc {
  content: string;
  title: string;
  description?: string;
  order: number;
  icon?: string;
  tags?: string[];
  slug: string;
  lastFetched: number;
}

interface DocsCache {
  [slug: string]: CachedDoc;
}

class GitHubDocsCache {
  private cache: DocsCache = {};
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_KEY = 'github-docs-cache';
  private readonly PUBLIC_GITHUB_CONFIG = {
    repository: "nolan-at-pieces/guide-flow-forge",
    branch: "main",
    basePath: "sample-docs"
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        this.cache = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load docs cache from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.cache));
    } catch (error) {
      console.error('Failed to save docs cache to storage:', error);
    }
  }

  private isExpired(doc: CachedDoc): boolean {
    return Date.now() - doc.lastFetched > this.CACHE_DURATION;
  }

  private async fetchFromGitHub(slug: string): Promise<string> {
    const filePath = slug.endsWith('.md') ? slug : `${slug}.md`;
    const url = `https://api.github.com/repos/${this.PUBLIC_GITHUB_CONFIG.repository}/contents/${this.PUBLIC_GITHUB_CONFIG.basePath}/${filePath}?ref=${this.PUBLIC_GITHUB_CONFIG.branch}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DocSite/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${slug}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.encoding === 'base64') {
      return atob(data.content.replace(/\s/g, ''));
    }
    
    return data.content;
  }

  private parseFrontmatter(content: string) {
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    if (!normalizedContent.startsWith('---\n')) {
      return {
        metadata: { title: 'Untitled', order: 0 },
        content: normalizedContent.trim()
      };
    }
    
    const lines = normalizedContent.split('\n');
    let frontmatterEndIndex = -1;
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        frontmatterEndIndex = i;
        break;
      }
    }
    
    if (frontmatterEndIndex === -1) {
      return {
        metadata: { title: 'Untitled', order: 0 },
        content: normalizedContent.trim()
      };
    }
    
    const frontmatterLines = lines.slice(1, frontmatterEndIndex);
    let contentStartIndex = frontmatterEndIndex + 1;
    while (contentStartIndex < lines.length && lines[contentStartIndex].trim() === '') {
      contentStartIndex++;
    }
    const contentLines = lines.slice(contentStartIndex);
    const cleanContent = contentLines.join('\n').trim();
    
    const metadata: any = { order: 0 };
    
    for (const line of frontmatterLines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmedLine.substring(0, colonIndex).trim();
        let value = trimmedLine.substring(colonIndex + 1).trim();
        
        value = value.replace(/^["']|["']$/g, '');
        
        if (key === 'order') {
          metadata[key] = parseInt(value) || 0;
        } else if (key === 'tags') {
          if (value.startsWith('[') && value.endsWith(']')) {
            const arrayContent = value.slice(1, -1);
            metadata[key] = arrayContent.split(',').map(item => 
              item.trim().replace(/^["']|["']$/g, '')
            );
          } else {
            metadata[key] = [value];
          }
        } else {
          metadata[key] = value;
        }
      }
    }
    
    return {
      metadata,
      content: cleanContent
    };
  }

  async getDoc(slug: string): Promise<CachedDoc | null> {
    // Check cache first
    const cached = this.cache[slug];
    if (cached && !this.isExpired(cached)) {
      return cached;
    }

    try {
      const content = await this.fetchFromGitHub(slug);
      const { metadata, content: markdownContent } = this.parseFrontmatter(content);
      
      const doc: CachedDoc = {
        content: markdownContent,
        title: metadata.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: metadata.description,
        order: metadata.order || 0,
        icon: metadata.icon,
        tags: metadata.tags,
        slug,
        lastFetched: Date.now()
      };

      this.cache[slug] = doc;
      this.saveToStorage();
      
      return doc;
    } catch (error) {
      console.error(`Failed to fetch doc ${slug}:`, error);
      return cached || null;
    }
  }

  getAllCachedDocs(): CachedDoc[] {
    return Object.values(this.cache);
  }

  clearCache() {
    this.cache = {};
    localStorage.removeItem(this.CACHE_KEY);
  }

  // Preload common docs
  async preloadCommonDocs() {
    const commonSlugs = [
      'getting-started',
      'getting-started/installation',
      'api-reference',
      'examples',
      'examples/basic-usage',
      'examples/advanced',
      'troubleshooting'
    ];

    const promises = commonSlugs.map(slug => this.getDoc(slug).catch(() => null));
    await Promise.all(promises);
  }
}

export const githubDocsCache = new GitHubDocsCache();
