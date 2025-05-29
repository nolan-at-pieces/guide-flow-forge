
// Configuration for URL routing
export const routeConfig = {
  // Set your desired URL prefix here
  // Examples: 
  // "" - no prefix (current setup)
  // "docs" - adds /docs/ prefix
  // "help" - adds /help/ prefix
  // "guide" - adds /guide/ prefix
  urlPrefix: "",
  
  // Helper function to build full paths
  buildPath: (slug: string) => {
    const prefix = routeConfig.urlPrefix;
    if (!prefix) return `/${slug}`;
    return `/${prefix}/${slug}`;
  },
  
  // Helper function to extract slug from current path
  extractSlug: (pathname: string) => {
    const prefix = routeConfig.urlPrefix;
    if (!prefix) {
      return pathname.slice(1); // Remove leading slash
    }
    
    const prefixPath = `/${prefix}/`;
    if (pathname.startsWith(prefixPath)) {
      return pathname.slice(prefixPath.length);
    }
    
    return pathname.slice(1);
  },
  
  // Helper function to check if path matches docs routes
  isDocsRoute: (pathname: string) => {
    const prefix = routeConfig.urlPrefix;
    if (!prefix) {
      // If no prefix, any non-root path is a docs route
      return pathname !== "/";
    }
    
    return pathname.startsWith(`/${prefix}/`);
  }
};
