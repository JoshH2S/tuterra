
import { Newspaper } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NewsTopicsDialog } from "@/components/profile/NewsTopicsDialog";

interface NewsEmptyStateProps {
  showTopicsDialog: boolean;
  onDialogClose: () => Promise<void>;
}

export const NewsEmptyState = ({ showTopicsDialog, onDialogClose }: NewsEmptyStateProps) => {
  return (
    <>
      <Alert className="mb-6">
        <Newspaper className="h-4 w-4" />
        <AlertDescription>
          Select your topics of interest to personalize your news feed
        </AlertDescription>
      </Alert>
      <NewsTopicsDialog
        open={showTopicsDialog}
        onClose={onDialogClose}
        isFirstTimeSetup={true}
      />
    </>
  );
};
