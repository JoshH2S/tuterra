import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Briefcase, Info } from "lucide-react";

interface InterviewJobTitleStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function InterviewJobTitleStep({ value, onChange }: InterviewJobTitleStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Briefcase className="h-5 md:h-6 w-5 md:w-6 text-green-600" />
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            What's the job title you're interviewing for?
          </h2>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Enter the specific position to get tailored interview questions
        </p>
      </div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <Label htmlFor="job-title" className="text-sm font-medium">
            Job Title *
          </Label>
          <Input
            id="job-title"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Senior Software Engineer, Marketing Manager, Data Analyst..."
            className="mt-2 text-sm md:text-base"
            autoFocus
          />
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-900 mb-1">
                Why specify the job title?
              </h4>
              <p className="text-xs md:text-sm text-amber-800">
                The job title helps us generate role-specific questions that match the responsibilities, 
                skills, and experience level expected for this position.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {value && (
        <motion.div 
          className="bg-green-50 p-4 rounded-lg border border-green-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm font-medium text-green-900">Interview Position:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">
              {value}
            </Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
}
