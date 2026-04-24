import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Building2, Eye, FileText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AssessmentCardProps {
  assessment: {
    id: string;
    title: string;
    industry: string;
    role: string;
    questions?: { skill: string }[];
  };
  onViewAssessment: (id: string) => void;
}

export const AssessmentCard = ({ assessment, onViewAssessment }: AssessmentCardProps) => {
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [latestResultId, setLatestResultId] = useState<string | null>(null);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const skills = assessment.questions
    ?.map((q) => q.skill)
    .filter((value, index, self) => value && self.indexOf(value) === index) || [];

  useEffect(() => {
    const fetchPreviousScore = async () => {
      if (!user || !assessment.id) return;
      try {
        const { data } = await supabase
          .from("skill_assessment_results")
          .select("id, score")
          .eq("assessment_id", assessment.id)
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(1);
        if (data && data.length > 0) {
          setPreviousScore(data[0].score);
          setLatestResultId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching previous score:", error);
      }
    };
    fetchPreviousScore();
  }, [assessment.id, user]);

  const handleViewResults = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (latestResultId) {
      window.location.href = `/assessments/skill-assessment-results/${latestResultId}`;
    }
  };

  const visibleSkillCount = isMobile ? 2 : 3;
  const hasScore = previousScore !== null;
  const questionCount = assessment.questions?.length || 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl cursor-pointer",
        "border border-[#C8A84B]/40",
        "bg-gradient-to-b from-[#FBF7EF] to-white",
        "shadow-[0_4px_16px_-8px_rgba(184,134,11,0.18),inset_0_1px_0_0_rgba(255,255,255,0.9)]",
        "hover:border-[#C8A84B]/70",
        "hover:shadow-[0_12px_32px_-12px_rgba(184,134,11,0.28),inset_0_1px_0_0_rgba(255,255,255,1)]",
        "hover:-translate-y-1 transition-all duration-300"
      )}
      onClick={() => onViewAssessment(assessment.id)}
    >
      {/* Top gold hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8A84B]/60 to-transparent" />

      <div className="flex flex-col h-full p-6">
        {/* Eyebrow row: industry + role */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-[#9a7f2a] flex items-center gap-1.5">
            <Building2 className="h-3 w-3" strokeWidth={1.8} />
            {assessment.industry}
          </span>
          <span className="h-1 w-1 rounded-full bg-[#C8A84B]/60" />
          <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#9a7f2a] truncate max-w-[140px]">
            {assessment.role}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-manrope text-[17px] font-medium leading-snug tracking-tight text-[#1a1a1a] line-clamp-2 mb-4">
          {assessment.title}
        </h3>

        {/* Skill chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {skills.slice(0, visibleSkillCount).map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-[#C8A84B]/40 bg-[#FBF7EF] px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-[0.14em] text-[#8a7a5a] truncate max-w-[130px]"
            >
              {skill}
            </span>
          ))}
          {skills.length > visibleSkillCount && (
            <span className="rounded-full border border-[#C8A84B]/40 bg-[#FBF7EF] px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-[0.14em] text-[#8a7a5a]">
              +{skills.length - visibleSkillCount} more
            </span>
          )}
        </div>

        {/* Score / question count + progress bar */}
        <div className="mb-6 mt-auto">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8a7a5a]">
              {hasScore ? "Previous Score" : "Questions"}
            </span>
            <span className="font-manrope text-sm font-medium tabular-nums text-[#1a1a1a]">
              {hasScore ? (
                <>
                  {previousScore}
                  <span className="text-xs text-[#8a7a5a] ml-0.5">%</span>
                </>
              ) : (
                <>{questionCount} <span className="text-xs text-[#8a7a5a]">total</span></>
              )}
            </span>
          </div>
          <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-[#C8A84B]/15">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#DAA520] to-[#B8860B] transition-all duration-700 ease-out"
              style={{ width: hasScore ? `${previousScore}%` : "0%" }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className={cn("flex gap-2", !hasScore && "flex-col")}>
          {hasScore && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex-1 rounded-full border-[#C8A84B]/50 text-[#7a6a2a]",
                "hover:bg-[#FBF7EF] hover:border-[#C8A84B]/80 hover:text-[#5a4a1a]",
                "transition-all"
              )}
              onClick={handleViewResults}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.8} />
              View Results
            </Button>
          )}
          <Button
            size="sm"
            className={cn(
              "rounded-full font-semibold text-white",
              hasScore ? "flex-1" : "w-full py-5",
              "bg-gradient-to-br from-[#DAA520] to-[#B8860B]",
              "shadow-[0_6px_20px_-8px_rgba(184,134,11,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]",
              "hover:from-[#E4B333] hover:to-[#C99416]",
              "hover:shadow-[0_10px_26px_-8px_rgba(184,134,11,0.65)]",
              "transition-all duration-200"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onViewAssessment(assessment.id);
            }}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.8} />
            {hasScore ? "Take Again" : "Take Assessment"}
            <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
