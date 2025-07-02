import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Briefcase, Info } from "lucide-react";

interface JobRoleStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobRoleStep({ value, onChange }: JobRoleStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Briefcase className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Do you have a specific job role in mind?
          </h2>
        </div>
        <p className="text-gray-600">
          This helps us tailor your internship experience (optional)
        </p>
      </div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <Label htmlFor="job-role" className="text-sm font-medium">
            Job Role or Position
          </Label>
          <Input
            id="job-role"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Marketing Analyst, Software Engineer, Data Scientist..."
            className="mt-2"
          />
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Why specify a job role?
              </h4>
              <p className="text-sm text-blue-800">
                Providing a specific role helps us create more targeted tasks, realistic responsibilities, 
                and industry-appropriate challenges for your virtual internship experience.
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
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-green-900">Target Role:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {value}
            </Badge>
          </div>
        </motion.div>
      )}

      {!value && (
        <motion.div 
          className="text-center text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <p className="text-sm">
            No specific role? No problem! We'll create a general internship experience 
            based on your selected industry.
          </p>
        </motion.div>
      )}
    </div>
  );
} 