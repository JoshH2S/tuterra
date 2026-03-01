import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { FileText, CheckCircle } from "lucide-react";

interface InterviewJobDescriptionStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function InterviewJobDescriptionStep({ value, onChange }: InterviewJobDescriptionStepProps) {
  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = value.length;
  const isOptimalLength = wordCount >= 100;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-stone-400" />
          <h2 className="text-xl md:text-2xl font-normal tracking-tight text-[#091747]">
            Share the job description
          </h2>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          Paste the job description to get highly relevant interview questions
        </p>
      </div>

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <Label htmlFor="job-description" className="text-sm font-medium text-stone-600">
            Job Description
          </Label>
          <Textarea
            id="job-description"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste the complete job description here. Include responsibilities, requirements, qualifications, and any specific skills mentioned..."
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
            <li>Include specific responsibilities and requirements</li>
            <li>Mention required skills and technologies</li>
            <li>Add company culture or team information if available</li>
            <li>Descriptions with 100+ words generate better questions</li>
          </ul>
        </div>

        {!isOptimalLength && wordCount > 0 && (
          <p className="text-xs text-stone-400 leading-relaxed">
            Adding more detail (aim for 100+ words) will help us craft more specific, relevant questions.
          </p>
        )}
      </motion.div>

      {value && isOptimalLength && (
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
    </div>
  );
}
