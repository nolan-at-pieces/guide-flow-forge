
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Save, Eye, EyeOff, Github, ArrowLeft, FileText } from 'lucide-react';
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
    <div className="h-full flex flex-col bg-background">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium text-sm">
            {isNewPage ? 'New Document' : title || 'Untitled Document'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowPreview(!showPreview)} 
            variant="outline" 
            size="sm"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave} size="sm" className="bg-primary">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Document Metadata - Collapsible */}
      <div className="border-b bg-muted/30">
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                className="h-8"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                URL Slug
              </label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
                className="h-8 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description"
                className="h-8"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Tags
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                className="h-8"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex min-h-0">
        {!showPreview ? (
          <>
            {/* Markdown Editor */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Start writing your markdown... Type / for quick commands"
                  className="h-full w-full resize-none border-0 rounded-none focus:ring-0 focus-visible:ring-0 font-mono text-sm leading-relaxed p-6"
                  style={{ 
                    minHeight: '100%',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}
                />
                {showSlashMenu && (
                  <SlashCommandMenu
                    position={slashMenuPosition}
                    onSelect={insertAtCursor}
                    onClose={() => setShowSlashMenu(false)}
                  />
                )}
              </div>
            </div>
            
            {/* Markdown Reference Sidebar */}
            <div className="w-72 border-l bg-muted/20 overflow-auto">
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-4 text-foreground">Markdown Reference</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="font-medium mb-2 text-foreground">Headers</div>
                    <div className="font-mono text-muted-foreground space-y-1">
                      <div># Header 1</div>
                      <div>## Header 2</div>
                      <div>### Header 3</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2 text-foreground">Text Formatting</div>
                    <div className="font-mono text-muted-foreground space-y-1">
                      <div>**bold text**</div>
                      <div>*italic text*</div>
                      <div>`inline code`</div>
                      <div>~~strikethrough~~</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2 text-foreground">Lists</div>
                    <div className="font-mono text-muted-foreground space-y-1">
                      <div>- Bullet point</div>
                      <div>1. Numbered item</div>
                      <div>- [ ] Todo item</div>
                      <div>- [x] Done item</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2 text-foreground">Links & Images</div>
                    <div className="font-mono text-muted-foreground space-y-1">
                      <div>[link text](url)</div>
                      <div>![alt text](image.jpg)</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2 text-foreground">Code Blocks</div>
                    <div className="font-mono text-muted-foreground space-y-1">
                      <div>```javascript</div>
                      <div>const x = 'code';</div>
                      <div>```</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium mb-2 text-foreground">Other</div>
                    <div className="font-mono text-muted-foreground space-y-1">
                      <div>{'> Blockquote'}</div>
                      <div>---</div>
                      <div className="text-xs text-muted-foreground mt-2">Horizontal rule</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="font-medium mb-2 text-foreground">Quick Insert</div>
                    <div className="text-muted-foreground">
                      Type <kbd className="px-1 py-0.5 bg-muted rounded text-xs">/</kbd> for commands
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Preview Mode */
          <div className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-3">{title}</h1>
                {description && (
                  <p className="text-xl text-muted-foreground mb-4">{description}</p>
                )}
                {tags && (
                  <div className="flex gap-2 mb-6">
                    {tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <MDXRenderer content={content} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
