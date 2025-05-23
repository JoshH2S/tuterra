
import { InternshipSetupForm } from "@/components/internship/InternshipSetupForm";

export default function InternshipSetupPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Create Your Virtual Internship</h1>
      <p className="text-muted-foreground mb-8">
        Customize your virtual internship experience to match your career goals. 
        Fill out the form below to get started.
      </p>
      <InternshipSetupForm />
    </div>
  );
}
