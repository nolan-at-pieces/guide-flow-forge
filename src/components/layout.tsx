
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './top-nav';
import Sidebar from './sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Hide sidebar on edit pages
  useEffect(() => {
    const isEditPage = location.pathname.startsWith('/edit');
    setSidebarVisible(!isEditPage);
    if (isEditPage) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Determine active section based on current route
    const path = location.pathname;
    if (path.startsWith('/api') || path.includes('api-reference') || path.includes('sdks') || path.includes('webhooks')) {
      setActiveSection('api');
    } else {
      setActiveSection('products');
    }
  }, [location]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
      />
      
      <div className="flex">
        {/* Collapsible Sidebar */}
        {sidebarVisible && (
          <>
            {/* Sidebar */}
            <div className={`transition-all duration-300 ease-in-out ${
              sidebarOpen ? 'w-80' : 'w-0'
            } overflow-hidden border-r bg-background`}>
              <div className="w-80">
                <Sidebar activeSection={activeSection} />
              </div>
            </div>
            
            {/* Sticky Sidebar Toggle Button */}
            <div className="fixed top-1/2 left-0 transform -translate-y-1/2 z-50">
              <Button
                onClick={toggleSidebar}
                variant="outline"
                size="sm"
                className={`transition-all duration-300 ease-in-out rounded-l-none rounded-r-md shadow-lg ${
                  sidebarOpen ? 'translate-x-80' : 'translate-x-0'
                }`}
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </>
        )}
        
        {/* Main Content */}
        <main className={`flex-1 ${sidebarVisible && sidebarOpen ? 'ml-0' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
