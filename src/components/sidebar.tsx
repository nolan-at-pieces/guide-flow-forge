
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { routeConfig } from "@/config/routes";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

interface DocItem {
  title: string;
  slug: string;
  order: number;
  icon?: string;
  children?: DocItem[];
  divider?: boolean;
  dividerLabel?: string;
}

interface SidebarProps {
  activeSection: string;
}

// Public GitHub repository configuration
const PUBLIC_GITHUB_CONFIG = {
  repository: "nolan-at-pieces/guide-flow-forge",
  branch: "main",
  basePath: "sample-docs"
};

// Function to fetch file tree from public GitHub repo
const fetchPublicFileTree = async (): Promise<any[]> => {
  const response = await fetch(
    `https://api.github.com/repos/${PUBLIC_GITHUB_CONFIG.repository}/git/trees/${PUBLIC_GITHUB_CONFIG.branch}?recursive=1`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      }
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.tree.filter((file: any) => 
    file.path.startsWith(PUBLIC_GITHUB_CONFIG.basePath) && 
    file.type === 'blob' && 
    file.path.endsWith('.md')
  );
};

// Function to fetch file content from public GitHub repo
const fetchPublicFileContent = async (path: string): Promise<string> => {
  const url = `https://api.github.com/repos/${PUBLIC_GITHUB_CONFIG.repository}/contents/${path}?ref=${PUBLIC_GITHUB_CONFIG.branch}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.encoding === 'base64') {
    return atob(data.content.replace(/\s/g, ''));
  }
  
  return data.content;
};

// Parse frontmatter from content
const parseFrontmatter = (content: string) => {
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  if (!normalizedContent.startsWith('---\n')) {
    return {
      metadata: { title: 'Untitled', order: 0 },
      content: normalizedContent.trim()
    };
  }
  
  const contentAfterFirstDelimiter = normalizedContent.substring(4);
  const endDelimiterIndex = contentAfterFirstDelimiter.indexOf('\n---\n');
  
  if (endDelimiterIndex === -1) {
    return {
      metadata: { title: 'Untitled', order: 0 },
      content: normalizedContent.trim()
    };
  }
  
  const frontmatterSection = contentAfterFirstDelimiter.substring(0, endDelimiterIndex);
  
  const metadata: any = { order: 0 };
  
  const lines = frontmatterSection.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmedLine.substring(0, colonIndex).trim();
      let value = trimmedLine.substring(colonIndex + 1).trim();
      
      value = value.replace(/^["']|["']$/g, '');
      
      if (key === 'order') {
        metadata[key] = parseInt(value) || 0;
      } else {
        metadata[key] = value;
      }
    }
  }
  
  return {
    metadata,
    content: normalizedContent.trim()
  };
};

const Sidebar = ({ activeSection }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [docTree, setDocTree] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { user, isAdmin, isEditor } = useAuth();

  useEffect(() => {
    const loadDocsFromGitHub = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading docs from public GitHub for sidebar...');
        const files = await fetchPublicFileTree();
        const docs: any[] = [];

        // Process all files
        for (const file of files) {
          try {
            const content = await fetchPublicFileContent(file.path);
            const { metadata } = parseFrontmatter(content);
            
            const slug = file.path
              .replace(`${PUBLIC_GITHUB_CONFIG.basePath}/`, '')
              .replace('.md', '');

            const doc = {
              title: metadata.title || slug.replace('-', ' '),
              slug,
              order: metadata.order || 0,
              icon: metadata.icon
            };

            docs.push(doc);
          } catch (error) {
            console.error(`Error processing file ${file.path}:`, error);
          }
        }

        console.log('Loaded docs from GitHub:', docs);
        const tree = buildTreeFromDocs(docs, activeSection);
        setDocTree(tree);
      } catch (err) {
        console.error('Error loading docs from GitHub:', err);
        setError('Failed to load navigation');
        // Fallback to empty state
        setDocTree([]);
      } finally {
        setLoading(false);
      }
    };

    loadDocsFromGitHub();
  }, [activeSection]);

  const buildTreeFromDocs = (docs: any[], section: string): DocItem[] => {
    console.log('Building tree for section:', section, 'with docs:', docs.map(d => `${d.slug} (${d.title})`));
    
    // Filter docs by section and build hierarchy
    const sectionDocs = docs.filter(doc => {
      if (section === 'products') {
        return doc.slug.startsWith('getting-started') || 
               doc.slug.startsWith('examples') ||
               doc.slug.startsWith('troubleshooting') ||
               doc.slug.startsWith('guides');
      } else if (section === 'api') {
        return doc.slug.startsWith('api-reference') || 
               doc.slug.startsWith('sdks') || 
               doc.slug.startsWith('webhooks');
      }
      return false;
    });

    console.log('Filtered docs for section:', sectionDocs.map(d => `${d.slug} (${d.title})`));

    if (sectionDocs.length === 0) {
      return [];
    }

    // Group docs by top-level sections
    const grouped: { [key: string]: DocItem[] } = {};
    
    sectionDocs.forEach(doc => {
      const parts = doc.slug.split('/');
      const topLevel = parts[0];
      
      if (!grouped[topLevel]) {
        grouped[topLevel] = [];
      }

      if (parts.length === 1) {
        // Top-level document
        grouped[topLevel].unshift({
          title: doc.title || topLevel.replace('-', ' '),
          slug: doc.slug,
          order: doc.order || 0,
          icon: doc.icon
        });
      } else {
        // Child document
        grouped[topLevel].push({
          title: doc.title || parts[parts.length - 1].replace('-', ' '),
          slug: doc.slug,
          order: doc.order || 0,
          icon: doc.icon
        });
      }
    });

    console.log('Grouped docs:', grouped);

    // Convert to tree structure
    const tree: DocItem[] = [];
    
    Object.entries(grouped).forEach(([key, items]) => {
      const parent = items.find(item => item.slug === key);
      const children = items.filter(item => item.slug !== key).sort((a, b) => a.order - b.order);
      
      if (parent) {
        tree.push({
          ...parent,
          children: children.length > 0 ? children : undefined
        });
      } else if (children.length > 0) {
        // Create a parent from the first child if no parent exists
        const firstChild = children[0];
        tree.push({
          title: key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' '),
          slug: key,
          order: firstChild.order,
          children: children
        });
      }
    });

    const sortedTree = tree.sort((a, b) => a.order - b.order);
    console.log('Final tree:', sortedTree);
    return sortedTree;
  };

  useEffect(() => {
    // Auto-expand the current section
    const currentSlug = routeConfig.extractSlug(location.pathname);
    const topLevelSection = currentSlug.split('/')[0];
    
    if (topLevelSection) {
      setExpandedItems(new Set([topLevelSection]));
    }
  }, [location]);

  const toggleExpanded = (slug: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(slug)) {
      newExpanded.delete(slug);
    } else {
      newExpanded.add(slug);
    }
    setExpandedItems(newExpanded);
  };

  const renderDocItem = (item: DocItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.slug);
    const fullPath = routeConfig.buildPath(item.slug);
    const isActive = location.pathname === fullPath;
    const isInActivePath = location.pathname.startsWith(`${fullPath}/`);

    return (
      <div key={item.slug} className="space-y-1">
        {/* Render divider with optional label before the item if specified */}
        {item.divider && level === 0 && (
          <div className="py-3">
            {item.dividerLabel && (
              <div className="px-3 pb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {item.dividerLabel}
                </span>
              </div>
            )}
            <Separator className="bg-border" />
          </div>
        )}
        
        <div className="flex items-center">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent mr-2"
              onClick={() => toggleExpanded(item.slug)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}
          <Link
            to={fullPath}
            className={cn(
              "flex-1 block rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
              (isActive || isInActivePath) && "bg-accent text-accent-foreground font-medium",
              level > 0 && "ml-4 text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              {item.icon && <span>{item.icon}</span>}
              {item.title}
            </div>
          </Link>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-6 space-y-1">
            {item.children?.map(child => renderDocItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-3">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3">
        <div className="text-sm text-red-600">
          Error loading navigation: {error}
        </div>
      </div>
    );
  }

  if (docTree.length === 0) {
    return (
      <div className="p-3">
        <div className="text-sm text-muted-foreground">
          No documentation found in the repository.
          {(isAdmin || isEditor) && user && (
            <div className="mt-2">
              <span className="text-xs">Add .md files to the docs folder in your GitHub repository.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-0">
      <nav className="space-y-1">
        {docTree.map(item => renderDocItem(item))}
      </nav>
    </div>
  );
};

export default Sidebar;
