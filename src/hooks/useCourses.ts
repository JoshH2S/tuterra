import { useCourseFetch } from "./useCourseFetch";
import { useCourseCreate } from "./useCourseCreate";
import { useCourseFileUpload } from "./useCourseFileUpload";

export const useCourses = () => {
  const { courses, isLoading, setCourses } = useCourseFetch();
  const { createCourse } = useCourseCreate(setCourses);
  const { handleFileUpload } = useCourseFileUpload();

  return {
    courses,
    isLoading,
    createCourse,
    handleFileUpload
  };
};