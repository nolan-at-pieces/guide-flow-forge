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
import { useGitHubDocs } from "@/hooks/useGitHubDocs";
import { githubDocsCache } from "@/services/githubDocsCache";

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
  const { isConfigured } = useGitHubDocs();

  useEffect(() => {
    const loadDoc = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);

      console.log('Loading document for slug:', slug);

      try {
        // Try to load from cache first
        const cachedDoc = await githubDocsCache.getDoc(slug);
        
        if (cachedDoc) {
          console.log('Successfully loaded from cache/GitHub:', slug);
          setDocContent(cachedDoc.content);
          setDocMeta({
            title: cachedDoc.title,
            description: cachedDoc.description,
            order: cachedDoc.order,
            icon: cachedDoc.icon,
            tags: cachedDoc.tags
          });
          setLoading(false);
          return;
        }

        // If not found in cache/GitHub, fall back to mock data
        console.log('Document not found in GitHub, using mock data for:', slug);
        
        const mockDocs: Record<string, {
          content: string;
          meta: DocMeta;
        }> = {
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
          },
          "troubleshooting": {
            content: `# Troubleshooting

Common issues and their solutions to help you resolve problems quickly.

## Installation Issues

### Permission Errors

**Problem**: Getting permission denied errors during installation.

\`\`\`bash
npm ERR! Error: EACCES: permission denied
\`\`\`

**Solutions**:

1. **Use npx (Recommended)**:
   \`\`\`bash
   npx create-myproject my-app
   \`\`\`

2. **Fix npm permissions**:
   \`\`\`bash
   sudo chown -R $(whoami) ~/.npm
   \`\`\`

## Authentication Issues

### Invalid API Key

**Problem**: Getting 401 Unauthorized errors.

**Solutions**:

1. **Verify your API key**:
   \`\`\`javascript
   console.log('API Key:', process.env.MYPROJECT_API_KEY?.substring(0, 8) + '...');
   \`\`\`

2. **Check environment variables**
3. **Regenerate API key** if needed

## Getting Help

- Check our [community forum](https://community.myproject.com)
- Review [GitHub issues](https://github.com/myproject/issues)
- Contact support with detailed error messages
            `,
            meta: {
              title: "Troubleshooting",
              description: "Common issues and solutions",
              order: 4,
              icon: "🔧",
              tags: ["troubleshooting", "debugging", "help"]
            }
          },
          "examples": {
            content: `# Examples

Practical examples to help you understand how to use MyProject effectively.

## Basic Usage

Here's a simple example to get you started:

\`\`\`javascript
import { MyProject } from 'myproject';

const project = new MyProject({
  apiKey: 'your-api-key'
});

await project.init();
console.log('Ready to use!');
\`\`\`

## Advanced Examples

### Error Handling

\`\`\`javascript
try {
  const result = await project.getData('some-id');
  console.log(result);
} catch (error) {
  console.error('Failed to get data:', error);
}
\`\`\`

### Batch Operations

\`\`\`javascript
const ids = ['id1', 'id2', 'id3'];
const results = await project.getBatch(ids);
\`\`\`

## More Examples

- [Basic Usage](${routeConfig.buildPath('examples/basic-usage')})
- [Advanced Topics](${routeConfig.buildPath('examples/advanced')})
            `,
            meta: {
              title: "Examples",
              description: "Practical examples and use cases",
              order: 3,
              icon: "💡",
              tags: ["examples", "tutorials"]
            }
          },
          "examples/basic-usage": {
            content: `# Basic Usage

Learn the fundamentals of using MyProject.

## Your First Project

\`\`\`javascript
import { MyProject } from 'myproject';

const project = new MyProject({
  apiKey: process.env.MYPROJECT_API_KEY
});

// Initialize the project
await project.init();

// Get some data
const data = await project.getData('example');
console.log(data);
\`\`\`

## Configuration

Set up your environment variables:

\`\`\`bash
export MYPROJECT_API_KEY=your_api_key_here
\`\`\`

## Next Steps

Once you're comfortable with the basics, check out [Advanced Examples](${routeConfig.buildPath('examples/advanced')}).
            `,
            meta: {
              title: "Basic Usage",
              description: "Learn the fundamentals",
              order: 1,
              tags: ["basics", "tutorial"]
            }
          },
          "examples/advanced": {
            content: `# Advanced Examples

More complex use cases and patterns.

## Custom Configuration

\`\`\`javascript
const project = new MyProject({
  apiKey: 'your-api-key',
  timeout: 30000,
  retries: 3,
  cache: {
    enabled: true,
    ttl: 300000
  }
});
\`\`\`

## Error Handling Patterns

\`\`\`javascript
async function safeGetData(id) {
  try {
    return await project.getData(id);
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return null;
    }
    throw error;
  }
}
\`\`\`

## Performance Optimization

Use batch operations when possible:

\`\`\`javascript
// Instead of multiple individual calls
const results = await Promise.all([
  project.getData('id1'),
  project.getData('id2'),
  project.getData('id3')
]);

// Use batch operation
const results = await project.getBatch(['id1', 'id2', 'id3']);
\`\`\`
            `,
            meta: {
              title: "Advanced Examples",
              description: "Complex patterns and optimization",
              order: 2,
              tags: ["advanced", "performance"]
            }
          }
        };
        
        const mockDoc = mockDocs[slug];
        if (!mockDoc) {
          console.log('No mock doc found for slug:', slug);
          setNotFound(true);
          return;
        }
        
        console.log('Using mock data for slug:', slug);
        setDocContent(mockDoc.content);
        setDocMeta(mockDoc.meta);
      } catch (err) {
        console.error('Error loading doc:', err);
        setError("Failed to load documentation");
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [slug]);

  // Preload common docs on mount
  useEffect(() => {
    githubDocsCache.preloadCommonDocs();
  }, []);

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
                  Configure GitHub integration in the admin panel to enable editing capabilities.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                Configure
              </Button>
            </div>
          </div>
        )}

        {/* Edit Button for Admins/Editors - Only show to logged in admins/editors */}
        {(isAdmin || isEditor) && user && (
          <div className="not-prose mb-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => navigate(`/edit/${slug}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Page
            </Button>
          </div>
        )}
        
        <MDXRenderer content={docContent} />
      </article>
    </Layout>
  );
};

export default DocsPage;
