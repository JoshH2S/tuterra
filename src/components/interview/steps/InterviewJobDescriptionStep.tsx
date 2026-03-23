import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Sparkles } from "lucide-react";

interface InterviewJobDescriptionStepProps {
  value: string;
  onChange: (value: string) => void;
  practiceMode: "specific-job" | "general-practice";
  onPracticeModeChange: (mode: "specific-job" | "general-practice") => void;
}

export function InterviewJobDescriptionStep({
  value,
  onChange,
  practiceMode,
  onPracticeModeChange,
}: InterviewJobDescriptionStepProps) {
  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = value.length;
  const isOptimalLength = wordCount >= 100;
  const isSpecificJobMode = practiceMode === "specific-job";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-stone-400" />
          <h2 className="text-xl md:text-2xl font-normal tracking-tight text-[#091747]">
            {isSpecificJobMode ? "Share the job description" : "Choose your practice style"}
          </h2>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          {isSpecificJobMode
            ? "Paste the job description to get highly relevant interview questions"
            : "Use a real job posting or let us generate role-based practice from the title alone"}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onPracticeModeChange("specific-job")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            isSpecificJobMode
              ? "border-[#091747] bg-[#091747]/[0.03] shadow-sm"
              : "border-stone-200 bg-white hover:border-stone-300"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className={`h-4 w-4 ${isSpecificJobMode ? "text-[#091747]" : "text-stone-400"}`} />
            <span className="text-sm font-medium text-[#091747]">Preparing for a real job</span>
          </div>
          <p className="text-xs leading-relaxed text-stone-500">
            Paste the actual job description so we can target the responsibilities, requirements, and skills in the role.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onPracticeModeChange("general-practice")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            !isSpecificJobMode
              ? "border-[#091747] bg-[#091747]/[0.03] shadow-sm"
              : "border-stone-200 bg-white hover:border-stone-300"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={`h-4 w-4 ${!isSpecificJobMode ? "text-[#091747]" : "text-stone-400"}`} />
            <span className="text-sm font-medium text-[#091747]">General practice</span>
          </div>
          <p className="text-xs leading-relaxed text-stone-500">
            No job posting? We&apos;ll create a role-based interview using the title and any optional context you add below.
          </p>
        </button>
      </div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <Label htmlFor="job-description" className="text-sm font-medium text-stone-600">
            {isSpecificJobMode ? "Job Description" : "Optional Context"}
          </Label>
          <Textarea
            id="job-description"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              isSpecificJobMode
                ? "Paste the complete job description here. Include responsibilities, requirements, qualifications, and any specific skills mentioned..."
                : "Optional: paste a short job post excerpt or add notes about the company, seniority, team, tech stack, or focus areas..."
            }
            className="mt-2 min-h-[160px] resize-none bg-white border-stone-200 focus-visible:ring-stone-300"
            maxLength={5000}
          />
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">{wordCount} words</span>
              {isOptimalLength && (
                <div className="flex items-center gap-1 text-[#C8A84B]">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-xs font-medium">Good length</span>
                </div>
              )}
            </div>
            <span className="text-xs text-stone-300">{charCount}/5000</span>
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
          <ul className="text-xs text-stone-500 space-y-1.5 leading-relaxed">
            {isSpecificJobMode ? (
              <>
                <li>Include specific responsibilities and requirements</li>
                <li>Mention required skills and technologies</li>
                <li>Add company culture or team information if available</li>
                <li>Descriptions with 100+ words generate better questions</li>
              </>
            ) : (
              <>
                <li>You can leave this blank and we&apos;ll build a role-based practice interview</li>
                <li>Add seniority, focus areas, or company context if you want sharper questions</li>
                <li>Short notes are fine here; a full job description is not required</li>
                <li>If you later get a real posting, switch back to the real-job mode for best results</li>
              </>
            )}
          </ul>
        </div>

        {isSpecificJobMode && !isOptimalLength && wordCount > 0 && (
          <p className="text-xs text-stone-400 leading-relaxed">
            Adding more detail (aim for 100+ words) will help us craft more specific, relevant questions.
          </p>
        )}
      </motion.div>

      {isSpecificJobMode && value && isOptimalLength && (
        <motion.div
          className="flex items-center gap-2 text-sm font-medium text-[#C8A84B]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <CheckCircle className="h-4 w-4" />
          Description looks great — ready to generate your interview.
        </motion.div>
      )}

      {!isSpecificJobMode && (
        <motion.div
          className="flex items-center gap-2 text-sm font-medium text-[#C8A84B]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <CheckCircle className="h-4 w-4" />
          We&apos;ll create a role-based interview even if you leave the context box blank.
        </motion.div>
      )}
    </div>
  );
}
