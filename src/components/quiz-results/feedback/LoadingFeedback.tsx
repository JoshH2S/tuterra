
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackHeader } from "./FeedbackHeader";
import { useIsMobile } from "@/hooks/use-mobile";

export function LoadingFeedback() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <FeedbackHeader isGenerating={true} />
      <Card>
        <CardContent className={`${isMobile ? 'p-3 pt-4' : 'pt-6'} space-y-2`}>
          <h3 className="text-lg font-semibold mb-3 text-[#091747]">Analyzing your performance</h3>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    </div>
  );
}
