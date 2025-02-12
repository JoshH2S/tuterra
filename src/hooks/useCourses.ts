
import { useCourseCreate } from "./useCourseCreate";
import { useCourseFileUpload } from "./useCourseFileUpload";

export const useCourses = () => {
  const { createCourse } = useCourseCreate();
  const { handleFileUpload } = useCourseFileUpload();

  return {
    createCourse,
    handleFileUpload,
  };
};
