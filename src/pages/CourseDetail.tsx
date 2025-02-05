import { useParams } from "react-router-dom";
import { TutorChat } from "@/components/tutor/TutorChat";

const CourseDetail = () => {
  const { courseId } = useParams();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <TutorChat />
      </div>
    </div>
  );
};

export default CourseDetail;