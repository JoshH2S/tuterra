
import { Button } from "@/components/ui/button";
import { Plus, FileQuestion } from "lucide-react";

interface AssessmentHeroProps {
  onCreateNew: () => void;
}

export const AssessmentHero = ({ onCreateNew }: AssessmentHeroProps) => {
  return (
    <div className="container mx-auto px-4 relative z-10 mb-10">
      <div
        className="relative rounded-2xl border-2 border-[#C8A84B] shadow-[0_4px_24px_rgba(0,0,0,0.12)] flex flex-col sm:flex-row bg-[#F7F3EC] p-4 gap-4 overflow-hidden"
        style={{ minHeight: '280px' }}
      >
        <div className="flex flex-col p-4 sm:w-[40%] shrink-0 justify-center gap-4">
          <div>
            <p className="text-xs font-mono text-[#8a7a5a] mb-3 tracking-wide uppercase">Professional Growth</p>
            <div className="flex items-start gap-3 mb-3">
              <FileQuestion className="h-7 w-7 text-[#7a6a2a] mt-0.5 shrink-0" />
              <h1 className="text-3xl md:text-4xl font-medium font-manrope text-[#1a1a1a] leading-tight tracking-tight">Skill Assessments</h1>
            </div>
            <p className="text-sm text-[#5a5040] leading-relaxed">
              Track your professional growth with AI-powered assessments tailored to your industry.
            </p>
          </div>
          <div>
            <Button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-6 py-5 rounded-full text-black/80 bg-white/30 backdrop-blur-md border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-white/45 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] hover:-translate-y-0.5 transition-all font-semibold"
            >
              <Plus className="h-5 w-5" />
              Create Assessment
            </Button>
          </div>
        </div>
        <div
          className="flex-1 rounded-xl bg-cover bg-center min-h-[180px] sm:min-h-0"
          style={{ backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/skillassessment2.jpg')" }}
        />
      </div>
    </div>
  );
};
