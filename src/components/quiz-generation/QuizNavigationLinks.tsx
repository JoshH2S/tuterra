
import React from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const QuizNavigationLinks = () => {
  return (
    <div className="flex flex-col sm:flex-row w-full justify-center gap-4 mt-6 mb-4">
      <Link to="/quizzes/case-study-quiz" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full">
          <FileText className="w-4 h-4 mr-2" />
          Case Study Quiz
        </Button>
      </Link>
      
      <Link to="/quizzes" className="w-full sm:w-auto">
        <Button variant="outline" className="w-full">
          <FileText className="w-4 h-4 mr-2" />
          View Quizzes
        </Button>
      </Link>
    </div>
  );
};
