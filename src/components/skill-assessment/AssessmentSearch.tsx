
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AssessmentSearchProps {
  searchQuery: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AssessmentSearch = ({ searchQuery, onSearch }: AssessmentSearchProps) => {
  return (
    <section className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between w-full">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <Input
          placeholder="Search assessments..."
          className="pl-8 sm:pl-9 w-full text-sm"
          onChange={onSearch}
          value={searchQuery}
        />
      </div>
    </section>
  );
};
