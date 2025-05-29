
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
      <div className="flex items-center px-6">
        <nav className="flex space-x-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors border-b-2 border-transparent",
                activeSection === section.id 
                  ? "text-primary border-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TopNav;
