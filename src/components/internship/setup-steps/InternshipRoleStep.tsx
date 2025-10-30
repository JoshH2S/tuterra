
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Briefcase, Info } from "lucide-react";

interface InternshipRoleStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function InternshipRoleStep({ value, onChange }: InternshipRoleStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Briefcase className="h-5 md:h-6 w-5 md:w-6 text-blue-600" />
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            What's the job title for this internship?
          </h2>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Be specific to get tailored tasks and responsibilities
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
            Job Title
          </Label>
          <Input
            id="job-title"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., Marketing Analyst, Software Engineer, Data Scientist..."
            className="mt-2 text-sm md:text-base h-14 md:h-12"
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Why specify a job title?
              </h4>
              <p className="text-xs md:text-sm text-blue-800">
                A specific job title helps our AI create more realistic tasks, appropriate responsibilities, 
                and industry-standard challenges for your virtual internship experience.
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
            <span className="text-sm font-medium text-green-900">Internship Role:</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">
              {value}
            </Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
}

