
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StudySession {
  id: string;
  title: string;
  date: Date;
  duration: number;
}

interface StudySessionContextType {
  sessions: StudySession[];
  addSession: (session: Omit<StudySession, 'id'>) => void;
  removeSession: (id: string) => void;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

export function StudySessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<StudySession[]>([]);

  const addSession = (sessionData: Omit<StudySession, 'id'>) => {
    const newSession = {
      ...sessionData,
      id: `session-${Date.now()}`,
    };
    setSessions([...sessions, newSession]);
  };

  const removeSession = (id: string) => {
    setSessions(sessions.filter(session => session.id !== id));
  };

  return (
    <StudySessionContext.Provider value={{ sessions, addSession, removeSession }}>
      {children}
    </StudySessionContext.Provider>
  );
}

export const useStudySession = () => {
  const context = useContext(StudySessionContext);
  if (context === undefined) {
    throw new Error('useStudySession must be used within a StudySessionProvider');
  }
  return context;
};
