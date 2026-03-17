import { Gift, Check, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const glassInputClass =
  "flex h-11 w-full rounded-full border bg-white/10 border-white/15 px-4 py-2 pl-10 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ac9571]/50 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50";

interface PromoCodeInputProps {
  promoCode: string;
  setPromoCode: (value: string) => void;
  feedbackConsent: boolean;
  setFeedbackConsent: (value: boolean) => void;
  promoCodeApplied: boolean;
  showFeedbackConsent?: boolean;
}

export const PromoCodeInput = ({
  promoCode,
  setPromoCode,
  feedbackConsent,
  setFeedbackConsent,
  promoCodeApplied,
  showFeedbackConsent = false,
}: PromoCodeInputProps) => {
  const showConsentCheckbox = promoCode.toUpperCase() === "FIRST30";

  return (
    <div className="space-y-3">
      <div className="relative">
        <Label htmlFor="promoCode" className="text-sm font-medium text-white/60">
          Promo Code (Optional)
        </Label>
        <div className="relative mt-1">
          <Gift className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            id="promoCode"
            placeholder="Enter promo code (e.g., FIRST30)"
            className={glassInputClass}
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            maxLength={20}
          />
          {promoCodeApplied && (
            <Check className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-400" />
          )}
        </div>
      </div>

      {showConsentCheckbox && (
        <div className="rounded-xl p-4 bg-[#ac9571]/10 border border-[#ac9571]/20">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-[#c9a96e] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-[#c9a96e] font-medium">🎉 FIRST30 Promotion</p>
              <p className="text-sm text-white/60 mt-1">
                Get <strong className="text-white/80">1 free virtual internship</strong> as one of our first 30 users!
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-2 pl-6">
            <Checkbox
              id="feedbackConsent"
              checked={feedbackConsent}
              onCheckedChange={(checked) => setFeedbackConsent(checked === true)}
              className="mt-0.5 border-white/30 data-[state=checked]:bg-[#ac9571] data-[state=checked]:border-[#ac9571]"
            />
            <Label
              htmlFor="feedbackConsent"
              className="text-sm text-white/60 leading-relaxed cursor-pointer"
            >
              I consent to receiving a feedback survey via email after completing my promotional
              internship (~1 month).
            </Label>
          </div>

          {promoCode && !feedbackConsent && (
            <p className="text-xs text-red-400 font-medium pl-6 mt-2">
              * Feedback consent is required for FIRST30 promo code
            </p>
          )}
        </div>
      )}

      {promoCode && promoCode.toUpperCase() !== "FIRST30" && (
        <p className="text-xs text-white/30 px-4">
          Your promo code will be validated and applied after account verification
        </p>
      )}
    </div>
  );
};
