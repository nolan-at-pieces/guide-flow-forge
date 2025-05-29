
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Save, Eye, EyeOff, Github, ArrowLeft, FileText, Code, Type } from 'lucide-react';
import SlashCommandMenu from './SlashCommandMenu';
import MDXRenderer from '@/components/mdx-renderer';

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
  onBack?: () => void;
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
  onBack,
  isNewPage = false
}: MarkdownEditorProps) => {
  const { toast } = useToast();
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
      if (cursorPos === 0 || /\s$/.test(textBefore)) {
        e.preventDefault();
        setCursorPosition(cursorPos);
        
        // Calculate position for slash menu
        const rect = textarea.getBoundingClientRect();
        const lines = textBefore.split('\n');
        const currentLine = lines.length - 1;
        const lineHeight = 24; // Approximate line height
        
        setSlashMenuPosition({
          x: rect.left + 10,
          y: rect.top + (currentLine * lineHeight) + 30
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
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="font-medium">
              {isNewPage ? 'New Page' : `Editing: ${title || 'Untitled'}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowPreview(!showPreview)} variant="outline" size="sm">
            {showPreview ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          {onPublishToGithub && (
            <Button onClick={onPublishToGithub} variant="outline" size="sm">
              <Github className="w-4 h-4 mr-2" />
              Publish
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
      <div className="flex-1 flex">
        {!showPreview ? (
          <div className="flex w-full">
            {/* Main Editor */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Start typing... Use / for commands"
                className="w-full h-full resize-none border-0 focus:ring-0 font-mono text-sm leading-relaxed"
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
            <div className="w-80 border-l bg-muted/30 p-4 overflow-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Markdown Cheatsheet
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-3">
                  <div>
                    <div className="font-medium mb-1">Headings</div>
                    <div className="font-mono text-muted-foreground">
                      # H1<br/>
                      ## H2<br/>
                      ### H3
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Text Formatting</div>
                    <div className="font-mono text-muted-foreground">
                      **bold**<br/>
                      *italic*<br/>
                      `code`
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Lists</div>
                    <div className="font-mono text-muted-foreground">
                      - Item 1<br/>
                      - Item 2<br/>
                      <br/>
                      1. Numbered<br/>
                      2. List
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Links & Images</div>
                    <div className="font-mono text-muted-foreground">
                      [link](url)<br/>
                      ![image](url)
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Code Block</div>
                    <div className="font-mono text-muted-foreground">
                      ```language<br/>
                      code here<br/>
                      ```
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Quote</div>
                    <div className="font-mono text-muted-foreground">
                      > Quote text
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <Badge variant="secondary" className="text-xs">
                      Tip: Type "/" for quick insert
                    </Badge>
                  </div>
                </CardContent>
              </Card>
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
