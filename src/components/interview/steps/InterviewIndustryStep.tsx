import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

interface InterviewIndustryStepProps {
  value: string;
  onChange: (value: string) => void;
  onSkip?: () => void;
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

export function InterviewIndustryStep({ value, onChange, onSkip }: InterviewIndustryStepProps) {
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
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-stone-400" />
          <h2 className="text-xl md:text-2xl font-normal tracking-tight text-[#091747]">
            Which industry is this interview for?
          </h2>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          Select the industry to help us generate relevant interview questions
        </p>
      </div>

      {!showCustomInput ? (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Pill chip grid */}
          <div className="flex flex-wrap gap-2.5 justify-center">
            {POPULAR_INDUSTRIES.map((industry) => (
              <button
                key={industry}
                onClick={() => handleIndustrySelect(industry)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ease-out touch-manipulation ${
                  value === industry
                    ? "bg-[#091747] text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:-translate-y-px"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleShowCustomInput}
              className="text-sm text-stone-400 hover:text-stone-600 transition-colors duration-150 underline underline-offset-4 decoration-stone-300 touch-manipulation"
            >
              Don't see your industry? Enter it manually
            </button>
          </div>

          {onSkip && (
            <div className="text-center">
              <button
                type="button"
                onClick={onSkip}
                className="text-sm text-[#091747] hover:text-[#0d2060] transition-colors duration-150 underline underline-offset-4 decoration-[#091747]/30 touch-manipulation"
              >
                Not preparing for a specific posting? Skip industry for general practice
              </button>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <Label htmlFor="custom-industry" className="text-sm font-medium text-stone-600">
              Enter your industry
            </Label>
            <Input
              id="custom-industry"
              value={customIndustry}
              onChange={(e) => handleCustomIndustryChange(e.target.value)}
              placeholder="e.g., Renewable Energy, Biotechnology, Real Estate..."
              className="mt-2 bg-white border-stone-200 focus-visible:ring-stone-300"
              autoFocus
            />
          </div>

          <button
            onClick={() => {
              setShowCustomInput(false);
              setCustomIndustry("");
              onChange("");
            }}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors duration-150 underline underline-offset-4 decoration-stone-300 touch-manipulation"
          >
            ← Back to popular industries
          </button>
        </motion.div>
      )}
    </div>
  );
}
