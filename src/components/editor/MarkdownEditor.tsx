
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Save, Eye, EyeOff, ArrowLeft, FileText } from 'lucide-react';
import SlashCommandMenu from './SlashCommandMenu';
import MDXRenderer from '@/components/mdx-renderer';
import MarkdownReference from './MarkdownReference';

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
    console.log('Key pressed:', e.key);
    
    if (e.key === '/') {
      const textarea = e.currentTarget;
      const cursorPos = textarea.selectionStart;
      const textBefore = content.substring(0, cursorPos);
      
      console.log('Slash detected at position:', cursorPos);
      console.log('Text before cursor:', textBefore);
      
      // Check if / is at start of line or after whitespace
      const lines = textBefore.split('\n');
      const currentLineText = lines[lines.length - 1];
      const isAtStartOfLine = currentLineText.length === 0;
      const isAfterWhitespace = currentLineText.length > 0 && /\s$/.test(currentLineText);
      
      console.log('Current line text:', currentLineText);
      console.log('Is at start of line:', isAtStartOfLine);
      console.log('Is after whitespace:', isAfterWhitespace);
      
      if (isAtStartOfLine || isAfterWhitespace) {
        e.preventDefault();
        setCursorPosition(cursorPos);
        
        // Calculate position for slash menu
        const rect = textarea.getBoundingClientRect();
        const scrollTop = textarea.scrollTop;
        const lineHeight = 24; // Approximate line height
        const currentLine = lines.length - 1;
        
        const menuX = rect.left + 10;
        const menuY = rect.top + (currentLine * lineHeight) + 30 - scrollTop;
        
        console.log('Menu position:', { x: menuX, y: menuY });
        
        setSlashMenuPosition({
          x: menuX,
          y: menuY
        });
        setShowSlashMenu(true);
        
        console.log('Slash menu should be visible now');
      }
    } else if (e.key === 'Escape') {
      console.log('Escape pressed, hiding slash menu');
      setShowSlashMenu(false);
    }
  };

  const insertAtCursor = (text: string) => {
    console.log('Inserting text at cursor:', text);
    const newContent = content.substring(0, cursorPosition) + text + content.substring(cursorPosition);
    setContent(newContent);
    setShowSlashMenu(false);
    
    // Focus back to textarea and position cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = cursorPosition + text.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle drag and drop from reference sidebar
  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const droppedText = e.dataTransfer.getData('text/plain');
    if (droppedText) {
      const textarea = e.currentTarget;
      const dropPosition = textarea.selectionStart;
      const newContent = content.substring(0, dropPosition) + droppedText + content.substring(dropPosition);
      setContent(newContent);
      
      // Position cursor after inserted text
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = dropPosition + droppedText.length;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
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

  // Debug effect to log slash menu state
  useEffect(() => {
    console.log('Slash menu visibility changed:', showSlashMenu);
    console.log('Slash menu position:', slashMenuPosition);
  }, [showSlashMenu, slashMenuPosition]);

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
            Save to GitHub
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
            <div className="flex-1 flex flex-col relative">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  placeholder="Start writing your markdown... Type / for quick commands or drag elements from the sidebar"
                  className="h-full w-full resize-none border-0 rounded-none focus:ring-0 focus-visible:ring-0 font-mono text-sm leading-relaxed p-6"
                  style={{ 
                    minHeight: '100%',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}
                />
                {/* Slash Command Menu - positioned absolutely within the editor container */}
                {showSlashMenu && (
                  <div 
                    className="absolute pointer-events-auto"
                    style={{ 
                      left: slashMenuPosition.x - 200,
                      top: slashMenuPosition.y + 50,
                      zIndex: 1000
                    }}
                  >
                    <SlashCommandMenu
                      position={slashMenuPosition}
                      onSelect={insertAtCursor}
                      onClose={() => setShowSlashMenu(false)}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Markdown Reference Sidebar */}
            <MarkdownReference onInsert={insertAtCursor} />
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
