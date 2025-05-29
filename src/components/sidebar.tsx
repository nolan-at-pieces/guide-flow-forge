
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "react-router-dom";

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
    // Mock documentation structure - in a real app, this would be generated from the /docs folder
    const mockDocs: DocItem[] = [
      {
        title: "Getting Started",
        slug: "getting-started",
        order: 1,
        icon: "🚀",
        children: [
          { title: "Installation", slug: "getting-started/installation", order: 1 },
          { title: "Quick Start", slug: "getting-started/quick-start", order: 2 },
        ]
      },
      {
        title: "API Reference",
        slug: "api-reference",
        order: 2,
        icon: "📚",
        children: [
          { title: "Authentication", slug: "api-reference/authentication", order: 1 },
          { title: "Endpoints", slug: "api-reference/endpoints", order: 2 },
        ]
      },
      {
        title: "Examples",
        slug: "examples",
        order: 3,
        icon: "💡",
        children: [
          { title: "Basic Usage", slug: "examples/basic-usage", order: 1 },
          { title: "Advanced", slug: "examples/advanced", order: 2 },
        ]
      }
    ];
    setDocTree(mockDocs);
  }, []);

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
    const isActive = location.pathname === `/docs/${item.slug}`;

    return (
      <div key={item.slug}>
        <div className="flex items-center">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={() => toggleExpanded(item.slug)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-4" />
          )}
          <Link
            to={`/docs/${item.slug}`}
            className={cn(
              "flex-1 rounded-md px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground font-medium",
              level > 0 && "ml-4"
            )}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.title}
          </Link>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map(child => renderDocItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {docTree.map(item => renderDocItem(item))}
    </div>
  );
};

export default Sidebar;
