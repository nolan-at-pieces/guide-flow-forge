
import { FileX, Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DocNotFoundProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

const DocNotFound = ({ 
  title = "Documentation Not Found",
  description = "The page you're looking for doesn't exist or has been moved.",
  showBackButton = true
}: DocNotFoundProps) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center border-0 shadow-none">
        <CardContent className="pt-8 pb-6">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
            <FileX className="w-8 h-8 text-muted-foreground" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-semibold mb-3 text-foreground">
            {title}
          </h1>
          
          {/* Description */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {description}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showBackButton && (
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            )}
            
            <Button
              onClick={() => window.location.href = '/docs'}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Documentation Home
            </Button>
          </div>
          
          {/* Search Suggestion */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Try searching for what you need
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Trigger the search dialog
                const searchBtn = document.querySelector('[data-search-trigger]') as HTMLElement;
                searchBtn?.click();
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Search className="w-4 h-4" />
              Search Documentation
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
                ⌘K
              </kbd>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocNotFound;
