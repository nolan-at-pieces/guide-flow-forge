
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocErrorProps {
  title?: string;
  description?: string;
  error?: string;
  showRefresh?: boolean;
}

const DocError = ({ 
  title = "Something went wrong",
  description = "An error occurred while loading this documentation page.",
  error,
  showRefresh = true
}: DocErrorProps) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-lg text-center border-0 shadow-none">
        <CardContent className="pt-8 pb-6">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-semibold mb-3 text-foreground">
            {title}
          </h1>
          
          {/* Description */}
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>
          
          {/* Error Details */}
          {error && (
            <Alert className="mb-6 text-left">
              <Bug className="h-4 w-4" />
              <AlertDescription className="font-mono text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showRefresh && (
              <Button
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/docs'}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Documentation Home
            </Button>
          </div>
          
          {/* Help Text */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              If this problem persists, please check your internet connection or contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocError;
