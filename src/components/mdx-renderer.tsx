
import { useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MDXRendererProps {
  content: string;
}

const MDXRenderer = ({ content }: MDXRendererProps) => {
  const processedContent = useMemo(() => {
    // Simple markdown-to-HTML conversion for demo
    // In a real app, you'd use a proper MDX processor
    let html = content
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mb-3 mt-8">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mb-2 mt-6">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');

    // Handle code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-muted p-4 rounded-lg overflow-x-auto"><code class="text-sm">${code.trim()}</code></pre>`;
    });

    // Handle paragraphs
    html = html.replace(/^(?!<[h1-6]|<pre|<ul|<ol)(.+)$/gm, '<p class="mb-4">$1</p>');

    return html;
  }, [content]);

  return (
    <div 
      className="prose-content"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default MDXRenderer;
