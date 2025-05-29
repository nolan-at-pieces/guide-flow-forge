
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MarkdownReferenceProps {
  onInsert: (text: string) => void;
}

interface MarkdownItem {
  label: string;
  syntax: string;
  tooltip: string;
  example?: string;
}

const MarkdownReference = ({ onInsert }: MarkdownReferenceProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const markdownSections = {
    headers: [
      { label: 'Header 1', syntax: '# ', tooltip: 'Creates a large heading (H1)', example: '# My Main Title' },
      { label: 'Header 2', syntax: '## ', tooltip: 'Creates a medium heading (H2)', example: '## Section Title' },
      { label: 'Header 3', syntax: '### ', tooltip: 'Creates a small heading (H3)', example: '### Subsection' },
    ],
    formatting: [
      { label: 'Bold', syntax: '**bold text**', tooltip: 'Makes text bold/strong', example: '**important text**' },
      { label: 'Italic', syntax: '*italic text*', tooltip: 'Makes text italic/emphasized', example: '*emphasized text*' },
      { label: 'Inline Code', syntax: '`code`', tooltip: 'Formats text as inline code', example: '`const x = 5;`' },
      { label: 'Strikethrough', syntax: '~~text~~', tooltip: 'Strikes through text', example: '~~deleted text~~' },
    ],
    lists: [
      { label: 'Bullet List', syntax: '- ', tooltip: 'Creates an unordered list item', example: '- First item\n- Second item' },
      { label: 'Numbered List', syntax: '1. ', tooltip: 'Creates an ordered list item', example: '1. First step\n2. Second step' },
      { label: 'Todo Item', syntax: '- [ ] ', tooltip: 'Creates a checkbox list item', example: '- [ ] Task to do\n- [x] Completed task' },
    ],
    media: [
      { label: 'Link', syntax: '[link text](url)', tooltip: 'Creates a clickable link', example: '[Google](https://google.com)' },
      { label: 'Image', syntax: '![alt text](image.jpg)', tooltip: 'Embeds an image', example: '![Logo](logo.png)' },
    ],
    blocks: [
      { label: 'Code Block', syntax: '```\ncode here\n```', tooltip: 'Creates a formatted code block', example: '```javascript\nconst x = 5;\n```' },
      { label: 'Blockquote', syntax: '> ', tooltip: 'Creates a quoted text block', example: '> This is a quote' },
      { label: 'Horizontal Rule', syntax: '---', tooltip: 'Creates a horizontal divider line', example: '---' },
    ],
  };

  const handleDragStart = (e: React.DragEvent, syntax: string) => {
    setDraggedItem(syntax);
    e.dataTransfer.setData('text/plain', syntax);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleClick = (syntax: string) => {
    onInsert(syntax);
  };

  const DraggableItem = ({ item }: { item: MarkdownItem }) => (
    <TooltipProvider key={item.syntax}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, item.syntax)}
            onDragEnd={handleDragEnd}
            onClick={() => handleClick(item.syntax)}
            className={`
              cursor-pointer select-none px-2 py-1 rounded text-xs font-mono 
              transition-all duration-200 border border-transparent
              hover:bg-muted hover:border-border hover:shadow-sm
              active:scale-95
              ${draggedItem === item.syntax ? 'opacity-50 scale-95' : ''}
            `}
          >
            {item.syntax}
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-medium">{item.label}</div>
            <div className="text-xs text-muted-foreground">{item.tooltip}</div>
            {item.example && (
              <div className="text-xs font-mono bg-muted p-1 rounded">
                {item.example}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="w-72 border-l bg-muted/20 overflow-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm text-foreground">Markdown Reference</h3>
          <div className="text-xs text-muted-foreground">Drag or click to insert</div>
        </div>
        
        <div className="space-y-4 text-xs">
          <div>
            <div className="font-medium mb-2 text-foreground">Headers</div>
            <div className="space-y-1">
              {markdownSections.headers.map(item => (
                <DraggableItem key={item.syntax} item={item} />
              ))}
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-2 text-foreground">Text Formatting</div>
            <div className="space-y-1">
              {markdownSections.formatting.map(item => (
                <DraggableItem key={item.syntax} item={item} />
              ))}
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-2 text-foreground">Lists</div>
            <div className="space-y-1">
              {markdownSections.lists.map(item => (
                <DraggableItem key={item.syntax} item={item} />
              ))}
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-2 text-foreground">Links & Images</div>
            <div className="space-y-1">
              {markdownSections.media.map(item => (
                <DraggableItem key={item.syntax} item={item} />
              ))}
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-2 text-foreground">Code & Blocks</div>
            <div className="space-y-1">
              {markdownSections.blocks.map(item => (
                <DraggableItem key={item.syntax} item={item} />
              ))}
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
  );
};

export default MarkdownReference;
