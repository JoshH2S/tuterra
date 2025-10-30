import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Briefcase, Info } from "lucide-react";

interface AssessmentRoleStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function AssessmentRoleStep({ value, onChange }: AssessmentRoleStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Briefcase className="h-5 md:h-6 w-5 md:w-6 text-black" />
          <h2 className="text-xl md:text-2xl font-semibold text-black">
            What specific role should this assessment target?
          </h2>
        </div>
        <p className="text-sm md:text-base text-black/80">
          This helps us create role-specific questions and scenarios
        </p>
      </div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <Label htmlFor="job-role" className="text-sm font-medium text-black">
            Job Role or Position *
          </Label>
          <Input
            id="job-role"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Marketing Analyst, Software Engineer, Data Scientist..."
            className="mt-2 text-sm md:text-base bg-white/95 border-white/50 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        <div className="bg-blue-50/95 backdrop-blur-sm p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Why specify a job role?
              </h4>
              <p className="text-xs md:text-sm text-blue-800">
                Providing a specific role helps us create targeted questions that assess the exact skills, 
                knowledge, and competencies required for that position in your industry.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {value && (
        <motion.div 
          className="bg-green-50/95 backdrop-blur-sm p-4 rounded-lg border border-green-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm font-medium text-green-900">Target Role:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">
              {value}
            </Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
}
