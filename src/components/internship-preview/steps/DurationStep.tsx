
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Clock, Calendar, Target } from "lucide-react";

interface DurationStepProps {
  value: number;
  onChange: (value: number) => void;
}

const DURATION_OPTIONS = [
  { weeks: 6, label: "6 Weeks", description: "Quick introduction", tasks: 12, ideal: "Busy schedules" },
  { weeks: 8, label: "8 Weeks", description: "Balanced experience", tasks: 16, ideal: "Most popular" },
  { weeks: 10, label: "10 Weeks", description: "Comprehensive learning", tasks: 20, ideal: "Deep dive" },
  { weeks: 12, label: "12 Weeks", description: "Full immersion", tasks: 24, ideal: "Maximum impact" },
];

export function DurationStep({ value, onChange }: DurationStepProps) {
  const selectedOption = DURATION_OPTIONS.find(option => option.weeks === value);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="h-5 md:h-6 w-5 md:w-6 text-amber-600" />
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            How long would you like your internship to last?
          </h2>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Choose the duration that fits your schedule and learning goals
        </p>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {DURATION_OPTIONS.map((option) => (
          <motion.div
            key={option.weeks}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={value === option.weeks ? "default" : "outline"}
              className={`w-full h-auto p-4 md:p-6 flex flex-col items-start text-left transition-all touch-manipulation ${
                value === option.weeks 
                  ? "" 
                  : "hover:bg-gray-50 hover:border-gray-300"
              }`}
              onClick={() => onChange(option.weeks)}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <h3 className="text-base md:text-lg font-semibold">{option.label}</h3>
                {option.ideal === "Most popular" && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-amber-100 text-amber-800"
                  >
                    Popular
                  </Badge>
                )}
              </div>
              <p className="text-xs md:text-sm mb-3 text-gray-600">
                {option.description}
              </p>
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Target className="h-3 md:h-4 w-3 md:w-4" />
                  <span>{option.tasks} total tasks (2 per week)</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <Calendar className="h-3 md:h-4 w-3 md:w-4" />
                  <span>Ideal for: {option.ideal}</span>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {selectedOption && (
        <motion.div 
          className="bg-green-50 p-4 md:p-6 rounded-lg border border-green-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-base md:text-lg font-semibold text-green-900 mb-3">
            Your {selectedOption.weeks}-Week Internship Preview
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-medium text-green-900">Duration</div>
                <div className="text-green-700">{selectedOption.weeks} weeks</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-medium text-green-900">Total Tasks</div>
                <div className="text-green-700">{selectedOption.tasks} tasks</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div>
                <div className="font-medium text-green-900">Schedule</div>
                <div className="text-green-700">2 tasks per week</div>
              </div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-100 rounded-md">
            <p className="text-xs md:text-sm text-green-800">
              <strong>What to expect:</strong> Your internship will include a realistic company profile, 
              virtual supervisor, weekly feedback, and a final capstone project with presentation.
            </p>
          </div>
        </motion.div>
      )}

      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-amber-900 mb-1">
              Flexible Scheduling
            </h4>
            <p className="text-xs md:text-sm text-amber-800">
              All Tuterra internships are self-paced. You can complete tasks on your own schedule, 
              with suggested deadlines to keep you on track.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
