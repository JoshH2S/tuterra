import { ChevronLeft, ChevronRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InternshipMobileHeaderProps {
  title: string;
  industry?: string;
  activeIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  maxIndex: number;
}

export function InternshipMobileHeader({ 
  title, 
  industry,
  activeIndex, 
  onPrevious, 
  onNext,
  maxIndex
}: InternshipMobileHeaderProps) {
  return (
    <div className="border-b p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium truncate">{title}</h2>
          {industry && (
            <Badge variant="outline" className="text-xs h-5 px-1.5 font-normal">
              {industry}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={activeIndex === 0}
            onClick={onPrevious}
            className="h-7 w-7"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={activeIndex === maxIndex}
            onClick={onNext}
            className="h-7 w-7"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 