
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LegalLink } from "./LegalLink";

interface LegalAgreementCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function LegalAgreementCheckbox({ checked, onCheckedChange }: LegalAgreementCheckboxProps) {
  return (
    <div className="flex items-start space-x-2 my-4">
      <Checkbox 
        id="terms" 
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
      <div className="grid gap-1.5 leading-none">
        <Label 
          htmlFor="terms" 
          className="text-sm font-normal text-muted-foreground"
        >
          By signing up, you agree to our{" "}
          <LegalLink type="privacy" className="h-auto p-0 font-normal text-primary" />{" "}
          and{" "}
          <LegalLink type="terms" className="h-auto p-0 font-normal text-primary" />
        </Label>
      </div>
    </div>
  );
}
