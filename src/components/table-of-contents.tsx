
import { useState, useEffect } from "react";
import { TableOfContents } from "lucide-react";
import { cn } from "@/lib/utils";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

const TableOfContentsComponent = ({ content }: TableOfContentsProps) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from content
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      items.push({
        id,
        text,
        level
      });
    }

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    // Set up intersection observer to track active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0% -80% 0%",
        threshold: 0
      }
    );

    // Observe all headings
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((heading) => observer.observe(heading));

    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <div className="w-64 shrink-0 hidden xl:block">
      <div className="sticky top-24 h-fit">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
            <TableOfContents className="h-4 w-4" />
            On this page
          </div>
          <nav className="space-y-1">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToHeading(item.id)}
                className={cn(
                  "block w-full text-left text-sm py-1.5 px-2 rounded transition-colors hover:bg-muted/50",
                  activeId === item.id 
                    ? "text-primary font-medium bg-muted" 
                    : "text-muted-foreground hover:text-foreground",
                  item.level === 1 && "font-medium",
                  item.level === 2 && "pl-4",
                  item.level === 3 && "pl-6 text-xs",
                  item.level === 4 && "pl-8 text-xs",
                  item.level >= 5 && "pl-10 text-xs"
                )}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TableOfContentsComponent;
