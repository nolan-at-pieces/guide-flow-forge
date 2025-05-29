interface GitHubConfig {
  repository: string;
  branch: string;
  token: string;
  basePath: string;
}

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content?: string;
  encoding?: string;
}

interface DocMetadata {
  title: string;
  description?: string;
  order?: number;
  icon?: string;
  tags?: string[];
  slug: string;
}

interface DocContent extends DocMetadata {
  content: string;
  path: string;
  sha?: string;
}

export class GitHubDocsService {
  private config: GitHubConfig;
  private cache: Map<string, DocContent> = new Map();
  private lastCommitSha: string | null = null;
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      // Preload all docs immediately
      await this.getAllDocs();
      this.initialized = true;
      this.startPolling();
    } catch (error) {
      console.error('Failed to initialize GitHub service:', error);
      this.startPolling(); // Still start polling even if initial load fails
    }
  }

  private getApiUrl(path: string): string {
    return `https://api.github.com/repos/${this.config.repository}/contents/${this.config.basePath}/${path}?ref=${this.config.branch}`;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `token ${this.config.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  private parseFrontmatter(content: string): { metadata: DocMetadata; content: string } {
    // More robust frontmatter regex that handles different line endings
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      console.log('No frontmatter found in content');
      // No frontmatter found, return content as-is with default metadata
      return {
        metadata: { title: 'Untitled', slug: '' },
        content: content.trim()
      };
    }

    const frontmatter = match[1];
    const markdownContent = match[2].trim(); // This is the content WITHOUT frontmatter
    
    console.log('Frontmatter section:', frontmatter);
    console.log('Markdown content length:', markdownContent.length);
    
    const metadata: any = {};
    
    // Parse YAML-style frontmatter more carefully
    const lines = frontmatter.split(/\r?\n/);
    let currentKey = '';
    let inArray = false;
    let arrayItems: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Handle array continuation
      if (inArray && trimmedLine.startsWith('- ')) {
        const item = trimmedLine.substring(2).trim();
        // Remove quotes if present
        arrayItems.push(item.replace(/^["']|["']$/g, ''));
        continue;
      } else if (inArray && !trimmedLine.startsWith('- ')) {
        // End of array
        metadata[currentKey] = arrayItems;
        inArray = false;
        arrayItems = [];
      }
      
      // Handle key-value pairs
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmedLine.substring(0, colonIndex).trim();
        let value = trimmedLine.substring(colonIndex + 1).trim();
        
        if (!value) {
          // This might be the start of an array
          currentKey = key;
          inArray = true;
          arrayItems = [];
          continue;
        }
        
        // Handle inline arrays [item1, item2]
        if (value.startsWith('[') && value.endsWith(']')) {
          const arrayContent = value.slice(1, -1);
          if (arrayContent.trim()) {
            metadata[key] = arrayContent.split(',').map(item => 
              item.trim().replace(/^["']|["']$/g, '')
            );
          } else {
            metadata[key] = [];
          }
          continue;
        }
        
        // Remove quotes and handle special values
        value = value.replace(/^["']|["']$/g, '');
        
        if (key === 'order') {
          metadata[key] = parseInt(value) || 0;
        } else {
          metadata[key] = value;
        }
      }
    }
    
    // Handle any remaining array
    if (inArray && arrayItems.length > 0) {
      metadata[currentKey] = arrayItems;
    }

    console.log('Parsed frontmatter metadata:', metadata);
    console.log('Final content starts with:', markdownContent.substring(0, 100));

    return {
      metadata: metadata as DocMetadata,
      content: markdownContent // Return ONLY the markdown content without frontmatter
    };
  }

  private createFrontmatter(metadata: DocMetadata): string {
    const lines = ['---'];
    lines.push(`title: "${metadata.title}"`);
    if (metadata.description) lines.push(`description: "${metadata.description}"`);
    if (metadata.order !== undefined) lines.push(`order: ${metadata.order}`);
    if (metadata.icon) lines.push(`icon: "${metadata.icon}"`);
    if (metadata.tags && metadata.tags.length > 0) {
      lines.push(`tags: [${metadata.tags.map(tag => `"${tag}"`).join(', ')}]`);
    }
    lines.push('---');
    return lines.join('\n') + '\n\n';
  }

  async getFileTree(): Promise<GitHubFile[]> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.config.repository}/git/trees/${this.config.branch}?recursive=1`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tree.filter((file: any) => 
        file.path.startsWith(this.config.basePath) && 
        file.type === 'blob' && 
        file.path.endsWith('.md')
      );
    } catch (error) {
      console.error('Error fetching file tree:', error);
      throw error;
    }
  }

  async getFileContent(path: string): Promise<string> {
    try {
      const response = await fetch(this.getApiUrl(path), {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.encoding === 'base64') {
        return atob(data.content.replace(/\s/g, ''));
      }
      
      return data.content;
    } catch (error) {
      console.error(`Error fetching content for ${path}:`, error);
      throw error;
    }
  }

  async getDocBySlug(slug: string): Promise<DocContent | null> {
    // Return from cache if available
    if (this.cache.has(slug)) {
      return this.cache.get(slug) || null;
    }

    // If not in cache and not initialized, try to fetch
    if (!this.initialized) {
      try {
        const filePath = slug.endsWith('.md') ? slug : `${slug}.md`;
        const content = await this.getFileContent(filePath);
        const { metadata, content: markdownContent } = this.parseFrontmatter(content);
        
        const doc = {
          ...metadata,
          slug,
          content: markdownContent,
          path: filePath
        };

        this.cache.set(slug, doc);
        return doc;
      } catch (error) {
        console.error(`Error getting doc ${slug}:`, error);
        return null;
      }
    }

    return null;
  }

  async getAllDocs(): Promise<DocContent[]> {
    try {
      const files = await this.getFileTree();
      const docs: DocContent[] = [];

      // Process all files concurrently for better performance
      const filePromises = files.map(async (file) => {
        try {
          const content = await this.getFileContent(file.path.replace(`${this.config.basePath}/`, ''));
          const { metadata, content: markdownContent } = this.parseFrontmatter(content);
          
          const slug = file.path
            .replace(`${this.config.basePath}/`, '')
            .replace('.md', '');

          const doc = {
            ...metadata,
            slug,
            content: markdownContent,
            path: file.path,
            sha: file.sha
          };

          // Ensure title is set
          if (!doc.title || doc.title === 'Untitled') {
            doc.title = slug.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Untitled';
          }

          console.log(`Processed doc: ${slug} -> ${doc.title}, tags:`, doc.tags);
          return doc;
        } catch (error) {
          console.error(`Error processing file ${file.path}:`, error);
          return null;
        }
      });

      const results = await Promise.all(filePromises);
      docs.push(...results.filter(doc => doc !== null) as DocContent[]);

      // Update cache with all docs
      this.cache.clear();
      docs.forEach(doc => this.cache.set(doc.slug, doc));

      console.log(`Loaded ${docs.length} docs from GitHub:`, docs.map(d => `${d.slug} (${d.title})`));
      return docs.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error('Error getting all docs:', error);
      throw error;
    }
  }

  async createOrUpdateDoc(doc: DocContent): Promise<void> {
    try {
      const filePath = doc.path || `${doc.slug}.md`;
      const fullContent = this.createFrontmatter(doc) + doc.content;
      
      // Get current file to check if it exists
      let sha: string | undefined;
      try {
        const response = await fetch(this.getApiUrl(filePath), {
          headers: this.getHeaders()
        });
        if (response.ok) {
          const existingFile = await response.json();
          sha = existingFile.sha;
        }
      } catch (error) {
        // File doesn't exist, that's fine
      }

      const payload: any = {
        message: `${sha ? 'Update' : 'Create'} ${doc.title}`,
        content: btoa(unescape(encodeURIComponent(fullContent))),
        branch: this.config.branch
      };

      if (sha) {
        payload.sha = sha;
      }

      const response = await fetch(this.getApiUrl(filePath), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to save ${filePath}: ${response.statusText}`);
      }

      // Update cache and notify listeners
      this.cache.set(doc.slug, doc);
      this.notifyListeners();
    } catch (error) {
      console.error('Error creating/updating doc:', error);
      throw error;
    }
  }

  async deleteDoc(path: string): Promise<void> {
    try {
      // Get current file SHA
      const response = await fetch(this.getApiUrl(path), {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`File not found: ${path}`);
      }

      const file = await response.json();

      const deleteResponse = await fetch(this.getApiUrl(path), {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify({
          message: `Delete ${path}`,
          sha: file.sha,
          branch: this.config.branch
        })
      });

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete ${path}: ${deleteResponse.statusText}`);
      }

      // Update cache and notify listeners
      const slug = path.replace('.md', '');
      this.cache.delete(slug);
      this.notifyListeners();
    } catch (error) {
      console.error('Error deleting doc:', error);
      throw error;
    }
  }

  // Real-time polling functionality
  private async checkForUpdates(): Promise<void> {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.config.repository}/branches/${this.config.branch}`,
        { headers: this.getHeaders() }
      );

      if (response.ok) {
        const data = await response.json();
        const currentSha = data.commit.sha;
        
        if (this.lastCommitSha && this.lastCommitSha !== currentSha) {
          console.log('GitHub repository updated, refreshing docs...');
          await this.getAllDocs(); // This will update the cache
          this.notifyListeners();
        }
        
        this.lastCommitSha = currentSha;
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  private startPolling(): void {
    // Poll every 30 seconds for changes
    setInterval(() => {
      this.checkForUpdates();
    }, 30000);
    
    // Initial check
    this.checkForUpdates();
  }

  // Listener management for real-time updates
  addListener(callback: () => void): void {
    this.listeners.add(callback);
  }

  removeListener(callback: () => void): void {
    this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  getCachedDocs(): DocContent[] {
    return Array.from(this.cache.values()).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const createGitHubService = (config: GitHubConfig): GitHubDocsService => {
  return new GitHubDocsService(config);
};

export type { GitHubConfig, DocContent, DocMetadata };
