import { supabase } from "@/integrations/supabase/client";
import { StudySession } from "@/types/study-sessions";

export const logStudySessionActivity = async (userId: string, description: string, session: StudySession) => {
  const metadata = {
    session: {
      id: session.id,
      title: session.title,
      description: session.description,
      start_time: session.start_time,
      end_time: session.end_time,
      course_id: session.course_id,
      status: session.status
    }
  };

  await supabase.from('activity_logs').insert({
    student_id: userId,
    course_id: session.course_id,
    activity_type: 'study_session',
    description,
    metadata
  });
};

export const logActivity = async (
  studentId: string,
  activityType: string,
  description: string,
  metadata?: any
) => {
  await supabase.from('activity_logs').insert({
    student_id: studentId,
    course_id: metadata?.session?.course_id || '', // Default empty string if no course_id
    activity_type: activityType,
    description,
    metadata
  });
};
