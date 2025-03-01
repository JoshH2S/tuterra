
import { Button } from "@/components/ui/button";

interface QuizSubmitButtonProps {
  isSubmitting: boolean;
  onSubmit: () => void;
  isLastQuestion?: boolean;
}

export const QuizSubmitButton = ({
  isSubmitting,
  onSubmit,
  isLastQuestion = false,
}: QuizSubmitButtonProps) => {
  if (!isLastQuestion) {
    return (
      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="min-w-[100px] bg-green-600 hover:bg-green-700"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    );
  }

  return (
    <Button
      onClick={onSubmit}
      disabled={isSubmitting}
      className="w-full mt-6 py-6 text-lg bg-green-600 hover:bg-green-700"
    >
      {isSubmitting ? "Submitting..." : "Submit Quiz"}
    </Button>
  );
};
