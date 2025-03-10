
import React from "react";
import { QuizDisclaimerText } from "@/components/quiz-generation/QuizDisclaimer";
import { Footer } from "@/components/layout/Footer";

export const QuizFooter: React.FC = () => {
  return (
    <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
      <QuizDisclaimerText />
      <div className="mt-6">
        <Footer />
      </div>
    </div>
  );
};
