
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Github, GitBranch, Upload, Settings, CheckCircle } from 'lucide-react';
import { useGitHubDocs } from '@/hooks/useGitHubDocs';

interface GitHubIntegrationProps {
  onPublish: (config: any) => Promise<void>;
}

const GitHubIntegration = ({ onPublish }: GitHubIntegrationProps) => {
  const { toast } = useToast();
  const { config, isConfigured } = useGitHubDocs();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!isConfigured) {
      toast({
        title: "Error",
        description: "GitHub is not configured",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    try {
      await onPublish(config);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish to GitHub",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            GitHub Integration
          </CardTitle>
          <CardDescription>
            GitHub integration not configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configure GitHub integration in the admin panel to enable direct publishing.
            </p>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure in Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription>
          Connected to GitHub repository
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Connected</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <GitBranch className="w-3 h-3 mr-1" />
                {config?.repository}:{config?.branch}
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Docs path: /{config?.basePath}
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="text-blue-800 font-medium">Auto-sync enabled</p>
            <p className="text-blue-700 text-xs mt-1">
              Changes are automatically committed to GitHub when you save.
            </p>
          </div>
          
          <Button 
            onClick={handlePublish} 
            disabled={isPublishing}
            className="w-full"
            variant="outline"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isPublishing ? 'Publishing...' : 'Publish Current Page'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitHubIntegration;
