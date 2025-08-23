import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export function Navbar({ onToggleSidebar, title = "AI Chat" }: NavbarProps) {
  return (
    <nav className="bg-background/95 border-b border-border px-4 py-3 md:hidden sticky top-0 z-50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 whitespace-nowrap w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-9 w-9 p-0 rounded-lg hover:bg-muted" 
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <div className="flex items-center space-x-3 min-w-0">
            <h1 className="text-lg font-bold text-foreground truncate">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
}