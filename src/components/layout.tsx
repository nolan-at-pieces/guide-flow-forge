
import { useState, useEffect } from "react";
import TopNav from "@/components/top-nav";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

const Layout = ({ children, rightSidebar }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("products");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sticky Sidebar Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSidebar}
        className={cn(
          "fixed top-4 z-50 transition-all duration-200",
          sidebarOpen ? "left-[280px]" : "left-4",
          isMobile && sidebarOpen && "left-4"
        )}
      >
        {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-background border-r transition-transform duration-200 z-40",
          "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <TopNav activeSection={activeSection} onSectionChange={handleSectionChange} />
          <div className="flex-1 overflow-auto">
            <Sidebar activeSection={activeSection} />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 flex transition-all duration-200",
          sidebarOpen && !isMobile ? "ml-72" : "ml-0"
        )}
      >
        <div className="flex-1 flex flex-col min-h-screen">
          <div className="flex-1 p-6 pt-16">
            {children}
          </div>
        </div>

        {/* Right Sidebar */}
        {rightSidebar && (
          <aside className="w-64 border-l bg-muted/30 p-4 overflow-auto hidden lg:block">
            {rightSidebar}
          </aside>
        )}
      </main>
    </div>
  );
};

export default Layout;
