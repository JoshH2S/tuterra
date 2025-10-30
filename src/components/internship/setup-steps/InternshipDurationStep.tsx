
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";

interface InternshipDurationStepProps {
  durationWeeks: number;
  startDate: string;
  onChange: (data: { durationWeeks?: number; startDate?: string }) => void;
}

const QUICK_DURATIONS = [2, 4, 6, 8, 10, 12];

export function InternshipDurationStep({ durationWeeks, startDate, onChange }: InternshipDurationStepProps) {
  const handleDurationSelect = (weeks: number) => {
    onChange({ durationWeeks: weeks });
  };

  const calculateEndDate = (start: string, weeks: number) => {
    const startDateObj = new Date(start);
    const endDate = new Date(startDateObj);
    endDate.setDate(endDate.getDate() + (weeks * 7));
    return endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const startDateFormatted = startDate 
    ? new Date(startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Calendar className="h-5 md:h-6 w-5 md:w-6 text-blue-600" />
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Set internship duration and start date
          </h2>
        </div>
        <p className="text-sm md:text-base text-gray-600">
          Choose how long the internship will last
        </p>
      </div>

      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Duration Selection */}
        <div>
          <Label className="text-sm font-medium mb-3 block">
            <Clock className="h-4 w-4 inline mr-2" />
            Duration (Weeks)
          </Label>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
            {QUICK_DURATIONS.map((weeks) => (
              <Button
                key={weeks}
                variant={durationWeeks === weeks ? "default" : "outline"}
                className={`h-auto p-3 text-sm font-medium transition-all touch-manipulation ${
                  durationWeeks === weeks 
                    ? "" 
                    : "hover:bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => handleDurationSelect(weeks)}
              >
                {weeks} {weeks === 1 ? 'week' : 'weeks'}
              </Button>
            ))}
          </div>

          <div>
            <Label htmlFor="custom-duration" className="text-xs text-gray-600">
              Or enter a custom duration (1-12 weeks):
            </Label>
            <Input
              id="custom-duration"
              type="number"
              min="1"
              max="12"
              value={durationWeeks}
              onChange={(e) => onChange({ durationWeeks: parseInt(e.target.value) || 1 })}
              className="mt-2 h-12"
              placeholder="Enter weeks (1-12)"
            />
          </div>
        </div>

        {/* Start Date Selection */}
        <div>
          <Label htmlFor="start-date" className="text-sm font-medium">
            <Calendar className="h-4 w-4 inline mr-2" />
            Start Date
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="mt-2 h-12"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </motion.div>

      {/* Summary */}
      {durationWeeks && startDate && (
        <motion.div 
          className="bg-blue-50 p-4 rounded-lg border border-blue-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h4 className="text-sm font-medium text-blue-900 mb-3">Internship Timeline</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Duration:</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {durationWeeks} {durationWeeks === 1 ? 'week' : 'weeks'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Start Date:</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {startDateFormatted}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">Expected End Date:</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {calculateEndDate(startDate, durationWeeks)}
              </Badge>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

