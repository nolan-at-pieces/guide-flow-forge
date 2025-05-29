
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, FileText } from 'lucide-react';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import GitHubIntegration from '@/components/editor/GitHubIntegration';

interface DocContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  description?: string;
  tags?: string[];
  order_index?: number;
  icon?: string;
  is_published?: boolean;
}

const EditPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isEditor } = useAuth();
  const { toast } = useToast();
  
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

    if (slug === 'new') {
      setIsNewPage(true);
      setDocContent({
        id: '',
        slug: '',
        title: '',
        content: '# New Page\n\nStart writing your content here...',
        description: '',
        tags: [],
        order_index: 0,
        icon: '',
        is_published: false
      });
      setLoading(false);
    } else if (slug) {
      fetchDocContent();
    }
  }, [slug, user, isAdmin, isEditor, navigate]);

  const fetchDocContent = async () => {
    try {
      const { data, error } = await supabase
        .from('doc_content')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Document not found, create new one
          setIsNewPage(true);
          setDocContent({
            id: '',
            slug: slug || '',
            title: '',
            content: '# New Page\n\nStart writing your content here...',
            description: '',
            tags: [],
            order_index: 0,
            icon: '',
            is_published: false
          });
        } else {
          throw error;
        }
      } else {
        setDocContent(data);
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
    try {
      const saveData = {
        ...data,
        order_index: docContent?.order_index || 0,
        icon: docContent?.icon || null,
        is_published: docContent?.is_published ?? true,
        updated_by: user?.id,
        ...(isNewPage ? { created_by: user?.id } : {})
      };

      if (isNewPage) {
        const { error } = await supabase
          .from('doc_content')
          .insert([saveData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Page created successfully!",
        });
        
        navigate(`/edit/${data.slug}`);
        setIsNewPage(false);
      } else {
        const { error } = await supabase
          .from('doc_content')
          .update(saveData)
          .eq('id', docContent?.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Page updated successfully!",
        });
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

  const handlePublishToGithub = async (config: any) => {
    // In a real implementation, this would use GitHub API
    // For now, we'll just simulate the process
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate for demo
          resolve();
        } else {
          reject(new Error('GitHub API error'));
        }
      }, 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
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
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
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
          <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Docs
          </Button>
          
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="font-medium">
              {isNewPage ? 'New Page' : `Editing: ${docContent.title || 'Untitled'}`}
            </span>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/edit/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex h-[calc(100vh-57px)]">
        <div className="flex-1">
          <MarkdownEditor
            initialContent={docContent.content}
            initialTitle={docContent.title}
            initialSlug={docContent.slug}
            initialDescription={docContent.description}
            initialTags={docContent.tags}
            onSave={handleSave}
            onPublishToGithub={() => handlePublishToGithub({})}
            isNewPage={isNewPage}
          />
        </div>
        
        {/* Right Sidebar - GitHub Integration */}
        <div className="w-80 border-l bg-muted/50 p-4 overflow-auto">
          <GitHubIntegration onPublish={handlePublishToGithub} />
        </div>
      </div>
    </div>
  );
};

export default EditPage;
