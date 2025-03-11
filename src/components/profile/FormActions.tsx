
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  loading: boolean;
  onCancel: () => void;
}

export const FormActions = ({ loading, onCancel }: FormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={loading}
      >
        {loading ? "Updating..." : "Save Changes"}
      </Button>
    </div>
  );
};
