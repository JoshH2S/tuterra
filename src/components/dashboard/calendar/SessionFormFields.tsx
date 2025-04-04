
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { CourseSelector } from "./CourseSelector";
import { TimeRangePicker } from "./TimeRangePicker";
import { DateSelector } from "./DateSelector";
import { CreateStudySessionData } from "@/types/study-sessions";

interface CourseOption {
  id: string;
  title: string;
  code?: string;
}

interface SessionFormFieldsProps {
  sessionData: Partial<CreateStudySessionData>;
  setSessionData: (data: Partial<CreateStudySessionData>) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  courses: CourseOption[];
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Study session title"
          value={sessionData.title || ""}
          onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What will you be studying?"
          value={sessionData.description || ""}
          onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      <CourseSelector
        courseId={sessionData.course_id || ""}
        onCourseSelect={(courseId) => setSessionData({ ...sessionData, course_id: courseId })}
        courses={courses}
        isLoading={isLoading}
      />

      {/* Add the DateSelector component */}
      <DateSelector
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        label="Session Date"
      />

      <TimeRangePicker
        startTime={sessionData.start_time || ""}
        endTime={sessionData.end_time || ""}
        onStartTimeChange={(time) => setSessionData({ ...sessionData, start_time: time })}
        onEndTimeChange={(time) => setSessionData({ ...sessionData, end_time: time })}
      />

      <div className="flex items-center space-x-2 pt-2">
        <Switch
          id="notify_user"
          checked={sessionData.notify_user || false}
          onCheckedChange={(checked) => setSessionData({ ...sessionData, notify_user: checked })}
        />
        <Label htmlFor="notify_user" className="text-sm cursor-pointer">
          Send email reminder one hour before session
        </Label>
      </div>
    </div>
  );
}
