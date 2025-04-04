
import { CourseTemplates as CourseTemplatesComponent } from "@/components/courses/CourseTemplates";

const CourseTemplates = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300 dark:from-primary-400 dark:to-primary-200">Course Templates</h1>
      <CourseTemplatesComponent />
    </div>
  );
};

export default CourseTemplates;
