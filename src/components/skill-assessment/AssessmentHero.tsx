import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssessmentHeroProps {
  onCreateNew: () => void;
}

export const AssessmentHero = ({ onCreateNew }: AssessmentHeroProps) => {
  const heroImage =
    "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/skillassessment2.jpg')";

  return (
    <div className="px-4 sm:px-6 relative z-10 mb-14">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          "border border-[#C8A84B]/60",
          "bg-[#F7F3EC]",
          "shadow-[0_8px_32px_-8px_rgba(184,134,11,0.18),inset_0_1px_0_0_rgba(255,255,255,0.9)]"
        )}
      >
        {/* Top gold hairline accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8A84B]/70 to-transparent" />

        {/* Mobile: full-bleed image */}
        <div
          className="sm:hidden absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: heroImage }}
        />
        <div className="sm:hidden absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

        {/* Desktop: two-column grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          {/* Text column */}
          <div className="flex flex-col justify-end sm:justify-between p-6 sm:p-10 min-h-[300px] sm:min-h-[320px]">
            <div>
              {/* Eyebrow */}
              <div className="mb-5 flex items-center gap-3">
                <p className="text-[10px] font-mono tracking-[0.28em] uppercase text-white/75 sm:text-[#9a7f2a]">
                  Professional Growth
                </p>
                <span className="hidden sm:block h-px flex-1 max-w-[120px] bg-gradient-to-r from-[#C8A84B]/60 to-transparent" />
              </div>

              <h1 className="font-manrope text-3xl md:text-[40px] font-medium leading-[1.1] tracking-tight text-white sm:text-[#1a1a1a]">
                Skill Assessments
              </h1>

              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-[#5a5040]">
                Track your professional growth with AI-powered assessments tailored to your industry.
              </p>
            </div>

            <div className="mt-8">
              <Button
                onClick={onCreateNew}
                className={cn(
                  "group inline-flex items-center gap-2 px-6 py-5 rounded-full font-semibold text-white",
                  "bg-gradient-to-br from-[#DAA520] to-[#B8860B]",
                  "shadow-[0_8px_24px_-8px_rgba(184,134,11,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]",
                  "hover:from-[#E4B333] hover:to-[#C99416]",
                  "hover:shadow-[0_10px_28px_-8px_rgba(184,134,11,0.65),inset_0_1px_0_rgba(255,255,255,0.3)]",
                  "hover:-translate-y-0.5 transition-all duration-200"
                )}
              >
                <Plus className="h-4 w-4" />
                Create Assessment
              </Button>
            </div>
          </div>

          {/* Desktop-only: full-bleed image */}
          <div className="relative hidden sm:block">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: heroImage }}
            />
            {/* Gold hairline divider */}
            <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#C8A84B]/50 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};
