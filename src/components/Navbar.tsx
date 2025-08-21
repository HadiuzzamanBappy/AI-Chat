import { Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export function Navbar({ onToggleSidebar, title = "ChatGPT" }: NavbarProps) {
  return (
    <nav className="bg-background border-b border-border px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 whitespace-nowrap w-full">
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleSidebar}
            className="h-8 w-8 p-0 flex-shrink-0" 
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <div className="flex items-center space-x-2 min-w-0">
            <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
            <h1 className="text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
}