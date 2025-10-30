import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Settings, Target, FileText, Info } from "lucide-react";

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
    color: "bg-green-100 text-green-800"
  },
  { 
    value: "intermediate", 
    label: "Intermediate", 
    description: "Mid-level questions for experienced professionals",
    color: "bg-blue-100 text-blue-800"
  },
  { 
    value: "advanced", 
    label: "Advanced", 
    description: "Expert-level questions for senior professionals",
    color: "bg-purple-100 text-purple-800"
  },
];

export function AssessmentDetailsStep({ 
  level, 
  questionCount, 
  additionalInfo, 
  onChange 
}: AssessmentDetailsStepProps) {
  const selectedLevel = LEVEL_OPTIONS.find(option => option.value === level);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Settings className="h-5 md:h-6 w-5 md:w-6 text-black" />
          <h2 className="text-xl md:text-2xl font-semibold text-black">
            Configure your assessment details
          </h2>
        </div>
        <p className="text-sm md:text-base text-black/80">
          Set the difficulty level, question count, and any specific requirements
        </p>
      </div>

      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Difficulty Level */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-black" />
            <Label className="text-sm font-medium text-black">
              Difficulty Level *
            </Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {LEVEL_OPTIONS.map((option) => (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={level === option.value ? "default" : "outline"}
                  className={`w-full min-h-[96px] p-4 flex flex-col items-start justify-start text-left transition-all touch-manipulation ${
                    level === option.value 
                      ? "" 
                      : "bg-white/90 hover:bg-white border-white/50 text-gray-900 hover:text-gray-800"
                  }`}
                  onClick={() => onChange({ level: option.value })}
                >
                  <h3 className="text-base font-semibold mb-1 whitespace-normal break-words">{option.label}</h3>
                  <p className="text-xs text-left opacity-90 leading-tight whitespace-normal break-words">
                    {option.description}
                  </p>
                </Button>
              </motion.div>
            ))}
          </div>

          {selectedLevel && (
            <motion.div 
              className="bg-purple-50/95 backdrop-blur-sm p-3 rounded-lg border border-purple-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-purple-900">Selected Level:</span>
                <Badge className={selectedLevel.color}>
                  {selectedLevel.label}
                </Badge>
              </div>
            </motion.div>
          )}
        </div>

        {/* Question Count */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-black" />
            <Label className="text-sm font-medium text-black">
              Number of Questions: {questionCount}
            </Label>
          </div>
          
          <div className="px-2">
            <Slider
              value={[questionCount]}
              onValueChange={(value) => onChange({ questionCount: value[0] })}
              max={50}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-black/60 mt-1">
              <span>10 questions</span>
              <span>50 questions</span>
            </div>
          </div>

          <div className="bg-blue-50/95 backdrop-blur-sm p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <strong>Recommended:</strong> 15-25 questions for comprehensive assessment, 
                10-15 for quick evaluation, 30+ for thorough skill validation.
              </div>
            </div>
          </div>
        </div>

        {/* Job Description / Additional Information */}
        <div className="space-y-4">
          <Label htmlFor="additional-info" className="text-sm font-medium text-black">
            Job Description or Additional Context (Optional)
          </Label>
          <Textarea
            id="additional-info"
            value={additionalInfo}
            onChange={(e) => onChange({ additionalInfo: e.target.value })}
            placeholder="Paste the full job description here, or specify particular skills, technologies, or areas to focus on. E.g., 'Must have 3+ years experience with React, Node.js, and PostgreSQL' or 'Focus on leadership, project management, and stakeholder communication'"
            className="min-h-[120px] bg-white/95 border-white/50 text-gray-900 placeholder:text-gray-600"
          />
          
          <div className="bg-blue-50/95 backdrop-blur-sm p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <strong>Pro tip:</strong> Paste a complete job description for best results, or be specific about technologies, methodologies, or skills 
                you want assessed. The more context you provide, the more targeted and relevant the assessment questions will be.
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.div 
        className="bg-slate-50/95 backdrop-blur-sm p-4 rounded-lg border border-slate-200"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h4 className="text-base font-semibold text-slate-900 mb-3">
          Assessment Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <div>
              <div className="font-medium text-slate-900">Difficulty</div>
              <div className="text-slate-700 capitalize">{level || 'Not selected'}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <div>
              <div className="font-medium text-slate-900">Questions</div>
              <div className="text-slate-700">{questionCount} questions</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <div>
              <div className="font-medium text-slate-900">Est. Time</div>
              <div className="text-slate-700">{Math.ceil(questionCount * 1.5)} minutes</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
