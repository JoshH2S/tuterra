import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

interface AssessmentRoleStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function AssessmentRoleStep({ value, onChange }: AssessmentRoleStepProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-stone-400" />
          <h2 className="text-xl md:text-2xl font-normal tracking-tight text-[#091747]">
            What specific role should this assessment target?
          </h2>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          This helps us create role-specific questions and scenarios
        </p>
      </div>

      <motion.div
        className="space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <Label htmlFor="job-role" className="text-sm font-medium text-stone-600">
            Job Role or Position
          </Label>
          <Input
            id="job-role"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Marketing Analyst, Software Engineer, Data Scientist..."
            className="mt-2 bg-white border-stone-200 focus-visible:ring-stone-300"
            autoFocus
          />
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
          <p className="text-xs text-stone-500 leading-relaxed">
            Providing a specific role helps us create targeted questions that assess the exact skills,
            knowledge, and competencies required for that position in your industry.
          </p>
        </div>
      </motion.div>

      {value && (
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#091747] text-white text-sm font-medium"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Briefcase className="w-3.5 h-3.5" />
          {value}
        </motion.div>
      )}
    </div>
  );
}
