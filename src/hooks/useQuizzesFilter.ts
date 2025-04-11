
import { useState, useMemo } from "react";
import { ProcessedCourse } from "@/types/quiz-display";

export const useQuizzesFilter = (processedCourses: ProcessedCourse[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredCourses = useMemo(() => {
    if (!processedCourses || !Array.isArray(processedCourses)) {
      return [];
    }
    
    return processedCourses
      .map(course => {
        const filteredQuizzes = course.quizzes.filter(quiz => {
          const matchesSearch = searchTerm === "" || 
            quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesStatus = selectedStatus === "all" || 
            (selectedStatus === "not_attempted" && quiz.status === "not_attempted") ||
            (selectedStatus === "in_progress" && quiz.status === "in_progress") ||
            (selectedStatus === "completed" && quiz.status === "completed");
          
          return matchesSearch && matchesStatus;
        });
        
        return {
          ...course,
          quizzes: filteredQuizzes
        };
      })
      .filter(course => {
        return course.quizzes.length > 0 && 
          (selectedCourse === "all" || course.id === selectedCourse);
      });
  }, [processedCourses, searchTerm, selectedCourse, selectedStatus]);

  const totalQuizCount = useMemo(() => {
    if (!processedCourses || !Array.isArray(processedCourses)) {
      return 0;
    }
    
    return processedCourses.reduce(
      (total, course) => total + course.quizzes.length, 
      0
    );
  }, [processedCourses]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCourse,
    setSelectedCourse,
    selectedStatus,
    setSelectedStatus,
    filteredCourses,
    totalQuizCount
  };
};
