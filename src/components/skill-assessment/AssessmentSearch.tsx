import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssessmentSearchProps {
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AssessmentSearch = ({ searchQuery, onSearch }: AssessmentSearchProps) => {
  return (
    <div className="relative mt-2 w-full max-w-md">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9a7f2a]/60 pointer-events-none" />
      <input
        type="text"
        placeholder="Search assessments…"
        value={searchQuery}
        onChange={onSearch}
        className={cn(
          "w-full rounded-full py-2.5 pl-9 pr-4 text-sm",
          "border border-[#C8A84B]/40 bg-white",
          "text-[#1a1a1a] placeholder:text-[#8a7a5a]/60",
          "shadow-[inset_0_1px_3px_rgba(184,134,11,0.06)]",
          "focus:outline-none focus:border-[#C8A84B]/80 focus:ring-1 focus:ring-[#C8A84B]/40",
          "transition-all duration-200"
        )}
      />
    </div>
  );
};
