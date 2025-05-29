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
  const [scrollProgress, setScrollProgress] = useState(0);

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
        // Find the entry that's most visible
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Get the one closest to the top
          const topEntry = visibleEntries.reduce((prev, current) => 
            prev.boundingClientRect.top < current.boundingClientRect.top ? prev : current
          );
          setActiveId(topEntry.target.id);
        }
      },
      {
        rootMargin: "-10% 0% -70% 0%",
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    // Set up scroll listener for progress tracking
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    // Observe all headings with slight delay to ensure DOM is ready
    const observeHeadings = () => {
      const headings = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]");
      headings.forEach((heading) => observer.observe(heading));
      
      // Set initial active heading
      if (headings.length > 0 && !activeId) {
        setActiveId(headings[0].id);
      }
    };

    const timeoutId = setTimeout(observeHeadings, 100);
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [tocItems, activeId]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getActiveIndex = () => {
    return tocItems.findIndex(item => item.id === activeId);
  };

  if (tocItems.length === 0) return null;

  const activeIndex = getActiveIndex();
  const progressPercentage = activeIndex >= 0 ? ((activeIndex + 1) / tocItems.length) * 100 : 0;

  return (
    <div className="w-64 shrink-0 hidden xl:block">
      <div className="sticky top-24 h-fit">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
            <TableOfContents className="h-4 w-4" />
            On this page
          </div>
          <nav className="relative">
            {/* Background line */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {/* Progress highlight line */}
            <div 
              className="absolute left-2 top-0 w-0.5 bg-primary transition-all duration-300 ease-out"
              style={{
                height: `${scrollProgress}%`
              }}
            ></div>
            
            <div className="space-y-1">
              {tocItems.map((item, index) => {
                const isActive = activeId === item.id;
                
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => scrollToHeading(item.id)}
                      className={cn(
                        "block w-full text-left text-sm py-2 pl-6 pr-4 rounded-r transition-all duration-200 hover:bg-muted/50 relative",
                        isActive 
                          ? "text-primary font-medium bg-primary/10" 
                          : "text-muted-foreground hover:text-foreground",
                        item.level === 1 && "font-medium",
                        item.level === 2 && "pl-8",
                        item.level === 3 && "pl-10 text-xs",
                        item.level === 4 && "pl-12 text-xs",
                        item.level >= 5 && "pl-14 text-xs"
                      )}
                    >
                      {item.text}
                    </button>
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default TableOfContentsComponent;
