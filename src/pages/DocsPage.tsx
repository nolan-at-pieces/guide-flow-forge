import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import MDXRenderer from "@/components/mdx-renderer";
import TableOfContentsComponent from "@/components/table-of-contents";
import Layout from "@/components/layout";
import DocNotFound from "@/components/doc-not-found";
import DocError from "@/components/doc-error";
import { routeConfig } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useGitHubDocs, useGitHubDocsList } from "@/hooks/useGitHubDocs";
import { DocContent } from "@/services/githubApi";

interface DocMeta {
  title: string;
  description?: string;
  order: number;
  icon?: string;
  tags?: string[];
}

const DocsPage = () => {
  const params = useParams();
  const location = useLocation();
  
  // Use the route config to extract slug
  const slug = routeConfig.extractSlug(location.pathname) || "getting-started";
  
  const [docContent, setDocContent] = useState("");
  const [docMeta, setDocMeta] = useState<DocMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { user, isAdmin, isEditor } = useAuth();
  const navigate = useNavigate();
  const { service, isConfigured } = useGitHubDocs();
  const { docs, initialized } = useGitHubDocsList();

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);

      // If GitHub is configured and docs are loaded, get from cache
      if (isConfigured && service && initialized && docs.length > 0) {
        const doc = docs.find(d => d.slug === slug);
        
        if (doc) {
          setDocContent(doc.content);
          setDocMeta({
            title: doc.title,
            description: doc.description || undefined,
            order: doc.order || 0,
            icon: doc.icon || undefined,
            tags: doc.tags || undefined,
          });
        } else {
          setNotFound(true);
        }
        setLoading(false);
        return;
      }

      // If GitHub is configured but not yet initialized, try to fetch directly
      if (isConfigured && service && !initialized) {
        try {
          const doc = await service.getDocBySlug(slug);
          
          if (doc) {
            setDocContent(doc.content);
            setDocMeta({
              title: doc.title,
              description: doc.description || undefined,
              order: doc.order || 0,
              icon: doc.icon || undefined,
              tags: doc.tags || undefined,
            });
          } else {
            setNotFound(true);
          }
          setLoading(false);
          return;
        } catch (err) {
          console.error('Error loading doc from GitHub:', err);
          setError("Failed to load documentation from GitHub");
          setLoading(false);
          return;
        }
      }

      // Fallback to mock data when GitHub is not configured
      try {
        const mockDocs: Record<string, { content: string; meta: DocMeta }> = {
          "getting-started": {
            content: `# Getting Started

Welcome to MyProject! This guide will help you get up and running quickly.

## Installation

Install MyProject using npm:

\`\`\`bash
npm install myproject
\`\`\`

Or using yarn:

\`\`\`bash
yarn add myproject
\`\`\`

## Quick Start

Here's a simple example to get you started:

\`\`\`javascript
import { MyProject } from 'myproject';

const project = new MyProject({
  apiKey: 'your-api-key'
});

project.init().then(() => {
  console.log('MyProject is ready!');
});
\`\`\`

## Next Steps

- Read the [API Reference](${routeConfig.buildPath('api-reference')})
- Check out [Examples](${routeConfig.buildPath('examples')})
- Learn about [Advanced Topics](${routeConfig.buildPath('advanced')})

> **Note**: This documentation is currently using fallback content. Configure GitHub integration in the admin panel to load docs from your repository.
            `,
            meta: {
              title: "Getting Started",
              description: "Learn how to get started with MyProject",
              order: 1,
              icon: "🚀",
              tags: ["basics", "setup"]
            }
          },
          "getting-started/installation": {
            content: `# Installation

Install MyProject using your preferred package manager.

## npm

\`\`\`bash
npm install myproject
\`\`\`

## yarn

\`\`\`bash
yarn add myproject
\`\`\`

## pnpm

\`\`\`bash
pnpm add myproject
\`\`\`

## Requirements

- Node.js 16 or higher
- npm 7 or higher

> **Note**: This documentation is currently using fallback content. Configure GitHub integration in the admin panel to load docs from your repository.
            `,
            meta: {
              title: "Installation",
              description: "How to install MyProject",
              order: 1,
              tags: ["installation", "setup"]
            }
          },
          "api-reference": {
            content: `# API Reference

Complete reference for MyProject API.

## Authentication

All API requests require authentication using an API key:

\`\`\`javascript
const client = new MyProject({
  apiKey: 'your-api-key'
});
\`\`\`

## Core Methods

### \`init(options)\`

Initialize the MyProject client.

**Parameters:**
- \`options\` (Object): Configuration options

**Returns:** Promise<void>

### \`getData(id)\`

Retrieve data by ID.

**Parameters:**
- \`id\` (string): The data ID

**Returns:** Promise<Data>

\`\`\`javascript
const data = await client.getData('example-id');
console.log(data);
\`\`\`

## Advanced Features

### Batch Operations

Process multiple items at once.

### Error Handling

Handle errors gracefully in your application.

### Rate Limiting

Understand API rate limits and best practices.

> **Note**: This documentation is currently using fallback content. Configure GitHub integration in the admin panel to load docs from your repository.
            `,
            meta: {
              title: "API Reference",
              description: "Complete API documentation",
              order: 2,
              icon: "📚",
              tags: ["api", "reference"]
            }
          }
        };

        const mockDoc = mockDocs[slug];
        if (!mockDoc) {
          setNotFound(true);
          return;
        }

        setDocContent(mockDoc.content);
        setDocMeta(mockDoc.meta);
      } catch (err) {
        console.error('Error loading mock doc:', err);
        setError("Failed to load documentation");
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [slug, service, isConfigured, docs, initialized]);

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse">Loading...</div>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <DocNotFound />
      </Layout>
    );
  }

  if (error) {
    return <DocError error={error} />;
  }

  return (
    <Layout rightSidebar={<TableOfContentsComponent content={docContent} />}>
      <article className="prose prose-slate dark:prose-invert max-w-none">
        {/* Configuration Notice for Admins - Only show to logged in admins/editors */}
        {!isConfigured && (isAdmin || isEditor) && user && (
          <div className="not-prose mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-yellow-800">GitHub Not Configured</h3>
                <p className="text-sm text-yellow-700">
                  Configure GitHub integration in the admin panel to load docs from your repository.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/admin')}
              >
                Configure
              </Button>
            </div>
          </div>
        )}

        {/* Edit Button for Admins/Editors - Only show to logged in admins/editors */}
        {(isAdmin || isEditor) && user && (
          <div className="not-prose mb-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/edit/${slug}`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Page
            </Button>
          </div>
        )}
        
        {docMeta && (
          <div className="not-prose mb-8">
            <div className="flex items-center gap-2 mb-2">
              {docMeta.icon && <span className="text-2xl">{docMeta.icon}</span>}
              <h1 className="text-3xl font-bold m-0">{docMeta.title}</h1>
            </div>
            {docMeta.description && (
              <p className="text-lg text-muted-foreground mb-4">{docMeta.description}</p>
            )}
            {docMeta.tags && (
              <div className="flex gap-2">
                {docMeta.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
        )}
        <MDXRenderer content={docContent} />
      </article>
    </Layout>
  );
};

export default DocsPage;
