
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

interface DocMeta {
  title: string;
  description?: string;
  order: number;
  icon?: string;
  tags?: string[];
}

// Public GitHub repository configuration - used for ALL users
const PUBLIC_GITHUB_CONFIG = {
  repository: "nolan-at-pieces/guide-flow-forge",
  branch: "main",
  basePath: "sample-docs"
};

// Function to fetch from public GitHub repo without authentication
const fetchPublicGitHubContent = async (path: string): Promise<string> => {
  const url = `https://api.github.com/repos/${PUBLIC_GITHUB_CONFIG.repository}/contents/${PUBLIC_GITHUB_CONFIG.basePath}/${path}?ref=${PUBLIC_GITHUB_CONFIG.branch}`;
  
  console.log('Fetching from URL:', url);
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'DocSite/1.0'
    }
  });

  console.log('Response status:', response.status, response.statusText);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Document not found: ${path}`);
    }
    const errorText = await response.text();
    console.log('Error response:', errorText);
    throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.encoding === 'base64') {
    return atob(data.content.replace(/\s/g, ''));
  }
  
  return data.content;
};

// Enhanced frontmatter parsing that properly removes frontmatter from content
const parseFrontmatter = (content: string) => {
  // Normalize line endings
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Check if content starts with frontmatter delimiter
  if (!normalizedContent.startsWith('---\n')) {
    return {
      metadata: { title: 'Untitled', order: 0 },
      content: normalizedContent.trim()
    };
  }
  
  // Find the closing frontmatter delimiter
  const lines = normalizedContent.split('\n');
  let frontmatterEndIndex = -1;
  
  // Start from line 1 (skip the opening ---)
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      frontmatterEndIndex = i;
      break;
    }
  }
  
  if (frontmatterEndIndex === -1) {
    // No closing frontmatter found, treat as regular content
    return {
      metadata: { title: 'Untitled', order: 0 },
      content: normalizedContent.trim()
    };
  }
  
  // Extract frontmatter section (between the --- markers)
  const frontmatterLines = lines.slice(1, frontmatterEndIndex);
  
  // Extract content after frontmatter (skip the closing --- and any empty lines)
  let contentStartIndex = frontmatterEndIndex + 1;
  while (contentStartIndex < lines.length && lines[contentStartIndex].trim() === '') {
    contentStartIndex++;
  }
  const contentLines = lines.slice(contentStartIndex);
  const cleanContent = contentLines.join('\n').trim();
  
  // Parse the frontmatter
  const metadata: any = { order: 0 };
  let currentKey = '';
  let inArray = false;
  let arrayItems: string[] = [];
  
  for (const line of frontmatterLines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Handle array continuation
    if (inArray && trimmedLine.startsWith('- ')) {
      const item = trimmedLine.substring(2).trim();
      arrayItems.push(item.replace(/^["']|["']$/g, ''));
      continue;
    } else if (inArray && !trimmedLine.startsWith('- ')) {
      // End of array
      metadata[currentKey] = arrayItems;
      inArray = false;
      arrayItems = [];
    }
    
    // Handle key-value pairs
    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0) {
      const key = trimmedLine.substring(0, colonIndex).trim();
      let value = trimmedLine.substring(colonIndex + 1).trim();
      
      if (!value) {
        // This might be the start of an array
        currentKey = key;
        inArray = true;
        arrayItems = [];
        continue;
      }
      
      // Handle inline arrays [item1, item2]
      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1);
        if (arrayContent.trim()) {
          metadata[key] = arrayContent.split(',').map(item => 
            item.trim().replace(/^["']|["']$/g, '')
          );
        } else {
          metadata[key] = [];
        }
        continue;
      }
      
      // Remove quotes and handle special values
      value = value.replace(/^["']|["']$/g, '');
      
      if (key === 'order') {
        metadata[key] = parseInt(value) || 0;
      } else {
        metadata[key] = value;
      }
    }
  }
  
  // Handle any remaining array
  if (inArray && arrayItems.length > 0) {
    metadata[currentKey] = arrayItems;
  }
  
  console.log('Frontmatter parsing result:');
  console.log('Original content length:', normalizedContent.length);
  console.log('Clean content length:', cleanContent.length);
  console.log('Metadata:', metadata);
  console.log('Clean content preview:', cleanContent.substring(0, 100));
  
  return {
    metadata,
    content: cleanContent
  };
};

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

      // ALWAYS try to load from public GitHub repo first (for ALL users)
      try {
        const filePath = slug.endsWith('.md') ? slug : `${slug}.md`;
        console.log('Attempting to fetch file:', filePath);
        
        const content = await fetchPublicGitHubContent(filePath);
        
        const { metadata, content: markdownContent } = parseFrontmatter(content);
        
        console.log('Successfully loaded from public GitHub:', slug);
        console.log('Parsed metadata:', metadata);
        console.log('Clean content (no frontmatter):', markdownContent.substring(0, 200));
        
        setDocContent(markdownContent);
        setDocMeta({
          title: metadata.title || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: metadata.description,
          order: metadata.order || 0,
          icon: metadata.icon,
          tags: metadata.tags
        });
        setLoading(false);
        return;
      } catch (err) {
        console.log('Failed to load from public GitHub:', err);
        
        // Only set notFound if it's specifically a 404 error
        if (err instanceof Error && err.message.includes('Document not found')) {
          console.log('Document not found, setting notFound to true');
          setNotFound(true);
          setLoading(false);
          return;
        }
        
        // For other errors, continue to fallback
        console.log('GitHub error, falling back to mock data');
      }

      // Fallback to mock data when GitHub is not available
      try {
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

> **Note**: This documentation is currently using fallback content. The public GitHub repository may be temporarily unavailable.
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

> **Note**: This documentation is currently using fallback content. The public GitHub repository may be temporarily unavailable.
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

> **Note**: This documentation is currently using fallback content. The public GitHub repository may be temporarily unavailable.
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

> **Note**: This documentation is currently using fallback content. The public GitHub repository may be temporarily unavailable.
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

> **Note**: This documentation is currently using fallback content. The public GitHub repository may be temporarily unavailable.
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

> **Note**: This documentation is currently using fallback content. The public GitHub repository may be temporarily unavailable.
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

> **Note**: This documentation is currently using fallback content. The public GitHub repository may be temporarily unavailable.
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
        console.error('Error loading mock doc:', err);
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
