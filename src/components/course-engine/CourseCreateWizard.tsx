import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, BookOpen, Target, Gauge, Settings, ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { CourseLevel, FormatPreferences, CreateCourseRequest } from "@/types/course-engine";
import { useGeneratedCourses } from "@/hooks/useGeneratedCourses";
import { toast } from "@/hooks/use-toast";

interface CourseCreateWizardProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  initialTopic?: string;
}

export const CourseCreateWizard = ({
  open,
  onClose,
  onCreated,
  initialTopic,
}: CourseCreateWizardProps) => {
  const { createCourse } = useGeneratedCourses();
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState(initialTopic || "");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<CourseLevel>("beginner");
  const [paceWeeks, setPaceWeeks] = useState(4);
  const [formatPreferences, setFormatPreferences] = useState<FormatPreferences>({
    historyHeavy: false,
    scenarioHeavy: false,
    quizHeavy: false,
    writingHeavy: false,
    documentary: false,
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
        documentary: false,
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

  const stepLabels = ["Topic", "Pace", "Format"];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-[#F9F8F6] border-black/[0.06] max-h-[90vh] overflow-y-auto overflow-x-hidden w-[calc(100vw-2rem)] sm:w-full rounded-2xl p-4 sm:p-6 [&>button]:top-3 [&>button]:right-3">
        {/* Visual anchor */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C8A84B]/70 via-amber-200/80 to-transparent" />

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#091747] font-semibold tracking-tight">
            <Sparkles className="h-5 w-5 text-[#C8A84B]" />
            Create Your Course
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400 leading-relaxed">
            {step === 1 ? "Topic & Goal" : step === 2 ? "Level & Pace" : "Format Preferences"}
          </DialogDescription>
        </DialogHeader>

        {/* Numbered stepper */}
        <div className="flex items-center justify-center py-1">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const isComplete = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                    isComplete ? "bg-[#C8A84B] text-white" : isActive ? "bg-[#091747] text-white" : "bg-stone-200 text-stone-400"
                  }`}>
                    {isComplete ? <Check className="w-3.5 h-3.5" /> : `0${stepNum}`}
                  </div>
                  <span className={`text-[10px] tracking-widest uppercase font-medium ${isActive ? "text-[#091747]" : "text-stone-400"}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`h-px w-10 mx-2 mb-5 transition-colors duration-300 ${step > stepNum ? "bg-[#C8A84B]" : "bg-stone-200"}`} />
                )}
              </div>
            );
          })}
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
              className="space-y-5"
            >
              <div className="space-y-2">
                <label htmlFor="topic" className="flex items-center gap-2 text-sm font-medium text-stone-600">
                  <BookOpen className="h-4 w-4 text-stone-400" />
                  What do you want to learn?
                </label>
                <Input
                  id="topic"
                  placeholder="e.g., American History, Data Literacy, Spanish..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isCreating}
                  className="bg-white border-stone-200 focus-visible:ring-stone-300 text-base"
                />
                <p className="text-xs text-stone-400">Enter any topic you're interested in learning</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="goal" className="flex items-center gap-2 text-sm font-medium text-stone-600">
                  <Target className="h-4 w-4 text-stone-400" />
                  Learning Goal <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <Textarea
                  id="goal"
                  placeholder="e.g., I want to understand the causes of the Civil War..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  disabled={isCreating}
                  rows={3}
                  className="bg-white border-stone-200 focus-visible:ring-stone-300 resize-none"
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
                <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
                  <Gauge className="h-4 w-4 text-stone-400" />
                  Experience Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "beginner", label: "Beginner", desc: "New to topic" },
                    { value: "intermediate", label: "Intermediate", desc: "Some knowledge" },
                    { value: "advanced", label: "Advanced", desc: "Deep dive" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isCreating}
                      onClick={() => setLevel(option.value as CourseLevel)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ease-out touch-manipulation ${
                        level === option.value
                          ? "bg-[#091747] text-white shadow-sm"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:-translate-y-px"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {level && (
                  <p className="text-xs text-stone-400">
                    {level === "beginner" ? "New to this topic — we'll start from scratch." : level === "intermediate" ? "Some background knowledge — we'll build on what you know." : "Looking for a deep dive — advanced concepts and nuance."}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-600">
                    <Settings className="h-4 w-4 text-stone-400" />
                    Course Duration
                  </label>
                  <span className="text-sm font-medium text-[#091747]">{paceWeeks} weeks</span>
                </div>
                <Slider
                  value={[paceWeeks]}
                  onValueChange={(value) => setPaceWeeks(value[0])}
                  min={2}
                  max={8}
                  step={1}
                  disabled={isCreating}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-stone-400">
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
              <div>
                <p className="text-sm font-medium text-stone-600">Format Preferences <span className="text-stone-400 font-normal">(optional)</span></p>
                <p className="text-xs text-stone-400 mt-0.5">Choose how you'd like your course to be structured</p>
              </div>

              <div className="space-y-2">
                {[
                  { key: "documentary", label: "Documentary Style", desc: "Cinematic narrative framing with historical/contextual immersion" },
                  { key: "historyHeavy", label: "History & Context Heavy", desc: "Deep background and historical context" },
                  { key: "scenarioHeavy", label: "Scenario-Based", desc: "Real-world scenarios and case studies" },
                  { key: "quizHeavy", label: "Quiz-Heavy", desc: "Frequent knowledge checks" },
                  { key: "writingHeavy", label: "Writing-Heavy", desc: "More written reflections and essays" },
                ].map((option) => {
                  const isChecked = formatPreferences[option.key as keyof FormatPreferences];
                  return (
                    <div
                      key={option.key}
                      onClick={() =>
                        !isCreating && setFormatPreferences((prev) => ({
                          ...prev,
                          [option.key]: !prev[option.key as keyof FormatPreferences],
                        }))
                      }
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                        isChecked
                          ? "border-[#091747]/20 bg-[#091747]/5"
                          : "border-stone-200 bg-white hover:border-stone-300"
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors duration-150 ${
                        isChecked ? "bg-[#091747] border-[#091747]" : "border-stone-300 bg-white"
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${isChecked ? "text-[#091747]" : "text-stone-700"}`}>{option.label}</span>
                        <p className="text-xs text-stone-400 mt-0.5">{option.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <h4 className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-3">Course Summary</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-stone-400 mb-0.5">Topic</div>
                    <div className="font-medium text-[#091747] truncate">{topic || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-400 mb-0.5">Level</div>
                    <div className="font-medium text-[#091747] capitalize">{level}</div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-400 mb-0.5">Duration</div>
                    <div className="font-medium text-[#091747]">{paceWeeks} weeks</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6">
          <Button
            variant="ghost"
            onClick={() => (step > 1 ? setStep(step - 1) : handleClose())}
            disabled={isCreating}
            className="flex items-center gap-2 text-stone-400 hover:text-stone-600 hover:bg-transparent px-0"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed() || isCreating}
              className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium bg-[#091747] text-white hover:bg-[#0d2060] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Course
                </>
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
