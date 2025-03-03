
import { Loader2 } from "lucide-react";

export function ResultsLoader() {
  return (
    <div className="container mx-auto py-8 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      <p className="text-lg mt-2">Loading quiz results...</p>
    </div>
  );
}
