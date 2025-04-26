
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { MobileNavItems } from "./MobileNavItems";
import { MobileUserProfile } from "./MobileUserProfile";

interface MobileMenuProps {
  onClose: () => void;
}

export function MobileMenu({ onClose }: MobileMenuProps) {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-primary-100/80 to-primary-200/80 backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/30">
        <Link to="/" className="flex items-center" onClick={onClose}>
          <span className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">Tuterra</span>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="touch-manipulation h-10 w-10"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <MobileNavItems onClose={onClose} />
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200/30 p-4">
        <MobileUserProfile onClose={onClose} />
      </div>
    </div>
  );
}
