
import { useState } from "react";
import { TutorInterface } from "@/components/ai-tutor/TutorInterface";
import { Toaster } from "@/components/ui/toaster";

const CourseTutor = () => {
  return (
    <>
      <Toaster />
      <div className="h-screen w-full bg-background">
        <div className="max-w-7xl mx-auto h-full px-2 py-2 md:px-4 md:py-4">
          <TutorInterface />
        </div>
      </div>
    </>
  );
};

export default CourseTutor;
