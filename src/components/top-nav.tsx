
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TopNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: "products", label: "Products" },
  { id: "api", label: "API Reference" }
];

const TopNav = ({ activeSection, onSectionChange }: TopNavProps) => {
  return (
    <div className="border-b bg-background">
      <div className="flex items-center px-6 py-2">
        <nav className="flex space-x-1">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "text-sm font-medium transition-colors",
                activeSection === section.id 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {section.label}
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TopNav;
