import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import MDXRenderer from "@/components/mdx-renderer";
import TableOfContentsComponent from "@/components/table-of-contents";
import Layout from "@/components/layout";
import DocNotFound from "@/components/doc-not-found";
import DocError from "@/components/doc-error";
import { routeConfig } from "@/config/routes";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        // Try to fetch from database first
        const { data: doc, error: dbError } = await supabase
          .from('doc_content')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (doc && !dbError) {
          setDocContent(doc.content);
          setDocMeta({
            title: doc.title,
            description: doc.description || undefined,
            order: doc.order_index || 0,
            icon: doc.icon || undefined,
            tags: doc.tags || undefined,
          });
        } else {
          // Fallback to mock data for backward compatibility
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
        }
      } catch (err) {
        console.error('Error loading doc:', err);
        setError("Failed to load documentation");
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [slug]);

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
        {/* Edit Button for Admins/Editors */}
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
