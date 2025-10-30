
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { FileText, Info } from "lucide-react";

interface InternshipDescriptionStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function InternshipDescriptionStep({ value, onChange }: InternshipDescriptionStepProps) {
  const characterCount = value.length;
  const minCharacters = 20;
  const isValid = characterCount >= minCharacters;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className="h-5 md:h-6 w-5 md:w-6 text-blue-600" />
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Describe the internship role
          </h2>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Provide details about responsibilities, skills needed, and goals
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
            Job Description
          </Label>
          <Textarea
            id="job-description"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe the key responsibilities, required skills, learning objectives, and what the intern will accomplish..."
            className="mt-2 text-sm md:text-base min-h-[200px] resize-y"
            rows={8}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              {isValid ? (
                <span className="text-green-600">✓ Description looks good!</span>
              ) : (
                <span>Minimum {minCharacters} characters required</span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {characterCount} / {minCharacters} characters
            </p>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-900 mb-1">
                Tips for a great description
              </h4>
              <ul className="text-xs md:text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>List key responsibilities and daily tasks</li>
                <li>Mention required or desired skills</li>
                <li>Include learning objectives and outcomes</li>
                <li>Describe the tools or technologies involved</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {isValid && (
        <motion.div 
          className="bg-green-50 p-4 rounded-lg border border-green-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900 mb-1">
                Description Complete
              </p>
              <p className="text-xs text-green-800">
                Your description will help us create relevant tasks and learning experiences.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

