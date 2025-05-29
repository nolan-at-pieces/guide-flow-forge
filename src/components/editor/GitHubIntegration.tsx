
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Github, GitBranch, Upload, Settings } from 'lucide-react';

interface GitHubIntegrationProps {
  onPublish: (config: GitHubConfig) => Promise<void>;
}

interface GitHubConfig {
  repository: string;
  branch: string;
  token: string;
  basePath: string;
}

const GitHubIntegration = ({ onPublish }: GitHubIntegrationProps) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<GitHubConfig>({
    repository: '',
    branch: 'main',
    token: '',
    basePath: 'docs'
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSaveConfig = () => {
    if (!config.repository || !config.token) {
      toast({
        title: "Error",
        description: "Repository and token are required",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, you'd store this securely
    localStorage.setItem('github-config', JSON.stringify(config));
    setIsConfigured(true);
    
    toast({
      title: "Success",
      description: "GitHub configuration saved",
    });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish(config);
      toast({
        title: "Success",
        description: "Documentation published to GitHub",
      });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          GitHub Integration
        </CardTitle>
        <CardDescription>
          Publish your documentation directly to GitHub repository
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfigured ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Repository</label>
              <Input
                value={config.repository}
                onChange={(e) => setConfig({ ...config, repository: e.target.value })}
                placeholder="username/repository-name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Branch</label>
              <Input
                value={config.branch}
                onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                placeholder="main"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Personal Access Token</label>
              <Input
                type="password"
                value={config.token}
                onChange={(e) => setConfig({ ...config, token: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Base Path</label>
              <Input
                value={config.basePath}
                onChange={(e) => setConfig({ ...config, basePath: e.target.value })}
                placeholder="docs"
              />
            </div>
            
            <Button onClick={handleSaveConfig} className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <GitBranch className="w-3 h-3 mr-1" />
                {config.repository}:{config.branch}
              </Badge>
            </div>
            
            <Button 
              onClick={handlePublish} 
              disabled={isPublishing}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isPublishing ? 'Publishing...' : 'Publish to GitHub'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setIsConfigured(false)}
              size="sm"
            >
              Reconfigure
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GitHubIntegration;
