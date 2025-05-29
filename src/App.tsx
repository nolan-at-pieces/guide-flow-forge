
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/layout";
import Home from "@/pages/Home";
import DocsPage from "@/pages/DocsPage";
import AuthPage from "@/pages/AuthPage";
import AdminPage from "@/pages/AdminPage";
import { routeConfig } from "@/config/routes";

const queryClient = new QueryClient();

const AppContent = () => {
  const docsPath = routeConfig.urlPrefix ? `/${routeConfig.urlPrefix}/*` : "/*";
  
  return (
    <Routes>
      <Route path="/" element={
        <Layout>
          <Home />
        </Layout>
      } />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path={docsPath} element={<DocsPage />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="docs-ui-theme">
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
