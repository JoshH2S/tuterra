
import { Newspaper } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const NewsNoResults = () => {
  return (
    <Alert className="mb-6">
      <Newspaper className="h-4 w-4" />
      <AlertDescription>
        No recent news found for your selected topics. Try selecting different topics in your profile settings.
      </AlertDescription>
    </Alert>
  );
};
