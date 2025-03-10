
import React from "react";
import { Button } from "@/components/ui/button";
import { useLegal } from "@/contexts/LegalContext";
import { ExternalLink } from "lucide-react";

interface LegalLinkProps {
  type: "privacy" | "terms";
  className?: string;
  variant?: "link" | "ghost" | "outline";
  size?: "sm" | "default";
  showIcon?: boolean;
}

export function LegalLink({ 
  type, 
  className = "", 
  variant = "link", 
  size = "default",
  showIcon = false
}: LegalLinkProps) {
  const { openLegalDocument } = useLegal();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openLegalDocument(type);
  };
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      className={`px-0 font-normal ${className}`}
      onClick={handleClick}
    >
      {type === "privacy" ? "Privacy Policy" : "Terms of Use"}
      {showIcon && <ExternalLink className="ml-1 h-3 w-3" />}
    </Button>
  );
}
