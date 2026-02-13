import { GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";

interface GeneratedCoursesEmptyStateProps {
  onCreateClick: () => void;
}

export function GeneratedCoursesEmptyState({ onCreateClick }: GeneratedCoursesEmptyStateProps) {
  return (
    <PremiumCard className="p-12 text-center">
      <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Create your first personalized course on any topic. Our AI will generate
        a complete learning journey with modules, checkpoints, and feedback.
      </p>
      <Button onClick={onCreateClick} size="lg">
        <Plus className="h-5 w-5 mr-2" />
        Create Your First Course
      </Button>
    </PremiumCard>
  );
}






