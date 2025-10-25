import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { FileText, Info, CheckCircle } from "lucide-react";

interface InterviewJobDescriptionStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function InterviewJobDescriptionStep({ value, onChange }: InterviewJobDescriptionStepProps) {
  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = value.length;
  const isOptimalLength = wordCount >= 100;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className="h-5 md:h-6 w-5 md:w-6 text-purple-600" />
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Share the job description
          </h2>
        </div>
        <p className="text-sm md:text-base text-gray-600">
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
          <Label htmlFor="job-description" className="text-sm font-medium">
            Job Description *
          </Label>
          <Textarea
            id="job-description"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste the complete job description here. Include responsibilities, requirements, qualifications, and any specific skills mentioned..."
            className="mt-2 text-sm md:text-base min-h-[150px] resize-none"
            maxLength={5000}
          />
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {wordCount} words
              </span>
              {isOptimalLength && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-xs">Good length!</span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400 self-end sm:self-auto">
              {charCount}/5000 characters
            </span>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Tips for better interview questions
              </h4>
              <ul className="text-xs md:text-sm text-blue-800 space-y-1">
                <li>• Include specific responsibilities and requirements</li>
                <li>• Mention required skills and technologies</li>
                <li>• Add company culture or team information if available</li>
                <li>• More detailed descriptions (100+ words) generate better questions</li>
              </ul>
            </div>
          </div>
        </div>

        {!isOptimalLength && wordCount > 0 && (
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-900 mb-1">
                  Consider adding more details
                </h4>
                <p className="text-xs md:text-sm text-amber-800">
                  Job descriptions with 100+ words help us create more specific and relevant interview questions. 
                  Try adding more details about responsibilities, requirements, or company information.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {value && isOptimalLength && (
        <motion.div 
          className="bg-green-50 p-4 rounded-lg border border-green-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              Great! Your job description is detailed enough for personalized questions.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
