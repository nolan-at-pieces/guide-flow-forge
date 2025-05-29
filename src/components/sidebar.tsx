import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";
import { routeConfig } from "@/config/routes";

interface DocItem {
  title: string;
  slug: string;
  order: number;
  icon?: string;
  children?: DocItem[];
}

const Sidebar = () => {
  const [docTree, setDocTree] = useState<DocItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const location = useLocation();

  useEffect(() => {
    // Mock documentation structure
    const mockDocs: DocItem[] = [
      {
        title: "Products",
        slug: "products",
        order: 1,
        children: [
          { title: "Overview", slug: "products/overview", order: 1 },
          { title: "Features", slug: "products/features", order: 2 },
        ]
      },
      {
        title: "Getting Started",
        slug: "getting-started",
        order: 2,
        children: [
          { title: "Installation", slug: "getting-started/installation", order: 1 },
          { title: "Quick Start", slug: "getting-started/quick-start", order: 2 },
          { title: "Configuration", slug: "getting-started/configuration", order: 3 },
        ]
      },
      {
        title: "API Reference",
        slug: "api-reference",
        order: 3,
        children: [
          { title: "Authentication", slug: "api-reference/authentication", order: 1 },
          { title: "Endpoints", slug: "api-reference/endpoints", order: 2 },
          { title: "Rate Limits", slug: "api-reference/rate-limits", order: 3 },
        ]
      },
      {
        title: "Examples",
        slug: "examples",
        order: 4,
        children: [
          { title: "Basic Usage", slug: "examples/basic-usage", order: 1 },
          { title: "Advanced", slug: "examples/advanced", order: 2 },
          { title: "Integrations", slug: "examples/integrations", order: 3 },
        ]
      },
      {
        title: "Troubleshooting",
        slug: "troubleshooting",
        order: 5,
        children: [
          { title: "Common Issues", slug: "troubleshooting/common-issues", order: 1 },
          { title: "Debug Mode", slug: "troubleshooting/debug-mode", order: 2 },
        ]
      }
    ];
    setDocTree(mockDocs);
    
    // Auto-expand the current section using route config
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
            {item.title}
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
    <div className="space-y-2">
      <div className="pb-4">
        <nav className="space-y-1">
          {docTree.map(item => renderDocItem(item))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
