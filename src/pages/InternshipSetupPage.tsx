
import { MultiStepInternshipSetupForm } from "@/components/internship/MultiStepInternshipSetupForm";

export default function InternshipSetupPage() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image - Full Opacity */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/characters/pexels-mart-production-7256413-2.jpg')"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        <MultiStepInternshipSetupForm />
      </div>
    </div>
  );
}
