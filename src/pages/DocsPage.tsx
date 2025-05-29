import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Plus, Github } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGitHubDocsList } from '@/hooks/useGitHubDocs';
import { routeConfig } from '@/config/routes';
import MDXRenderer from '@/components/mdx-renderer';
import TableOfContents from '@/components/table-of-contents';
import DocNotFound from '@/components/doc-not-found';
import DocError from '@/components/doc-error';

const DocsPage = () => {
  const { slug } = useParams();
  const { user, isAdmin, isEditor } = useAuth();
  const { docs, loading, error } = useGitHubDocsList();
  const [currentDoc, setCurrentDoc] = useState<any>(null);
  const [docContent, setDocContent] = useState<string>('');

  useEffect(() => {
    if (!docs.length || !slug) return;

    console.log('Looking for doc with slug:', slug);
    console.log('Available docs:', docs.map(d => d.slug));
    
    const doc = docs.find(d => d.slug === slug);
    
    if (doc) {
      console.log('Found doc:', doc);
      setCurrentDoc(doc);
      setDocContent(doc.content || '');
    } else {
      console.log('Doc not found for slug:', slug);
      setCurrentDoc(null);
      setDocContent('');
    }
  }, [docs, slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <DocError error={error} />;
  }

  if (!currentDoc) {
    return <DocNotFound slug={slug} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">
                  {currentDoc.title}
                </h1>
                {currentDoc.description && (
                  <p className="text-xl text-muted-foreground">
                    {currentDoc.description}
                  </p>
                )}
              </div>
              
              {(isAdmin || isEditor) && user && (
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/edit/${currentDoc.slug}`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Page
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/edit/new">
                      <Plus className="w-4 h-4 mr-2" />
                      New Page
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            
            {currentDoc.tags && currentDoc.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {currentDoc.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <Card>
              <CardContent className="pt-6">
                <MDXRenderer content={docContent} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="w-64 hidden lg:block">
          <div className="sticky top-8">
            <TableOfContents content={docContent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
