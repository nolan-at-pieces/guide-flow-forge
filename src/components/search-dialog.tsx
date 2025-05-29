
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  title: string;
  slug: string;
  excerpt: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Mock search results - in a real app, this would use Lunr.js or similar
    const mockResults: SearchResult[] = [
      {
        title: "Getting Started",
        slug: "getting-started",
        excerpt: "Learn how to get started with MyProject..."
      },
      {
        title: "Installation",
        slug: "getting-started/installation",
        excerpt: "Install MyProject using npm or yarn..."
      },
      {
        title: "API Reference",
        slug: "api-reference",
        excerpt: "Complete API documentation..."
      }
    ].filter(result => 
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.excerpt.toLowerCase().includes(query.toLowerCase())
    );

    setResults(mockResults);
  }, [query]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Documentation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search for anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-base"
          />
          <ScrollArea className="max-h-96">
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.slug}
                  className="cursor-pointer rounded-md p-3 hover:bg-accent"
                  onClick={() => {
                    window.location.href = `/docs/${result.slug}`;
                    onOpenChange(false);
                  }}
                >
                  <div className="font-medium">{result.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {result.excerpt}
                  </div>
                </div>
              ))}
              {query && results.length === 0 && (
                <div className="p-3 text-center text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
