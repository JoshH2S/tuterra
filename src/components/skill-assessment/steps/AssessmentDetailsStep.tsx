import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Settings, Target, FileText } from "lucide-react";

interface AssessmentDetailsStepProps {
  level: string;
  questionCount: number;
  additionalInfo: string;
  onChange: (data: { level?: string; questionCount?: number; additionalInfo?: string }) => void;
}

const LEVEL_OPTIONS = [
  {
    value: "beginner",
    label: "Beginner",
    description: "Entry-level questions for new professionals",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "Mid-level questions for experienced professionals",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Expert-level questions for senior professionals",
  },
];

export function AssessmentDetailsStep({
  level,
  questionCount,
  additionalInfo,
  onChange,
}: AssessmentDetailsStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-stone-400" />
          <h2 className="text-xl md:text-2xl font-normal tracking-tight text-[#091747]">
            Configure your assessment details
          </h2>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          Set the difficulty level, question count, and any specific requirements
        </p>
      </div>

      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Difficulty Level */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-stone-400" />
            <Label className="text-sm font-medium text-stone-600">Difficulty Level</Label>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {LEVEL_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onChange({ level: option.value })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ease-out touch-manipulation ${
                  level === option.value
                    ? "bg-[#091747] text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:-translate-y-px"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {level && (
            <p className="text-xs text-stone-400 leading-relaxed">
              {LEVEL_OPTIONS.find((o) => o.value === level)?.description}
            </p>
          )}
        </div>

        {/* Question Count */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-stone-400" />
              <Label className="text-sm font-medium text-stone-600">Number of Questions</Label>
            </div>
            <span className="text-sm font-medium text-[#091747]">{questionCount}</span>
          </div>

          <div className="px-1">
            <Slider
              value={[questionCount]}
              onValueChange={(value) => onChange({ questionCount: value[0] })}
              max={50}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-2">
              <span>10</span>
              <span>50</span>
            </div>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <p className="text-xs text-stone-500 leading-relaxed">
              Recommended: 15–25 questions for comprehensive assessment, 10–15 for quick
              evaluation, 30+ for thorough skill validation.
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-3">
          <Label htmlFor="additional-info" className="text-sm font-medium text-stone-600">
            Job Description or Additional Context{" "}
            <span className="text-stone-400 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="additional-info"
            value={additionalInfo}
            onChange={(e) => onChange({ additionalInfo: e.target.value })}
            placeholder="Paste the full job description here, or specify particular skills, technologies, or areas to focus on..."
            className="min-h-[120px] resize-none bg-white border-stone-200 focus-visible:ring-stone-300"
          />
          <p className="text-xs text-stone-400 leading-relaxed">
            The more context you provide, the more targeted and relevant the assessment questions will be.
          </p>
        </div>

        {/* Summary */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
          <h4 className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-3">
            Assessment Summary
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-stone-400 mb-0.5">Difficulty</div>
              <div className="font-medium text-[#091747] capitalize">{level || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-stone-400 mb-0.5">Questions</div>
              <div className="font-medium text-[#091747]">{questionCount}</div>
            </div>
            <div>
              <div className="text-xs text-stone-400 mb-0.5">Est. Time</div>
              <div className="font-medium text-[#091747]">{Math.ceil(questionCount * 1.5)} min</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
