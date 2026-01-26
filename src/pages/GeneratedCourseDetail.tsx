import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Clock, 
  Target, 
  ChevronRight, 
  Play, 
  CheckCircle,
  Lock,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/ui/premium-card";
import { useCourseRunner } from "@/hooks/useCourseRunner";
import { cn } from "@/lib/utils";

const GeneratedCourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    course,
    modules,
    progress,
    isLoading,
    loadCourse,
    getProgressPercentage,
  } = useCourseRunner();

  useEffect(() => {
    if (id) {
      loadCourse(id);
    }
  }, [id, loadCourse]);

  const handleStartCourse = () => {
    if (id) {
      navigate(`/courses/generated/${id}/learn`);
    }
  };

  const handleContinue = () => {
    if (id) {
      navigate(`/courses/generated/${id}/learn`);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-500';
      case 'intermediate': return 'bg-amber-500/10 text-amber-500';
      case 'advanced': return 'bg-red-500/10 text-red-500';
      default: return 'bg-primary/10 text-primary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PremiumCard className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-4">
            This course may have been deleted or you don't have access.
          </p>
          <Button onClick={() => navigate('/courses/generated')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </PremiumCard>
      </div>
    );
  }

  const progressPercent = getProgressPercentage();
  const hasStarted = progress && progress.total_steps_completed > 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/courses/generated')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Courses
      </Button>

      {/* Course Header */}
      <PremiumCard className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getLevelColor(course.level)}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </Badge>
              <Badge variant="outline">
                {course.pace_weeks} {course.pace_weeks === 1 ? 'week' : 'weeks'}
              </Badge>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.title}</h1>
            
            {course.description && (
              <p className="text-muted-foreground mb-4">{course.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {modules.length} modules
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                ~{modules.reduce((acc, m) => acc + (m.estimated_minutes || 0), 0)} min
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            {hasStarted ? (
              <>
                <div className="text-right mb-2">
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">{progressPercent}%</p>
                </div>
                <Button onClick={handleContinue} size="lg">
                  Continue Learning
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </>
            ) : (
              <Button onClick={handleStartCourse} size="lg">
                <Play className="h-5 w-5 mr-2" />
                Start Course
              </Button>
            )}
          </div>
        </div>

        {hasStarted && (
          <div className="mt-6">
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}
      </PremiumCard>

      {/* Learning Objectives */}
      {course.learning_objectives && course.learning_objectives.length > 0 && (
        <PremiumCard className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            What You'll Learn
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {course.learning_objectives.map((objective, index) => (
              <li key={objective.id || index} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{objective.text}</span>
              </li>
            ))}
          </ul>
        </PremiumCard>
      )}

      {/* Course Syllabus */}
      <PremiumCard className="p-6">
        <h2 className="text-lg font-semibold mb-4">Course Syllabus</h2>
        <div className="space-y-3">
          {modules.map((module, index) => {
            const moduleProgress = progress?.module_completion?.[module.id];
            const isCompleted = module.is_completed || moduleProgress?.status === 'completed';
            const isInProgress = moduleProgress?.status === 'in_progress';
            const isCurrent = progress?.current_module_id === module.id;

            return (
              <div
                key={module.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                  isCurrent && "border-primary bg-primary/5",
                  isCompleted && "border-green-500/50 bg-green-500/5",
                  !isCurrent && !isCompleted && "border-border hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && !isCompleted && "bg-primary text-primary-foreground",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{module.title}</h3>
                  {module.summary && (
                    <p className="text-sm text-muted-foreground truncate">{module.summary}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {module.estimated_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {module.estimated_minutes}m
                    </span>
                  )}
                  
                  {isCompleted && (
                    <Badge variant="outline" className="text-green-500 border-green-500/50">
                      Complete
                    </Badge>
                  )}
                  
                  {isInProgress && !isCompleted && (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                      In Progress
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </PremiumCard>
    </div>
  );
};

export default GeneratedCourseDetail;
