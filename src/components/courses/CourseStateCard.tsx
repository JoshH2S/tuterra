
import { Card, CardContent } from "@/components/ui/card";

interface CourseStateCardProps {
  message: string;
  isError?: boolean;
}

export const CourseStateCard = ({ message, isError = false }: CourseStateCardProps) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <p className={isError ? "text-red-600" : "text-gray-600"}>{message}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
