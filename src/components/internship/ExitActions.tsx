
import { ModernCard } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";

export function ExitActions() {
  return (
    <ModernCard>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        
        {/* Preview of next module */}
        <div className="p-4 mb-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="text-md font-medium mb-1">Coming Up Next:</h3>
          <h4 className="text-primary font-medium">Campaign Launch Strategy</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Learn how to plan and execute a successful product launch campaign from start to finish.
          </p>
          <div className="text-xs text-gray-500 mt-2">
            Unlocks after current module completion
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="space-y-3 mt-4">
          <Button variant="outline" className="w-full">
            Ask for Feedback
          </Button>
          
          <Button className="w-full">
            Submit Final Project
          </Button>
        </div>
      </div>
    </ModernCard>
  );
}
