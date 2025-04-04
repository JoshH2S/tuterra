
import { CourseTemplates as CourseTemplatesComponent } from "@/components/courses/CourseTemplates";

const CourseTemplates = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 gradient-text">Course Templates</h1>
      <CourseTemplatesComponent />
    </div>
  );
};

export default CourseTemplates;
