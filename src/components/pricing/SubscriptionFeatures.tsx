
import { Info, Check } from "lucide-react";
import { InteractiveTooltip } from "@/components/ui/interactive-tooltip";

interface PlanFeatureProps {
  feature: string;
  tooltip?: string;
}

export function PlanFeature({ feature, tooltip }: PlanFeatureProps) {
  return (
    <li className="flex text-sm">
      <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
      <span className="ml-3 flex items-center gap-2">
        {feature}
        {tooltip && (
          <InteractiveTooltip
            trigger={<Info className="h-4 w-4 text-muted-foreground cursor-help" />}
            content={tooltip}
          />
        )}
      </span>
    </li>
  );
}

export function SubscriptionFeatures({
  features,
  tooltips
}: {
  features: string[];
  tooltips?: Record<string, string>;
}) {
  return (
    <ul className="mt-6 space-y-3">
      {features.map((feature) => (
        <PlanFeature 
          key={feature} 
          feature={feature}
          tooltip={tooltips?.[feature]}
        />
      ))}
    </ul>
  );
}
