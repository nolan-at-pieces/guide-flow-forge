
import { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MDXRendererProps {
  content: string;
}

interface FrontmatterData {
  title?: string;
  description?: string;
  order?: number;
  icon?: string;
  tags?: string[];
}

const MDXRenderer = ({ content }: MDXRendererProps) => {
  const { frontmatter, processedContent } = useMemo(() => {
    // Parse frontmatter first
    const frontmatterData: FrontmatterData = {};
    let cleanedContent = content;

    // Check if content starts with frontmatter delimiter
    if (content.trim().startsWith('---')) {
      const lines = content.split('\n');
      let frontmatterEndIndex = -1;
      
      // Find the closing frontmatter delimiter
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
          frontmatterEndIndex = i;
          break;
        }
      }
      
      if (frontmatterEndIndex > 0) {
        // Extract frontmatter section
        const frontmatterLines = lines.slice(1, frontmatterEndIndex);
        
        // Parse frontmatter
        for (const line of frontmatterLines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          const colonIndex = trimmedLine.indexOf(':');
          if (colonIndex > 0) {
            const key = trimmedLine.substring(0, colonIndex).trim();
            let value = trimmedLine.substring(colonIndex + 1).trim();
            
            // Remove quotes
            value = value.replace(/^["']|["']$/g, '');
            
            if (key === 'title') frontmatterData.title = value;
            else if (key === 'description') frontmatterData.description = value;
            else if (key === 'order') frontmatterData.order = parseInt(value) || 0;
            else if (key === 'icon') frontmatterData.icon = value;
          }
        }
        
        // Remove frontmatter from content
        cleanedContent = lines.slice(frontmatterEndIndex + 1).join('\n').trim();
      }
    }

    // Remove everything before the first heading from the cleaned content
    const lines = cleanedContent.split('\n');
    let firstHeaderIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^#{1,6}\s+/)) {
        firstHeaderIndex = i;
        break;
      }
    }
    
    // If we found a header, start content from there
    const finalContent = firstHeaderIndex >= 0 
      ? lines.slice(firstHeaderIndex).join('\n')
      : cleanedContent;

    // Enhanced markdown-to-HTML conversion with IDs for headings
    let html = finalContent
      .replace(/^# (.*$)/gm, (match, title) => {
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `<h1 id="${id}" class="text-4xl font-bold mb-6 mt-8 first:mt-0 scroll-m-20">${title}</h1>`;
      })
      .replace(/^## (.*$)/gm, (match, title) => {
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `<h2 id="${id}" class="text-3xl font-semibold mb-4 mt-8 scroll-m-20 border-b pb-2">${title}</h2>`;
      })
      .replace(/^### (.*$)/gm, (match, title) => {
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `<h3 id="${id}" class="text-2xl font-medium mb-3 mt-6 scroll-m-20">${title}</h3>`;
      })
      .replace(/^#### (.*$)/gm, (match, title) => {
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `<h4 id="${id}" class="text-xl font-medium mb-2 mt-4 scroll-m-20">${title}</h4>`;
      })
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>');

    // Handle code blocks with better styling
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="my-6">
        <pre class="bg-muted/50 border rounded-lg p-4 overflow-x-auto">
          <code class="text-sm font-mono leading-relaxed">${code.trim()}</code>
        </pre>
      </div>`;
    });

    html = html.replace(/^- (.+)$/gm, '<li class="mb-2">$1</li>');
    html = html.replace(/(<li.*<\/li>)/s, '<ul class="list-disc pl-6 mb-4 space-y-2">$1</ul>');

    html = html.replace(/^\d+\. (.+)$/gm, '<li class="mb-2">$1</li>');

    html = html.replace(/^(?!<[h1-6]|<pre|<ul|<ol|<li|<div)(.+)$/gm, '<p class="mb-4 leading-7 text-muted-foreground">$1</p>');

    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/20 pl-4 italic text-muted-foreground mb-4">$1</blockquote>');

    return { frontmatter: frontmatterData, processedContent: html };
  }, [content]);

  return (
    <div className="prose-content max-w-none">
      {/* Frontmatter Header */}
      {(frontmatter.title || frontmatter.description) && (
        <div className="mb-8">
          {frontmatter.title && (
            <h1 className="text-4xl font-bold mb-4">{frontmatter.title}</h1>
          )}
          {frontmatter.description && (
            <p className="text-lg text-muted-foreground mb-6">{frontmatter.description}</p>
          )}
          <div className="border-t border-border"></div>
        </div>
      )}
      
      {/* Content */}
      <div 
        className="space-y-4"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
};

export default MDXRenderer;
