
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
        // Filter visible entries and sort by position
        const visibleEntries = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        
        if (visibleEntries.length > 0) {
          // Find the entry that's most prominently visible in the viewport
          const viewportHeight = window.innerHeight;
          const topThreshold = viewportHeight * 0.3;
          
          // Prefer entries in the top portion of the viewport
          const topEntry = visibleEntries.find(entry => 
            entry.boundingClientRect.top <= topThreshold && entry.boundingClientRect.top >= -50
          );
          
          if (topEntry) {
            setActiveId(topEntry.target.id);
          } else {
            // Fallback to the first visible entry
            setActiveId(visibleEntries[0].target.id);
          }
        }
      },
      {
        rootMargin: "-10% 0% -70% 0%",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
      }
    );

    // Smooth scroll progress tracking with bounds checking
    const handleScroll = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      frameRef.current = requestAnimationFrame(() => {
        const scrollTop = Math.max(0, window.scrollY);
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Prevent division by zero and ensure valid bounds
        if (docHeight <= 0) {
          setScrollProgress(0);
          return;
        }
        
        const scrollPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
        
        // Only update if the change is significant to prevent jitter
        setScrollProgress(prev => {
          const diff = Math.abs(prev - scrollPercent);
          return diff > 0.1 ? scrollPercent : prev;
        });
      });
    };

    // Observe all headings with delay to ensure DOM is ready
    const observeHeadings = () => {
      const headings = document.querySelectorAll("h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]");
      console.log('Found headings:', Array.from(headings).map(h => ({ id: h.id, text: h.textContent })));
      
      headings.forEach((heading) => observer.observe(heading));
      
      // Set initial active heading based on scroll position with better top handling
      if (headings.length > 0) {
        const scrollTop = window.scrollY;
        
        // If we're at the very top, always highlight the first heading
        if (scrollTop < 100) {
          setActiveId(headings[0].id);
          return;
        }
        
        const viewportTop = scrollTop + window.innerHeight * 0.3;
        let closestHeading = headings[0];
        
        for (const heading of headings) {
          const rect = heading.getBoundingClientRect();
          const elementTop = scrollTop + rect.top;
          
          if (elementTop <= viewportTop) {
            closestHeading = heading;
          } else {
            break;
          }
        }
        
        setActiveId(closestHeading.id);
      }
    };

    const timeoutId = setTimeout(observeHeadings, 200);
    
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
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerHeight = 80; // Account for sticky header
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth"
      });
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
                transition: 'height 0.15s ease-out'
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
                        "transition-all duration-150 ease-out hover:bg-muted/50",
                        isActive 
                          ? "text-primary font-medium bg-primary/10" 
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
