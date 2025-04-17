
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CtaSectionProps {
  ctaUrl?: string;
}

export const CtaSection = ({ ctaUrl = "/auth?tab=signup" }: CtaSectionProps) => {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to transform your learning experience?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Join thousands of students who are learning faster and more effectively with Tuterra's AI-powered tools.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" asChild>
              <Link to={ctaUrl}>Get Started Today</Link>
            </Button>
            <Link to="/pricing" className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary transition-colors">
              View pricing <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
