
import { useState } from "react";
import { Menu, Search, Moon, Sun, Monitor, Github, Linkedin, Instagram, Globe, Youtube, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import Sidebar from "@/components/sidebar";
import SearchDialog from "@/components/search-dialog";

interface LayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

const Layout = ({ children, rightSidebar }: LayoutProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="h-4 w-4" />;
    if (theme === "dark") return <Moon className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-6">
                  <a href="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">MP</span>
                    </div>
                    <span className="font-semibold text-lg">MyProject</span>
                  </a>
                </div>
                <div className="px-6 pb-6">
                  <Sidebar />
                </div>
              </SheetContent>
            </Sheet>
            
            <a href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MP</span>
              </div>
              <span className="font-semibold text-lg">MyProject</span>
            </a>
          </div>

          <div className="flex-1 flex justify-center px-6">
            <div className="w-full max-w-lg">
              <Button
                variant="outline"
                className="relative h-9 w-full justify-start text-sm text-muted-foreground hover:bg-accent"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                Search documentation...
                <kbd className="pointer-events-none absolute right-2 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  ⌘K
                </kbd>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {getThemeIcon()}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 border-r">
          <div className="sticky top-16 h-[calc(100vh-4rem)] w-full overflow-auto p-6">
            <Sidebar />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="container max-w-4xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>

        {/* Right Sidebar (TOC) */}
        {rightSidebar && (
          <aside className="hidden xl:flex shrink-0 border-l">
            <div className="sticky top-16 h-[calc(100vh-4rem)] p-6">
              {rightSidebar}
            </div>
          </aside>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Left side - Logo and Pieces button */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <Button variant="ghost" className="text-foreground hover:text-primary" asChild>
                <a href="https://pieces.app" target="_blank" rel="noopener noreferrer">
                  Pieces
                </a>
              </Button>
            </div>
            
            {/* Right side - Social icons and copyright */}
            <div className="flex flex-col items-center space-y-4">
              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    <span className="sr-only">GitHub</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                    <span className="sr-only">LinkedIn</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                    <span className="sr-only">Instagram</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href="https://website.com" target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">Website</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4" />
                    <span className="sr-only">YouTube</span>
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Twitter</span>
                  </a>
                </Button>
              </div>
              
              {/* Copyright */}
              <div className="text-center text-sm text-muted-foreground">
                <p>©2025 • Pieces for Developers</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};

export default Layout;
