
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateSelector } from "./DateSelector";
import { TimeRangePicker } from "./TimeRangePicker";
import { CourseSelector } from "./CourseSelector";
import type { CreateStudySessionData } from "@/types/study-sessions";

interface SessionFormFieldsProps {
  sessionData: Partial<CreateStudySessionData>;
  setSessionData: (data: Partial<CreateStudySessionData>) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  courses: any[];
  isLoading: boolean;
}

export function SessionFormFields({
  sessionData,
  setSessionData,
  selectedDate,
  setSelectedDate,
  courses,
  isLoading
}: SessionFormFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Session Title</Label>
        <Input 
          id="title"
          value={sessionData.title || ''}
          onChange={(e) => setSessionData({...sessionData, title: e.target.value})}
          placeholder="e.g., Review Chapter 5"
          required
        />
      </div>
      
      <CourseSelector 
        courses={courses}
        selectedCourseId={sessionData.course_id}
        onCourseSelect={(courseId) => setSessionData({...sessionData, course_id: courseId})}
        isLoading={isLoading}
      />
      
      <DateSelector 
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
      
      <TimeRangePicker 
        startTime={sessionData.start_time || ''}
        endTime={sessionData.end_time || ''}
        onStartTimeChange={(time) => setSessionData({...sessionData, start_time: time})}
        onEndTimeChange={(time) => setSessionData({...sessionData, end_time: time})}
      />
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input 
          id="description"
          value={sessionData.description || ''}
          onChange={(e) => setSessionData({...sessionData, description: e.target.value})}
          placeholder="Add details about this session"
        />
      </div>
    </div>
  );
}
