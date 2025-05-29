
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Plus, Trash2, Save, X } from 'lucide-react';

interface DocContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  description?: string;
  order_index?: number;
  icon?: string;
  tags?: string[];
  is_published: boolean;
}

const AdminPage = () => {
  const { user, isAdmin, isEditor, signOut } = useAuth();
  const { toast } = useToast();
  const [docs, setDocs] = useState<DocContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState<DocContent | null>(null);
  const [newDoc, setNewDoc] = useState<Partial<DocContent>>({
    title: '',
    content: '',
    slug: '',
    description: '',
    is_published: true,
  });

  useEffect(() => {
    if (isAdmin || isEditor) {
      fetchDocs();
    }
  }, [isAdmin, isEditor]);

  const fetchDocs = async () => {
    try {
      const { data, error } = await supabase
        .from('doc_content')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setDocs(data || []);
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

  const handleCreateDoc = async () => {
    if (!newDoc.title || !newDoc.content || !newDoc.slug) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('doc_content')
        .insert([{
          ...newDoc,
          created_by: user?.id,
          updated_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document created successfully",
      });

      setNewDoc({
        title: '',
        content: '',
        slug: '',
        description: '',
        is_published: true,
      });

      fetchDocs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateDoc = async () => {
    if (!editingDoc) return;

    try {
      const { error } = await supabase
        .from('doc_content')
        .update({
          ...editingDoc,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingDoc.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document updated successfully",
      });

      setEditingDoc(null);
      fetchDocs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('doc_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      fetchDocs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin && !isEditor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the admin panel.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={signOut}>Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-gray-600">Manage documentation content</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isAdmin ? "default" : "secondary"}>
              {isAdmin ? "Admin" : "Editor"}
            </Badge>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="docs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="docs">Documents</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="docs" className="space-y-6">
            <div className="grid gap-6">
              {docs.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {doc.icon && <span>{doc.icon}</span>}
                          {doc.title}
                          {!doc.is_published && (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>/{doc.slug}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingDoc(doc)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDoc(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {doc.description && (
                    <CardContent>
                      <p className="text-sm text-gray-600">{doc.description}</p>
                      {doc.tags && (
                        <div className="flex gap-1 mt-2">
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Document</CardTitle>
                <CardDescription>Add a new documentation page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <Input
                      value={newDoc.title || ''}
                      onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                      placeholder="Document title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <Input
                      value={newDoc.slug || ''}
                      onChange={(e) => setNewDoc({...newDoc, slug: e.target.value})}
                      placeholder="document-slug"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={newDoc.description || ''}
                    onChange={(e) => setNewDoc({...newDoc, description: e.target.value})}
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content *</label>
                  <Textarea
                    value={newDoc.content || ''}
                    onChange={(e) => setNewDoc({...newDoc, content: e.target.value})}
                    placeholder="Markdown content"
                    rows={10}
                  />
                </div>
                <Button onClick={handleCreateDoc}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {editingDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Edit Document</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingDoc(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={editingDoc.title}
                      onChange={(e) => setEditingDoc({...editingDoc, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Slug</label>
                    <Input
                      value={editingDoc.slug}
                      onChange={(e) => setEditingDoc({...editingDoc, slug: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Input
                    value={editingDoc.description || ''}
                    onChange={(e) => setEditingDoc({...editingDoc, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    value={editingDoc.content}
                    onChange={(e) => setEditingDoc({...editingDoc, content: e.target.value})}
                    rows={15}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateDoc}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingDoc(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
