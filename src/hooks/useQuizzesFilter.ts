
import { useState, useMemo } from "react";
import { Course } from "@/types/course";
import { ProcessedCourse } from "@/types/quiz-display";

interface FilterOptions {
  status: string[];
  course: string[];
}

export const useQuizzesFilter = () => {
  const [selectedFilters, setSelectedFilters] = useState<FilterOptions>({
    status: [],
    course: []
  });

  const updateFilter = (type: 'status' | 'course', values: string[]) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: values
    }));
  };

  const filterOptions = {
    status: [
      { value: 'not_attempted', label: 'Not Attempted' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' }
    ],
    courses: [] // Will be populated from actual course data
  };

  return {
    filterOptions,
    selectedFilters,
    updateFilter
  };
};
