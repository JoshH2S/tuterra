
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
}

interface CourseAssignmentsTabProps {
  assignments: Assignment[];
}

export const CourseAssignmentsTab = ({ assignments }: CourseAssignmentsTabProps) => {
  return (
    <div className="space-y-4">
      {assignments?.map((assignment) => (
        <Card key={assignment.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{assignment.title}</h3>
                <p className="text-sm text-gray-600">{assignment.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  Due: {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-600">
                  Points: {assignment.max_points}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
