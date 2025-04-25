
import { Pricing } from "@/components/ui/pricing";

const tuteeraPricing = [
  {
    name: "Free",
    price: "$0",
    yearlyPrice: "$0",
    period: "forever",
    features: [
      "5 quizzes per month",
      "2 interview simulations per month",
      "1 skill assessment per month",
      "Basic dashboard and course tracking",
    ],
    description: "Perfect for trying out Tuterra's core features",
    buttonText: "Get Started",
    href: "/auth?tab=signup",
    isPopular: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    yearlyPrice: "$95.88",
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
        title="Choose Your Learning Journey"
        description="Start with our free plan or upgrade for unlimited access to all features"
      />
    </div>
  );
}
