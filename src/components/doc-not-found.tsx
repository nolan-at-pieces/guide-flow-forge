
import { FileQuestion, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const DocNotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <Card className="w-full max-w-md text-center border-0 shadow-none">
        <CardContent className="pt-6 pb-4">
          {/* Icon */}
          <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-muted flex items-center justify-center">
            <FileQuestion className="w-6 h-6 text-muted-foreground" />
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-semibold mb-2 text-foreground">
            Page Not Found
          </h2>
          
          {/* Description */}
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            The documentation page you're looking for doesn't exist. Try browsing the sidebar or search for what you need.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              asChild
              size="sm"
              className="flex items-center gap-2"
            >
              <Link to="/docs/getting-started">
                <Home className="w-4 h-4" />
                Getting Started
              </Link>
            </Button>
            
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Link to="/docs">
                <Search className="w-4 h-4" />
                Browse Docs
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocNotFound;
