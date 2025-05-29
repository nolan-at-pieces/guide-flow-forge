
import { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MDXRendererProps {
  content: string;
}

const MDXRenderer = ({ content }: MDXRendererProps) => {
  const processedContent = useMemo(() => {
    // Enhanced markdown-to-HTML conversion with IDs for headings
    let html = content
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

    return html;
  }, [content]);

  return (
    <div className="prose-content max-w-none">
      <div 
        className="space-y-4"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
};

export default MDXRenderer;
