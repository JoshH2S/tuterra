import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";

interface GeneratedCoursesNoResultsProps {
  searchQuery?: string;
  onClearFilters: () => void;
}

export function GeneratedCoursesNoResults({ 
  searchQuery, 
  onClearFilters 
}: GeneratedCoursesNoResultsProps) {
  return (
    <PremiumCard className="p-12 text-center">
      <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No courses found</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {searchQuery 
          ? `No courses match "${searchQuery}"`
          : "No courses match the selected filters"}
      </p>
      <Button onClick={onClearFilters} variant="outline">
        Clear Filters
      </Button>
    </PremiumCard>
  );
}






