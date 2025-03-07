
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MobileSearchProps {
  onClose: () => void;
}

function SearchResults() {
  return (
    <div className="py-4">
      <p className="text-center text-sm text-muted-foreground">
        No results found. Try a different search term.
      </p>
    </div>
  );
}

export function MobileSearch({ onClose }: MobileSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Prevent body scrolling when search is open
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm safe-area-top"
    >
      <div className="h-full py-4 px-4">
        <div className="relative h-full flex flex-col">
          <div className="flex items-center gap-2 pb-4">
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex h-10 w-full rounded-md bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 touch-manipulation"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close search</span>
            </motion.button>
          </div>

          <div className="overflow-y-auto overscroll-contain momentum-scroll flex-1">
            <SearchResults />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
