
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useCourses } from "@/hooks/useCourses";
import type { CreateStudySessionData } from "@/types/study-sessions";

interface UseSessionFormProps {
  onCreateSession: (session: CreateStudySessionData) => Promise<void>;
  onClose: () => void;
}

export function useSessionForm({ onCreateSession, onClose }: UseSessionFormProps) {
  const [sessionData, setSessionData] = useState<Partial<CreateStudySessionData>>({
    notify_user: true // Default to sending email notifications
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { courses, isLoading } = useCourses();
  
  const resetForm = () => {
    setSessionData({ notify_user: true });
    setSelectedDate(new Date());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast({
        title: "Date required",
        description: "Please select a date for your study session",
        variant: "destructive"
      });
      return;
    }
    
    if (sessionData.title && sessionData.course_id && sessionData.start_time && sessionData.end_time) {
      // Combine the date with the time
      const [startHour, startMinute] = sessionData.start_time.split(':');
      const [endHour, endMinute] = sessionData.end_time.split(':');
      
      const startDate = new Date(selectedDate);
      startDate.setHours(parseInt(startHour), parseInt(startMinute));
      
      const endDate = new Date(selectedDate);
      endDate.setHours(parseInt(endHour), parseInt(endMinute));
      
      await onCreateSession({
        title: sessionData.title,
        description: sessionData.description || null,
        course_id: sessionData.course_id,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        notify_user: sessionData.notify_user || false,
        status: 'scheduled'
      });
      
      resetForm();
      onClose();
    } else {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
    }
  };

  return {
    sessionData,
    setSessionData,
    selectedDate,
    setSelectedDate,
    courses,
    isLoading,
    handleSubmit,
    resetForm
  };
}
