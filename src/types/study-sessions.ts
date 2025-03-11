
export interface StudySession {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  course_id: string | null;
  status: 'scheduled' | 'completed' | 'missed';
}

export type CreateStudySessionData = Omit<StudySession, 'id' | 'student_id'>;
