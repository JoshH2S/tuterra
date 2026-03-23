
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface InterviewReadyPromptProps {
  jobTitle: string;
  onStartChat: () => void;
  usedFallbackQuestions?: boolean;
}

const TIPS = [
  "Answer as if you're in a real interview",
  "Take your time to think before responding",
  "Provide specific examples from your experience",
  "Keep your answers concise but comprehensive",
];

export const InterviewReadyPrompt = ({
  jobTitle,
  onStartChat,
  usedFallbackQuestions = false,
}: InterviewReadyPromptProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Hero card — mirrors the dashboard FeatureCard style */}
      <div
        className="relative rounded-2xl overflow-hidden border border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
        style={{ minHeight: "340px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/heroes/jobinterviewsimulator.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        <div className="relative inset-x-0 bottom-0 p-6 flex flex-col justify-end h-full">
          <p className="text-[10px] font-mono text-white/65 uppercase tracking-widest mb-2">
            Career Preparation
          </p>
          <h2 className="text-2xl font-semibold text-white leading-tight tracking-tight">
            Your Interview is Ready
          </h2>
          <p className="mt-2 text-sm text-white/75 leading-relaxed">
            Questions prepared for{" "}
            <span className="text-white font-medium">{jobTitle}</span>
          </p>

          {usedFallbackQuestions && (
            <p className="mt-3 text-xs text-amber-300/90 leading-relaxed max-w-[46ch]">
              Using standard questions for this role — custom generation wasn't
              available right now.
            </p>
          )}

          <div className="mt-5">
            <button
              onClick={onStartChat}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-white text-[#091747] hover:bg-white/90 active:scale-95 transition-all duration-150"
            >
              Start Interview
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tips card below */}
      <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_8px_rgba(0,0,0,0.05)] p-5">
        <p className="text-xs font-mono uppercase tracking-widest text-[#8a7a5a] mb-4">
          Tips for a successful practice
        </p>
        <ul className="space-y-2.5">
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2.5 text-sm text-[#3a3530]">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
