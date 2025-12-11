import { Gift, Check, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

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
  const showConsentCheckbox = promoCode.toUpperCase() === 'FIRST30';

  return (
    <div className="space-y-3">
      <div className="relative">
        <Label htmlFor="promoCode" className="text-sm font-medium">
          Promo Code (Optional)
        </Label>
        <div className="relative mt-1">
          <Gift className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="promoCode"
            placeholder="Enter promo code (e.g., FIRST30)"
            className="pl-10"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            maxLength={20}
          />
          {promoCodeApplied && (
            <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600" />
          )}
        </div>
      </div>

      {showConsentCheckbox && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="space-y-3 pl-6">
            <p className="text-sm text-blue-900 font-medium">
              🎉 FIRST30 Promotion
            </p>
            <p className="text-sm text-blue-800">
              Get <strong>1 free virtual internship</strong> as one of our first 30 users!
            </p>
            
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="feedbackConsent"
                checked={feedbackConsent}
                onCheckedChange={(checked) => setFeedbackConsent(checked === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor="feedbackConsent"
                className="text-sm text-blue-900 leading-relaxed cursor-pointer"
              >
                I consent to receiving a feedback survey via email after completing my 
                promotional internship (~1 month). This helps us improve Tuterra for 
                future students.
              </Label>
            </div>
            
            {promoCode && !feedbackConsent && (
              <p className="text-xs text-red-600 font-medium pl-6">
                * Feedback consent is required for FIRST30 promo code
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {promoCode && promoCode.toUpperCase() !== 'FIRST30' && (
        <p className="text-xs text-muted-foreground">
          Your promo code will be validated and applied after account verification
        </p>
      )}
    </div>
  );
};
