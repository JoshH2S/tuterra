
import { Pricing } from "@/components/ui/pricing";

const tuteeraPricing = [
  {
    name: "Pro",
    price: "$5.99",
    yearlyPrice: "$4.79",
    period: "per month",
    features: [
      "Unlimited quizzes, assessments, and interview simulations",
      "AI feedback on every quiz and skill report",
      "Learning path planning & skill progress tracking",
      "Priority support",
    ],
    description: "Best for individual learners and professionals",
    buttonText: "Choose Pro",
    href: "/auth?tab=signup",
    isPopular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    yearlyPrice: "Custom",
    period: "per month",
    features: [
      "Custom onboarding & dashboards",
      "Group analytics and LMS integrations",
      "Instructor tools",
      "Content alignment with curriculum",
      "Admin panel to manage learners",
    ],
    description: "Designed for schools, bootcamps, and institutions",
    buttonText: "Contact Sales",
    href: "/contact",
    isPopular: false,
  },
];

export function PricingSection() {
  return (
    <div className="bg-background">
      <Pricing
        plans={tuteeraPricing}
        eyebrow="Pricing"
        title="Choose Your Learning Journey"
        description="Upgrade for unlimited access to all features"
      />
    </div>
  );
}
