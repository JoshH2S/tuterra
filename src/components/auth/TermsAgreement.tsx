import { Shield } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface TermsAgreementProps {
  agreed: boolean;
  onAgreeChange: (checked: boolean) => void;
  onShowTerms: () => void;
  onShowPrivacyPolicy: () => void;
}

export const TermsAgreement = ({
  agreed,
  onAgreeChange,
  onShowTerms,
  onShowPrivacyPolicy,
}: TermsAgreementProps) => {
  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id="terms"
        checked={agreed}
        onCheckedChange={(checked) => onAgreeChange(checked === true)}
        className="border-white/30 data-[state=checked]:bg-[#ac9571] data-[state=checked]:border-[#ac9571]"
      />
      <div className="grid gap-1.5 leading-none">
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none text-white/70 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to the{" "}
          <button
            type="button"
            className="text-[#c9a96e] hover:underline focus:outline-none focus:underline"
            onClick={onShowTerms}
          >
            Terms of Use
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="text-[#c9a96e] hover:underline focus:outline-none focus:underline"
            onClick={onShowPrivacyPolicy}
          >
            Privacy Policy
          </button>
        </label>
        <p className="text-xs text-white/30 flex items-center">
          <Shield className="h-3 w-3 mr-1" />
          Your data is protected and secured
        </p>
      </div>
    </div>
  );
};
