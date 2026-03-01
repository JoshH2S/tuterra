import { useState } from "react";
import { Calendar, Clock, Target, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { Badge } from "@/components/ui/badge";
import { GeneratedCourse, CourseModule } from "@/types/course-engine";
import { format, addWeeks, addDays } from "date-fns";
import { cn } from "@/lib/utils";

interface CourseContractScreenProps {
  course: GeneratedCourse;
  modules: CourseModule[];
  onAcceptContract: (startDate: Date) => void;
  onCancel: () => void;
}

export function CourseContractScreen({ 
  course, 
  modules, 
  onAcceptContract, 
  onCancel 
}: CourseContractScreenProps) {
  const startDate = new Date(); // Always use today's date
  const [isAccepting, setIsAccepting] = useState(false);

  // Calculate course metrics
  const totalMinutes = modules.reduce((acc, m) => acc + (m.estimated_minutes || 0), 0);
  const sessionsPerWeek = 2; // Standard: 2 sessions per week
  const minutesPerSession = Math.round(totalMinutes / (course.pace_weeks * sessionsPerWeek));
  const targetCompletionDate = addWeeks(startDate, course.pace_weeks);
  
  // Calculate session schedule
  const getSessionSchedule = () => {
    const sessions = [];
    let currentDate = startDate;
    
    for (let week = 0; week < course.pace_weeks; week++) {
      // Tuesday and Thursday sessions
      const session1 = addDays(currentDate, week * 7 + (2 - currentDate.getDay())); // Tuesday
      const session2 = addDays(currentDate, week * 7 + (4 - currentDate.getDay())); // Thursday
      
      sessions.push({
        week: week + 1,
        session1: format(session1, 'EEE, MMM d'),
        session2: format(session2, 'EEE, MMM d'),
        module: modules[week]?.title || `Module ${week + 1}`
      });
    }
    
    return sessions;
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAcceptContract(startDate);
    } finally {
      setIsAccepting(false);
    }
  };

  const sessionSchedule = getSessionSchedule();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#091747] mb-2">
          Ready to Start Your Learning Journey?
        </h1>
        <p className="text-slate-600 text-lg">
          Let's set up your personalized learning schedule
        </p>
      </div>

      {/* Course Overview Card */}
      <PremiumCard className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
            <p className="text-slate-600 mb-3">{course.description}</p>
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </Badge>
              <Badge variant="outline">
                {course.pace_weeks} {course.pace_weeks === 1 ? 'week' : 'weeks'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Course Commitment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold text-primary-800">Duration</p>
              <p className="text-primary-700">{course.pace_weeks} weeks</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Clock className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold text-primary-800">Time Commitment</p>
              <p className="text-primary-700">{sessionsPerWeek} sessions/week</p>
              <p className="text-sm text-primary-600">~{minutesPerSession} min each</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <Target className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold text-primary-800">Total Learning</p>
              <p className="text-primary-700">{Math.round(totalMinutes / 60)}h {totalMinutes % 60}m</p>
              <p className="text-sm text-primary-600">{modules.length} modules</p>
            </div>
          </div>
        </div>

        {/* Target Completion Date */}
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>📅 Your course starts today!</strong> Target completion: <strong>{format(targetCompletionDate, 'EEEE, MMMM d, yyyy')}</strong>
          </p>
        </div>
      </PremiumCard>

      {/* Learning Objectives */}
      {course.learning_objectives && course.learning_objectives.length > 0 && (
        <PremiumCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            By the end of this course, you'll be able to:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {course.learning_objectives.map((objective, index) => (
              <div key={objective.id || index} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{objective.text}</span>
              </div>
            ))}
          </div>
        </PremiumCard>
      )}

      {/* Session Schedule Preview */}
      <PremiumCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Learning Schedule</h3>
        <div className="space-y-3">
          {sessionSchedule.map((week) => (
            <div key={week.week} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Week {week.week}: {week.module}</p>
              </div>
              <div className="text-sm text-slate-600">
                {week.session1} & {week.session2}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>💡 Tip:</strong> Consistency is key! Try to stick to your scheduled sessions for the best learning outcomes.
          </p>
        </div>
      </PremiumCard>

      {/* Course Contract Agreement */}
      <PremiumCard className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <h3 className="text-lg font-semibold mb-3 text-primary">Course Commitment</h3>
        <div className="space-y-2 text-sm text-slate-700 mb-4">
          <p>✅ I understand this is a <strong>{course.pace_weeks}-week commitment</strong></p>
          <p>✅ I will dedicate <strong>~{Math.round(totalMinutes / course.pace_weeks)} minutes per week</strong> to learning</p>
          <p>✅ I will attend <strong>{sessionsPerWeek} sessions per week</strong> as scheduled</p>
          <p>✅ I will complete all modules and assessments to get the full benefit</p>
        </div>
        
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Not Ready Yet
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={isAccepting}
            size="lg"
            className="gap-2"
          >
            {isAccepting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Starting Course...
              </>
            ) : (
              <>
                Start My Learning Journey
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </PremiumCard>
    </div>
  );
}





