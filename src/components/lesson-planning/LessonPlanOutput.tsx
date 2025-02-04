import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LessonPlanOutputProps {
  lessonPlan: string;
}

export const LessonPlanOutput = ({ lessonPlan }: LessonPlanOutputProps) => {
  if (!lessonPlan) return null;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Generated Lesson Plan</CardTitle>
        <CardDescription>AI-generated lesson plan based on your content and objectives</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans">{lessonPlan}</pre>
        </div>
      </CardContent>
    </Card>
  );
};