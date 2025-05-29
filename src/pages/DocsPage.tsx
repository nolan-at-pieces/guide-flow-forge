
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import MDXRenderer from "@/components/mdx-renderer";
import TableOfContentsComponent from "@/components/table-of-contents";
import Layout from "@/components/layout";
import DocNotFound from "@/components/doc-not-found";
import DocError from "@/components/doc-error";

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
  
  // Remove leading slash and use as slug, default to getting-started
  const slug = location.pathname.slice(1) || "getting-started";
  
  const [docContent, setDocContent] = useState("");
  const [docMeta, setDocMeta] = useState<DocMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);

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

- Read the [API Reference](/api-reference)
- Check out [Examples](/examples)
- Learn about [Advanced Topics](/advanced)
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

        const doc = mockDocs[slug];
        if (!doc) {
          setNotFound(true);
          return;
        }

        setDocContent(doc.content);
        setDocMeta(doc.meta);
      } catch (err) {
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
