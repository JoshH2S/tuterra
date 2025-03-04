
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackHeader } from "./FeedbackHeader";
import { useIsMobile } from "@/hooks/use-mobile";

export function EmptyFeedback() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <FeedbackHeader />
      <Card>
        <CardContent className={`${isMobile ? 'p-3 pt-4' : 'pt-6'}`}>
          <p className="text-muted-foreground">Feedback not available for this quiz yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
