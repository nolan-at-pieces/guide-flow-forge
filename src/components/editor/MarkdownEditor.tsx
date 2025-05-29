
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Save, Eye, EyeOff, Github, ArrowLeft, Plus, Settings } from 'lucide-react';
import SlashCommandMenu from './SlashCommandMenu';
import MDXRenderer from '@/components/mdx-renderer';
import { useNavigate } from 'react-router-dom';

interface MarkdownEditorProps {
  initialContent: string;
  initialTitle: string;
  initialSlug: string;
  initialDescription?: string;
  initialTags?: string[];
  onSave: (data: {
    title: string;
    slug: string;
    content: string;
    description?: string;
    tags?: string[];
  }) => void;
  onPublishToGithub?: () => void;
  isNewPage?: boolean;
}

const MarkdownEditor = ({
  initialContent,
  initialTitle,
  initialSlug,
  initialDescription = '',
  initialTags = [],
  onSave,
  onPublishToGithub,
  isNewPage = false
}: MarkdownEditorProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState(initialTags.join(', '));
  const [showPreview, setShowPreview] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '/') {
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const textBefore = content.substring(0, cursorPos);
      
      // Only show slash menu if / is at start of line or after whitespace
      if (cursorPos === 0 || /\s$/.test(textBefore) || textBefore.endsWith('\n')) {
        e.preventDefault();
        setCursorPosition(cursorPos);
        
        // Calculate position for slash menu
        const rect = textarea.getBoundingClientRect();
        const lines = textBefore.split('\n');
        const currentLine = lines.length - 1;
        const lineHeight = 24; // Approximate line height
        
        setSlashMenuPosition({
          x: rect.left + 10,
          y: rect.top + (currentLine * lineHeight) + 50
        });
        setShowSlashMenu(true);
      }
    } else if (e.key === 'Escape') {
      setShowSlashMenu(false);
    }
  };

  const insertAtCursor = (text: string) => {
    const newContent = content.substring(0, cursorPosition) + text + content.substring(cursorPosition);
    setContent(newContent);
    setShowSlashMenu(false);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorPosition + text.length, cursorPosition + text.length);
      }
    }, 0);
  };

  const handleSave = () => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title, slug, and content are required",
        variant: "destructive",
      });
      return;
    }

    onSave({
      title: title.trim(),
      slug: slug.trim(),
      content: content.trim(),
      description: description.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined
    });
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (isNewPage && title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generatedSlug);
    }
  }, [title, isNewPage, slug]);

  return (
    <div className="h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Docs
          </Button>
          <Button onClick={() => setShowPreview(!showPreview)} variant="outline" size="sm">
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Badge variant="secondary">
            {isNewPage ? 'Creating New Page' : 'Editing'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate('/edit/new')} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </Button>
          {onPublishToGithub && (
            <Button onClick={onPublishToGithub} variant="outline" size="sm">
              <Github className="w-4 h-4 mr-2" />
              Publish to GitHub
            </Button>
          )}
          <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Page Settings */}
      <div className="p-4 border-b bg-muted/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Page Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter page title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL Slug</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-slug"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 flex overflow-hidden">
        {!showPreview ? (
          <div className="w-full relative flex">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Start typing... Use / for commands"
                className="w-full h-full resize-none border-0 focus:ring-0 font-mono text-sm leading-relaxed p-6"
                style={{ minHeight: 'calc(100vh - 300px)' }}
              />
              {showSlashMenu && (
                <SlashCommandMenu
                  position={slashMenuPosition}
                  onSelect={insertAtCursor}
                  onClose={() => setShowSlashMenu(false)}
                />
              )}
            </div>
            
            {/* Markdown Cheatsheet */}
            <div className="w-72 border-l bg-muted/30 p-4 overflow-auto">
              <h3 className="font-medium mb-3 text-sm">Markdown Quick Reference</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <code className="bg-background px-1 rounded">**bold**</code>
                  <span className="ml-2 text-muted-foreground">Bold text</span>
                </div>
                <div>
                  <code className="bg-background px-1 rounded">*italic*</code>
                  <span className="ml-2 text-muted-foreground">Italic text</span>
                </div>
                <div>
                  <code className="bg-background px-1 rounded"># H1</code>
                  <span className="ml-2 text-muted-foreground">Heading 1</span>
                </div>
                <div>
                  <code className="bg-background px-1 rounded">## H2</code>
                  <span className="ml-2 text-muted-foreground">Heading 2</span>
                </div>
                <div>
                  <code className="bg-background px-1 rounded">- item</code>
                  <span className="ml-2 text-muted-foreground">Bullet list</span>
                </div>
                <div>
                  <code className="bg-background px-1 rounded">1. item</code>
                  <span className="ml-2 text-muted-foreground">Numbered list</span>
                </div>
                <div>
                  <code className="bg-background px-1 rounded">`code`</code>
                  <span className="ml-2 text-muted-foreground">Inline code</span>
                </div>
                <div>
                  <code className="bg-background px-1 rounded">```js</code>
                  <span className="ml-2 text-muted-foreground">Code block</span>
                </div>
                <div>
                  <code className="bg-background px-1 rounded">[link](url)</code>
                  <span className="ml-2 text-muted-foreground">Link</span>
                </div>
                <div>
                  <code className="bg-background px-1 rounded">![alt](img)</code>
                  <span className="ml-2 text-muted-foreground">Image</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground">Type <kbd>/</kbd> for quick insert menu</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full p-6 overflow-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">{title}</h1>
                  {description && (
                    <p className="text-lg text-muted-foreground mb-4">{description}</p>
                  )}
                  {tags && (
                    <div className="flex gap-2 mb-4">
                      {tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <MDXRenderer content={content} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
