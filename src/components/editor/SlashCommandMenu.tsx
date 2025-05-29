
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, 
  Code, Image, Link, 
  Table, AlertCircle, CheckSquare,
  Minus
} from 'lucide-react';

interface SlashCommand {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  template: string;
}

interface SlashCommandMenuProps {
  position: { x: number; y: number };
  onSelect: (template: string) => void;
  onClose: () => void;
}

const commands: SlashCommand[] = [
  // Headings
  {
    id: 'h1',
    label: 'Heading 1',
    description: 'Large section heading',
    category: 'Headings',
    icon: Heading1,
    template: '# Heading 1\n\n'
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Medium section heading',
    category: 'Headings',
    icon: Heading2,
    template: '## Heading 2\n\n'
  },
  {
    id: 'h3',
    label: 'Heading 3',
    description: 'Small section heading',
    category: 'Headings',
    icon: Heading3,
    template: '### Heading 3\n\n'
  },

  // Text Formatting
  {
    id: 'paragraph',
    label: 'Paragraph',
    description: 'Plain text paragraph',
    category: 'Text',
    icon: Quote,
    template: 'Your text here\n\n'
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Blockquote',
    category: 'Text',
    icon: Quote,
    template: '> Your quote here\n\n'
  },

  // Lists
  {
    id: 'bullet-list',
    label: 'Bullet List',
    description: 'Unordered list',
    category: 'Lists',
    icon: List,
    template: '- Item 1\n- Item 2\n- Item 3\n\n'
  },
  {
    id: 'numbered-list',
    label: 'Numbered List',
    description: 'Ordered list',
    category: 'Lists',
    icon: ListOrdered,
    template: '1. Item 1\n2. Item 2\n3. Item 3\n\n'
  },
  {
    id: 'checklist',
    label: 'Checklist',
    description: 'Task list with checkboxes',
    category: 'Lists',
    icon: CheckSquare,
    template: '- [ ] Task 1\n- [ ] Task 2\n- [x] Completed task\n\n'
  },

  // Code
  {
    id: 'code-block',
    label: 'Code Block',
    description: 'Code with syntax highlighting',
    category: 'Code',
    icon: Code,
    template: '```javascript\nconst example = "Hello World";\nconsole.log(example);\n```\n\n'
  },
  {
    id: 'inline-code',
    label: 'Inline Code',
    description: 'Inline code snippet',
    category: 'Code',
    icon: Code,
    template: '`code here`'
  },

  // Media
  {
    id: 'image',
    label: 'Image',
    description: 'Insert an image',
    category: 'Media',
    icon: Image,
    template: '![Alt text](image-url)\n\n'
  },
  {
    id: 'link',
    label: 'Link',
    description: 'Insert a link',
    category: 'Media',
    icon: Link,
    template: '[Link text](url)'
  },

  // Components
  {
    id: 'table',
    label: 'Table',
    description: 'Insert a table',
    category: 'Components',
    icon: Table,
    template: '| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Row 1    | Data     | Data     |\n| Row 2    | Data     | Data     |\n\n'
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Horizontal line',
    category: 'Components',
    icon: Minus,
    template: '---\n\n'
  },
  {
    id: 'alert',
    label: 'Alert',
    description: 'Information callout',
    category: 'Components',
    icon: AlertCircle,
    template: '> **Note:** This is an important note\n\n'
  }
];

const SlashCommandMenu = ({ position, onSelect, onClose }: SlashCommandMenuProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState(commands);
  const menuRef = useRef<HTMLDivElement>(null);

  const categories = Array.from(new Set(filteredCommands.map(cmd => cmd.category)));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].template);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filteredCommands, selectedIndex, onSelect, onClose]);

  return (
    <Card 
      ref={menuRef}
      className="absolute z-50 w-80 max-h-96 overflow-auto shadow-lg"
      style={{ 
        left: position.x, 
        top: position.y,
        maxWidth: 'calc(100vw - 20px)'
      }}
    >
      <CardContent className="p-0">
        <div className="p-2 border-b">
          <p className="text-sm font-medium text-muted-foreground">Insert Element</p>
        </div>
        
        {categories.map(category => (
          <div key={category}>
            <div className="px-3 py-2 border-b">
              <Badge variant="outline" className="text-xs">{category}</Badge>
            </div>
            
            {filteredCommands
              .filter(cmd => cmd.category === category)
              .map((command, index) => {
                const globalIndex = filteredCommands.findIndex(cmd => cmd.id === command.id);
                const Icon = command.icon;
                
                return (
                  <div
                    key={command.id}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent ${
                      globalIndex === selectedIndex ? 'bg-accent' : ''
                    }`}
                    onClick={() => onSelect(command.template)}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{command.label}</div>
                      <div className="text-xs text-muted-foreground">{command.description}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SlashCommandMenu;
