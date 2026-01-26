import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, BookOpen, Target, Gauge, Settings, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { CourseLevel, FormatPreferences, CreateCourseRequest } from "@/types/course-engine";
import { useGeneratedCourses } from "@/hooks/useGeneratedCourses";
import { toast } from "@/hooks/use-toast";

interface CourseCreateWizardProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const CourseCreateWizard = ({
  open,
  onClose,
  onCreated,
}: CourseCreateWizardProps) => {
  const { createCourse } = useGeneratedCourses();
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<CourseLevel>("beginner");
  const [paceWeeks, setPaceWeeks] = useState(4);
  const [formatPreferences, setFormatPreferences] = useState<FormatPreferences>({
    historyHeavy: false,
    scenarioHeavy: false,
    quizHeavy: false,
    writingHeavy: false,
  });

  const handleSubmit = async () => {
    setIsCreating(true);
    try {
      const result = await createCourse({
        topic,
        goal: goal || undefined,
        level,
        pace_weeks: paceWeeks,
        format_preferences: formatPreferences,
      });
      
      if (result) {
        handleClose();
        onCreated?.();
      }
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setStep(1);
      setTopic("");
      setGoal("");
      setLevel("beginner");
      setPaceWeeks(4);
      setFormatPreferences({
        historyHeavy: false,
        scenarioHeavy: false,
        quizHeavy: false,
        writingHeavy: false,
      });
      onClose();
    }
  };

  const canProceed = () => {
    if (step === 1) return topic.trim().length >= 3;
    return true;
  };

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Your Course
          </DialogTitle>
          <DialogDescription>
            Step {step} of 3 — {step === 1 ? "Topic & Goal" : step === 2 ? "Level & Pace" : "Format Preferences"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 py-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-2 rounded-full transition-colors ${
                s === step ? "bg-primary" : s < step ? "bg-primary/50" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="topic" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  What do you want to learn?
                </Label>
                <Input
                  id="topic"
                  placeholder="e.g., American History, Data Literacy, Spanish..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isCreating}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Enter any topic you're interested in learning
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Learning Goal (optional)
                </Label>
                <Textarea
                  id="goal"
                  placeholder="e.g., I want to understand the causes of the Civil War..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  disabled={isCreating}
                  rows={3}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Experience Level
                </Label>
                <RadioGroup
                  value={level}
                  onValueChange={(value) => setLevel(value as CourseLevel)}
                  disabled={isCreating}
                  className="grid grid-cols-3 gap-3"
                >
                  {[
                    { value: "beginner", label: "Beginner", desc: "New to topic" },
                    { value: "intermediate", label: "Intermediate", desc: "Some knowledge" },
                    { value: "advanced", label: "Advanced", desc: "Deep dive" },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={option.value}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        level === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="sr-only"
                      />
                      <span className="font-medium text-sm">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.desc}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Course Duration
                  </span>
                  <span className="text-primary font-semibold">{paceWeeks} weeks</span>
                </Label>
                <Slider
                  value={[paceWeeks]}
                  onValueChange={(value) => setPaceWeeks(value[0])}
                  min={2}
                  max={8}
                  step={1}
                  disabled={isCreating}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>2 weeks (Quick)</span>
                  <span>8 weeks (Comprehensive)</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Format Preferences (optional)</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Choose how you'd like your course to be structured
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { key: "historyHeavy", label: "History & Context Heavy", desc: "Deep background and historical context" },
                  { key: "scenarioHeavy", label: "Scenario-Based", desc: "Real-world scenarios and case studies" },
                  { key: "quizHeavy", label: "Quiz-Heavy", desc: "Frequent knowledge checks" },
                  { key: "writingHeavy", label: "Writing-Heavy", desc: "More written reflections and essays" },
                ].map((option) => (
                  <div
                    key={option.key}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formatPreferences[option.key as keyof FormatPreferences]
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() =>
                      setFormatPreferences((prev) => ({
                        ...prev,
                        [option.key]: !prev[option.key as keyof FormatPreferences],
                      }))
                    }
                  >
                    <Checkbox
                      checked={formatPreferences[option.key as keyof FormatPreferences]}
                      disabled={isCreating}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-sm">{option.label}</span>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-medium text-sm mb-2">Course Summary</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li><span className="text-foreground">Topic:</span> {topic}</li>
                  <li><span className="text-foreground">Level:</span> {level.charAt(0).toUpperCase() + level.slice(1)}</li>
                  <li><span className="text-foreground">Duration:</span> {paceWeeks} weeks ({paceWeeks} modules)</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => (step > 1 ? setStep(step - 1) : handleClose())}
            disabled={isCreating}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed() || isCreating}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isCreating}
              className="min-w-[140px]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Course
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
