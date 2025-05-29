
import { useState, useEffect, useRef } from "react";
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
  const frameRef = useRef<number>();

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
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        
        if (visibleEntries.length > 0) {
          // Get the entry with the highest intersection ratio that's in the upper half of viewport
          const topEntry = visibleEntries
            .filter(entry => entry.boundingClientRect.top < window.innerHeight / 2)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0] || visibleEntries[0];
          
          setActiveId(topEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0% -60% 0%",
        threshold: [0, 0.1, 0.3, 0.5, 0.7, 1]
      }
    );

    // Smooth scroll progress tracking
    const handleScroll = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        setScrollProgress(Math.min(100, Math.max(0, scrollPercent)));
      });
    };

    // Observe all headings with delay to ensure DOM is ready
    const observeHeadings = () => {
      const headings = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]");
      headings.forEach((heading) => observer.observe(heading));
      
      // Set initial active heading if none is set
      if (headings.length > 0 && !activeId) {
        setActiveId(headings[0].id);
      }
    };

    const timeoutId = setTimeout(observeHeadings, 150);
    
    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [tocItems, activeId]);

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
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-4">
            <TableOfContents className="h-4 w-4" />
            On this page
          </div>
          <nav className="relative">
            {/* Background line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {/* Progress highlight line */}
            <div 
              className="absolute left-0 top-0 w-0.5 bg-primary will-change-transform"
              style={{
                height: `${scrollProgress}%`,
                transition: 'height 150ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            ></div>
            
            <div className="space-y-1">
              {tocItems.map((item) => {
                const isActive = activeId === item.id;
                
                return (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => scrollToHeading(item.id)}
                      className={cn(
                        "block w-full text-left text-sm py-2 pl-4 pr-4 rounded-r relative ml-2 will-change-transform",
                        "transition-all duration-200 ease-out hover:bg-muted/50",
                        isActive 
                          ? "text-primary font-medium bg-primary/8" 
                          : "text-muted-foreground hover:text-foreground",
                        item.level === 1 && "font-medium",
                        item.level === 2 && "pl-6",
                        item.level === 3 && "pl-8 text-xs",
                        item.level === 4 && "pl-10 text-xs",
                        item.level >= 5 && "pl-12 text-xs"
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
