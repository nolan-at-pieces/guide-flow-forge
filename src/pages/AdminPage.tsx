import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

interface DocContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  description?: string;
  order_index?: number;
  icon?: string;
  tags?: string[];
  is_published?: boolean;
  created_at: string;
  updated_at: string;
}

const AdminPage = () => {
  const { user, isAdmin, isEditor, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [content, setContent] = useState<DocContent[]>([]);
  const [selectedContent, setSelectedContent] = useState<DocContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    description: '',
    order_index: 0,
    icon: '',
    tags: '',
    is_published: true
  });

  // Debug logging
  console.log('AdminPage - user:', user);
  console.log('AdminPage - isAdmin:', isAdmin);
  console.log('AdminPage - isEditor:', isEditor);
  console.log('AdminPage - loading:', loading);

  useEffect(() => {
    // Don't redirect while still loading
    if (loading) return;
    
    if (!user) {
      console.log('No user, redirecting to auth');
      navigate('/auth');
      return;
    }
    
    if (!isAdmin && !isEditor) {
      console.log('User has no admin/editor roles, staying on page but showing message');
      // Don't redirect, just show a message instead
      return;
    }

    fetchContent();
  }, [user, isAdmin, isEditor, navigate, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>You need to sign in to access the admin panel.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/auth')}>
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show role requirement if user doesn't have admin/editor roles
  if (!isAdmin && !isEditor) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You need admin or editor privileges to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Current user: {user.email}</p>
                <p>User ID: {user.id}</p>
                <p>Admin status: {isAdmin ? 'Yes' : 'No'}</p>
                <p>Editor status: {isEditor ? 'Yes' : 'No'}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Go Home
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('doc_content')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setContent(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    try {
      const saveData = {
        slug: formData.slug,
        title: formData.title,
        content: formData.content,
        description: formData.description || null,
        order_index: formData.order_index,
        icon: formData.icon || null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null,
        is_published: formData.is_published,
        updated_by: user?.id,
        ...(isEditing ? {} : { created_by: user?.id })
      };

      if (isEditing && selectedContent) {
        const { error } = await supabase
          .from('doc_content')
          .update(saveData)
          .eq('id', selectedContent.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('doc_content')
          .insert([saveData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: isEditing ? "Content updated successfully!" : "Content created successfully!",
      });

      resetForm();
      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: DocContent) => {
    setSelectedContent(item);
    setFormData({
      slug: item.slug,
      title: item.title,
      content: item.content,
      description: item.description || '',
      order_index: item.order_index || 0,
      icon: item.icon || '',
      tags: item.tags ? item.tags.join(', ') : '',
      is_published: item.is_published ?? true
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const { error } = await supabase
        .from('doc_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content deleted successfully!",
      });

      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      content: '',
      description: '',
      order_index: 0,
      icon: '',
      tags: '',
      is_published: true
    });
    setSelectedContent(null);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.email}</span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList>
            <TabsTrigger value="content">Content Management</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle>{isEditing ? 'Edit Content' : 'Create New Content'}</CardTitle>
                  <CardDescription>
                    {isEditing ? 'Update existing documentation' : 'Add new documentation content'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="getting-started"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Getting Started"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="# Getting Started..."
                      className="min-h-[200px]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Order Index</label>
                      <Input
                        type="number"
                        value={formData.order_index}
                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Icon</label>
                      <Input
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="🚀"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="setup, basics, tutorial"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    />
                    <label htmlFor="is_published" className="text-sm font-medium">Published</label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">
                      {isEditing ? 'Update' : 'Create'}
                    </Button>
                    {isEditing && (
                      <Button variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Content List */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Content</CardTitle>
                  <CardDescription>Manage your documentation content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {content.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-500">/{item.slug}</div>
                          <div className="text-xs text-gray-400">
                            Order: {item.order_index} • {item.is_published ? 'Published' : 'Draft'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
