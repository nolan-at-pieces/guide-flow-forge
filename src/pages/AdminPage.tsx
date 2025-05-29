
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useGitHubDocs, useGitHubDocsList } from '@/hooks/useGitHubDocs';
import { DocContent, GitHubConfig } from '@/services/githubApi';
import { Github, Settings, FileText, Plus } from 'lucide-react';

const AdminPage = () => {
  const { user, isAdmin, isEditor, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // GitHub integration
  const { service, config, isConfigured, saveConfig, clearConfig } = useGitHubDocs();
  const { docs, loading: docsLoading, error: docsError, refetch } = useGitHubDocsList();
  
  // GitHub configuration state
  const [gitHubConfig, setGitHubConfig] = useState<GitHubConfig>({
    repository: '',
    branch: 'main',
    token: '',
    basePath: 'docs'
  });

  // Document editing state
  const [selectedDoc, setSelectedDoc] = useState<DocContent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    content: '',
    description: '',
    order: 0,
    icon: '',
    tags: ''
  });

  // Debug logging
  console.log('AdminPage - user:', user);
  console.log('AdminPage - isAdmin:', isAdmin);
  console.log('AdminPage - isEditor:', isEditor);
  console.log('AdminPage - loading:', loading);

  useEffect(() => {
    // Load existing config on mount
    if (config) {
      setGitHubConfig(config);
    }
  }, [config]);

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
      return;
    }
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

  const handleSaveGitHubConfig = () => {
    if (!gitHubConfig.repository || !gitHubConfig.token) {
      toast({
        title: "Error",
        description: "Repository and token are required",
        variant: "destructive",
      });
      return;
    }

    saveConfig(gitHubConfig);
    toast({
      title: "Success",
      description: "GitHub configuration saved successfully!",
    });
  };

  const handleSaveDoc = async () => {
    if (!service) {
      toast({
        title: "Error",
        description: "GitHub is not configured",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim() || !formData.slug.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Title, slug, and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const docData: DocContent = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: formData.content.trim(),
        description: formData.description.trim() || undefined,
        order: formData.order,
        icon: formData.icon.trim() || undefined,
        tags: formData.tags.trim() ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
        path: `${formData.slug.trim()}.md`
      };

      await service.createOrUpdateDoc(docData);

      toast({
        title: "Success",
        description: isEditing ? "Document updated successfully!" : "Document created successfully!",
      });

      resetForm();
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditDoc = (doc: DocContent) => {
    setSelectedDoc(doc);
    setFormData({
      slug: doc.slug,
      title: doc.title,
      content: doc.content,
      description: doc.description || '',
      order: doc.order || 0,
      icon: doc.icon || '',
      tags: doc.tags ? doc.tags.join(', ') : ''
    });
    setIsEditing(true);
  };

  const handleDeleteDoc = async (doc: DocContent) => {
    if (!service || !doc.path) return;

    if (!confirm(`Are you sure you want to delete "${doc.title}"?`)) return;

    try {
      await service.deleteDoc(doc.path.replace(`${config?.basePath}/`, ''));
      
      toast({
        title: "Success",
        description: "Document deleted successfully!",
      });

      refetch();
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
      order: 0,
      icon: '',
      tags: ''
    });
    setSelectedDoc(null);
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

        <Tabs defaultValue="github" className="w-full">
          <TabsList>
            <TabsTrigger value="github">GitHub Configuration</TabsTrigger>
            <TabsTrigger value="content" disabled={!isConfigured}>
              Content Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="github" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  GitHub Integration
                </CardTitle>
                <CardDescription>
                  Configure GitHub repository for documentation storage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isConfigured ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Repository</label>
                      <Input
                        value={gitHubConfig.repository}
                        onChange={(e) => setGitHubConfig({ ...gitHubConfig, repository: e.target.value })}
                        placeholder="username/repository-name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Branch</label>
                      <Input
                        value={gitHubConfig.branch}
                        onChange={(e) => setGitHubConfig({ ...gitHubConfig, branch: e.target.value })}
                        placeholder="main"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Personal Access Token</label>
                      <Input
                        type="password"
                        value={gitHubConfig.token}
                        onChange={(e) => setGitHubConfig({ ...gitHubConfig, token: e.target.value })}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Docs Folder Path</label>
                      <Input
                        value={gitHubConfig.basePath}
                        onChange={(e) => setGitHubConfig({ ...gitHubConfig, basePath: e.target.value })}
                        placeholder="docs"
                      />
                    </div>
                    
                    <Button onClick={handleSaveGitHubConfig} className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Save Configuration
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-green-800">GitHub Configured</h3>
                          <p className="text-sm text-green-700">
                            Repository: {config?.repository} (branch: {config?.branch})
                          </p>
                          <p className="text-sm text-green-700">
                            Docs Path: /{config?.basePath}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={clearConfig}
                        >
                          Reconfigure
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {isEditing ? 'Edit Document' : 'Create New Document'}
                  </CardTitle>
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
                      className="min-h-[200px] font-mono"
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
                      <label className="block text-sm font-medium mb-1">Order</label>
                      <Input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
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
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSaveDoc} className="flex-1">
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

              {/* Documents List */}
              <Card>
                <CardHeader>
                  <CardTitle>GitHub Documents</CardTitle>
                  <CardDescription>Manage your documentation stored in GitHub</CardDescription>
                </CardHeader>
                <CardContent>
                  {docsLoading ? (
                    <div className="text-center py-4">Loading documents...</div>
                  ) : docsError ? (
                    <div className="text-center py-4 text-red-500">Error: {docsError}</div>
                  ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {docs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No documents found</p>
                          <p className="text-sm">Create your first document above</p>
                        </div>
                      ) : (
                        docs.map((doc) => (
                          <div key={doc.slug} className="flex items-center justify-between p-3 border rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {doc.icon && <span>{doc.icon}</span>}
                                <div className="font-medium">{doc.title}</div>
                              </div>
                              <div className="text-sm text-gray-500">/{doc.slug}</div>
                              <div className="text-xs text-gray-400">
                                Order: {doc.order || 0}
                                {doc.tags && doc.tags.length > 0 && (
                                  <span> • Tags: {doc.tags.join(', ')}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleEditDoc(doc)}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleDeleteDoc(doc)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
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
