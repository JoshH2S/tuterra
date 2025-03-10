
import React from "react";
import { LegalLink } from "@/components/legal/LegalLink";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="w-full py-4 px-4 mt-auto border-t bg-background/60 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-10">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between text-sm text-muted-foreground">
        <div className="mb-2 sm:mb-0">
          © {new Date().getFullYear()} EduPortal. All rights reserved.
        </div>
        <div className="flex items-center space-x-4">
          <LegalLink type="privacy" size="sm" />
          <Separator orientation="vertical" className="h-4" />
          <LegalLink type="terms" size="sm" />
        </div>
      </div>
    </footer>
  );
}
