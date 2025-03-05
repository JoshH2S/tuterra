
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Course } from "@/types/course";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <Link to={`/courses/${course.id}/grades`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl">{course.title}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Created {format(new Date(course.created_at!), 'MMM d, yyyy')}</span>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
};
