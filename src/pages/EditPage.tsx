
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
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
      toast({
        title: "GitHub Not Configured",
        description: "Please configure GitHub integration in the admin panel first.",
        variant: "destructive",
      });
      navigate('/admin');
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
    navigate(-1);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>GitHub Not Configured</CardTitle>
            <CardDescription>Configure GitHub integration in the admin panel first.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Admin Panel
            </Button>
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
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => navigate('/')}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Editor */}
      <div className="h-screen">
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
    </div>
  );
};

export default EditPage;
