
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface InternshipIndustryStepProps {
  value: string;
  onChange: (value: string) => void;
}

const POPULAR_INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Marketing",
  "Legal",
  "Hospitality",
  "Construction",
  "Media",
  "Government",
  "Non-profit",
  "Consulting"
];

export function InternshipIndustryStep({ value, onChange }: InternshipIndustryStepProps) {
  const [customIndustry, setCustomIndustry] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleIndustrySelect = (industry: string) => {
    onChange(industry);
    setCustomIndustry("");
    setShowCustomInput(false);
  };

  const handleCustomIndustryChange = (customValue: string) => {
    setCustomIndustry(customValue);
    onChange(customValue);
  };

  const handleShowCustomInput = () => {
    setShowCustomInput(true);
    onChange("");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
          Which industry is this internship for?
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          Select from popular industries or enter your own
        </p>
      </div>

      {!showCustomInput ? (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {POPULAR_INDUSTRIES.map((industry) => (
              <Button
                key={industry}
                variant={value === industry ? "default" : "outline"}
                className={`h-auto p-3 text-xs md:text-sm font-medium transition-all touch-manipulation ${
                  value === industry 
                    ? "" 
                    : "hover:bg-gray-50 hover:border-gray-300"
                }`}
                onClick={() => handleIndustrySelect(industry)}
              >
                {industry}
              </Button>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleShowCustomInput}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 text-sm touch-manipulation"
            >
              Don't see your industry? Enter it manually
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <Label htmlFor="custom-industry" className="text-sm font-medium">
              Enter your industry
            </Label>
            <Input
              id="custom-industry"
              value={customIndustry}
              onChange={(e) => handleCustomIndustryChange(e.target.value)}
              placeholder="e.g., Renewable Energy, Biotechnology, Real Estate..."
              className="mt-2 text-sm md:text-base"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomInput(false);
                setCustomIndustry("");
                onChange("");
              }}
              className="flex-1 touch-manipulation"
            >
              Back to Popular Industries
            </Button>
          </div>
        </motion.div>
      )}

      {value && (
        <motion.div 
          className="bg-blue-50 p-4 rounded-lg border border-blue-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm font-medium text-blue-900">Selected Industry:</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 w-fit">
              {value}
            </Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
}

