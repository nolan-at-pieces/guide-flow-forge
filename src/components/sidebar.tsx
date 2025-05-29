
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { routeConfig } from "@/config/routes";
import { Separator } from "@/components/ui/separator";
import { useGitHubDocs } from "@/hooks/useGitHubDocs";

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

const Sidebar = ({ activeSection }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [docTree, setDocTree] = useState<DocItem[]>([]);
  const location = useLocation();
  const { service, isConfigured } = useGitHubDocs();

  useEffect(() => {
    const buildNavigationFromGitHub = async () => {
      if (!isConfigured || !service) {
        // Use fallback static content when GitHub is not configured
        setDocTree(getFallbackContent(activeSection));
        return;
      }

      try {
        const docs = await service.getAllDocs();
        const tree = buildTreeFromDocs(docs, activeSection);
        setDocTree(tree);
      } catch (error) {
        console.error('Error building navigation:', error);
        // Fallback to static content on error
        setDocTree(getFallbackContent(activeSection));
      }
    };

    buildNavigationFromGitHub();
  }, [service, isConfigured, activeSection]);

  const buildTreeFromDocs = (docs: any[], section: string): DocItem[] => {
    // Filter docs by section and build hierarchy
    const sectionDocs = docs.filter(doc => {
      if (section === 'products') {
        return doc.slug.startsWith('products/') || 
               doc.slug.startsWith('getting-started/') || 
               doc.slug.startsWith('examples/') ||
               doc.slug.startsWith('troubleshooting/') ||
               doc.slug === 'getting-started' ||
               doc.slug === 'examples' ||
               doc.slug === 'troubleshooting';
      } else if (section === 'api') {
        return doc.slug.startsWith('api-reference/') || 
               doc.slug.startsWith('sdks/') || 
               doc.slug.startsWith('webhooks/') ||
               doc.slug === 'api-reference' ||
               doc.slug === 'sdks' ||
               doc.slug === 'webhooks';
      }
      return false;
    });

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
          title: doc.title,
          slug: doc.slug,
          order: doc.order || 0,
          icon: doc.icon
        });
      } else {
        // Child document
        grouped[topLevel].push({
          title: doc.title,
          slug: doc.slug,
          order: doc.order || 0,
          icon: doc.icon
        });
      }
    });

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

    return tree.sort((a, b) => a.order - b.order);
  };

  const getFallbackContent = (section: string): DocItem[] => {
    const sectionContent = {
      products: [
        {
          title: "Getting Started",
          slug: "getting-started",
          order: 1,
          icon: "🚀",
          children: [
            { title: "Installation", slug: "getting-started/installation", order: 1 },
            { title: "Quick Start", slug: "getting-started/quick-start", order: 2 },
            { title: "Configuration", slug: "getting-started/configuration", order: 3 },
          ]
        },
        {
          title: "Examples",
          slug: "examples",
          order: 2,
          children: [
            { title: "Basic Usage", slug: "examples/basic-usage", order: 1 },
            { title: "Advanced", slug: "examples/advanced", order: 2 },
            { title: "Integrations", slug: "examples/integrations", order: 3 },
          ]
        }
      ],
      api: [
        {
          title: "API Reference",
          slug: "api-reference",
          order: 1,
          icon: "📚",
          children: [
            { title: "Authentication", slug: "api-reference/authentication", order: 1 },
            { title: "Endpoints", slug: "api-reference/endpoints", order: 2 },
            { title: "Rate Limits", slug: "api-reference/rate-limits", order: 3 },
          ]
        },
        {
          title: "SDKs",
          slug: "sdks",
          order: 2,
          children: [
            { title: "JavaScript SDK", slug: "sdks/javascript", order: 1 },
            { title: "Python SDK", slug: "sdks/python", order: 2 },
            { title: "Go SDK", slug: "sdks/go", order: 3 },
          ]
        }
      ]
    };

    return sectionContent[activeSection as keyof typeof sectionContent] || [];
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

  return (
    <div className="p-0">
      <nav className="space-y-1">
        {!isConfigured && (
          <div className="px-3 py-2 mb-4 text-xs text-muted-foreground bg-yellow-50 border border-yellow-200 rounded">
            Using fallback navigation. Configure GitHub in admin panel for dynamic content.
          </div>
        )}
        {docTree.map(item => renderDocItem(item))}
      </nav>
    </div>
  );
};

export default Sidebar;
