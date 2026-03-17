import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  loading: boolean;
  disabled?: boolean;
}

export const SubmitButton = ({ loading, disabled }: SubmitButtonProps) => {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full h-11 rounded-full bg-[#ac9571] hover:bg-[#9a8362] text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ac9571]/20"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Creating account...</span>
        </span>
      ) : (
        "Create Account"
      )}
    </button>
  );
};
