
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, FileText, Home, Settings } from 'lucide-react';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import GitHubIntegration from '@/components/editor/GitHubIntegration';
import { useGitHubDocs } from '@/hooks/useGitHubDocs';
import { DocContent } from '@/services/githubApi';

const EditPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isEditor } = useAuth();
  const { toast } = useToast();
  const { service, isConfigured } = useGitHubDocs();
  
  const [docContent, setDocContent] = useState<DocContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewPage, setIsNewPage] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!isAdmin && !isEditor) {
      navigate('/');
      return;
    }

    if (!isConfigured) {
      // Don't navigate automatically, just show the configuration message
      setLoading(false);
      return;
    }

    if (slug === 'new') {
      setIsNewPage(true);
      setDocContent({
        title: '',
        slug: '',
        content: '# New Page\n\nStart writing your content here...',
        description: '',
        tags: [],
        order: 0,
        icon: '',
        path: ''
      });
      setLoading(false);
    } else if (slug && service) {
      fetchDocContent();
    }
  }, [slug, user, isAdmin, isEditor, navigate, service, isConfigured]);

  const fetchDocContent = async () => {
    if (!service || !slug) return;

    try {
      const doc = await service.getDocBySlug(slug);

      if (doc) {
        setDocContent(doc);
      } else {
        // Document not found, create new one
        setIsNewPage(true);
        setDocContent({
          title: '',
          slug: slug,
          content: '# New Page\n\nStart writing your content here...',
          description: '',
          tags: [],
          order: 0,
          icon: '',
          path: `${slug}.md`
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: {
    title: string;
    slug: string;
    content: string;
    description?: string;
    tags?: string[];
  }) => {
    if (!service) {
      toast({
        title: "Error",
        description: "GitHub service not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const saveData: DocContent = {
        ...data,
        order: docContent?.order || 0,
        icon: docContent?.icon || undefined,
        path: `${data.slug}.md`
      };

      await service.createOrUpdateDoc(saveData);
      
      toast({
        title: "Success",
        description: isNewPage ? "Page created successfully!" : "Page updated successfully!",
      });
      
      if (isNewPage) {
        navigate(`/edit/${data.slug}`);
        setIsNewPage(false);
      }

      // Update local state
      setDocContent(prev => prev ? { ...prev, ...data } : null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePublishToGithub = async () => {
    // This is already handled by the save function since we're using GitHub directly
    toast({
      title: "Success",
      description: "Changes are automatically saved to GitHub!",
    });
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>GitHub Configuration Required</CardTitle>
            <CardDescription>
              You need to configure GitHub integration before you can edit documentation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Quick Setup:</strong> Configure your GitHub repository to start editing documentation directly from this interface.
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You'll need:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• A GitHub repository</li>
                <li>• A personal access token</li>
                <li>• Repository write permissions</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate('/admin')} className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configure GitHub Integration
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Back to Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!docContent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Page Not Found</CardTitle>
            <CardDescription>The page you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button variant="outline" onClick={() => navigate('/edit/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="font-medium">
              {isNewPage ? 'New Page' : `Editing: ${docContent?.title || 'Untitled'}`}
            </span>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/edit/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Admin Panel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex h-[calc(100vh-57px)]">
        <div className="flex-1">
          {docContent && (
            <MarkdownEditor
              initialContent={docContent.content}
              initialTitle={docContent.title}
              initialSlug={docContent.slug}
              initialDescription={docContent.description}
              initialTags={docContent.tags}
              onSave={handleSave}
              onPublishToGithub={handlePublishToGithub}
              onBack={handleBack}
              isNewPage={isNewPage}
            />
          )}
        </div>
        
        {/* Right Sidebar - GitHub Integration Info */}
        <div className="w-80 border-l bg-muted/50 p-4 overflow-auto">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">GitHub Integration</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  Changes are automatically saved to your GitHub repository when you click Save.
                </p>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800 font-medium">✓ Connected to GitHub</p>
                  <p className="text-green-700 text-xs mt-1">
                    All changes will be committed directly to your repository.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <GitHubIntegration onPublish={handlePublishToGithub} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPage;
