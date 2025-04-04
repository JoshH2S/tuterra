
import { CourseTemplates as CourseTemplatesComponent } from "@/components/courses/CourseTemplates";

const CourseTemplates = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#091747] to-blue-400 dark:from-[#091747] dark:to-blue-500">Course Templates</h1>
      <CourseTemplatesComponent />
    </div>
  );
};

export default CourseTemplates;
