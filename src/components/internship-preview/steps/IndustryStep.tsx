import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface IndustryStepProps {
  value: string;
  onChange: (value: string) => void;
}

const POPULAR_INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Engineering",
  "Consulting",
  "Media & Entertainment",
  "Retail",
  "Manufacturing",
  "Non-Profit",
  "Government"
];

export function IndustryStep({ value, onChange }: IndustryStepProps) {
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
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Which industry are you exploring a career in?
        </h2>
        <p className="text-gray-600">
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {POPULAR_INDUSTRIES.map((industry) => (
              <Button
                key={industry}
                variant={value === industry ? "default" : "outline"}
                className={`h-auto p-3 text-sm font-medium transition-all ${
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
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
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
              className="mt-2"
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
              className="flex-1"
            >
              Back to Popular Industries
            </Button>
          </div>
        </motion.div>
      )}

      {value && (
        <motion.div 
          className="bg-amber-50 p-4 rounded-lg border border-amber-200"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-amber-900">Selected Industry:</span>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {value}
            </Badge>
          </div>
        </motion.div>
      )}
    </div>
  );
} 