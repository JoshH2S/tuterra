import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityItem {
  id: string;
  title: string;
  type: "Course" | "Assessment" | "Interview";
  timestamp: string;
  href: string;
  progress?: number;   // 0–100, courses only
  score?: number;      // 0–100, assessments only
  completed: boolean;
  meta?: string;       // e.g. "Intermediate · Finance"
}

async function fetchCourseActivity(userId: string): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from("course_progress")
    .select(`
      id,
      course_id,
      last_activity_at,
      total_steps_completed,
      generated_courses!course_id (
        title,
        status,
        pace_weeks
      )
    `)
    .eq("user_id", userId)
    .order("last_activity_at", { ascending: false })
    .limit(5);

  if (error || !data) return [];

  return data.map((row) => {
    const course = Array.isArray(row.generated_courses)
      ? row.generated_courses[0]
      : row.generated_courses;
    const paceWeeks = (course as { pace_weeks?: number } | null)?.pace_weeks ?? 1;
    const totalSteps = paceWeeks * 6;
    const pct = Math.min(100, Math.round(((row.total_steps_completed ?? 0) / totalSteps) * 100));
    const status = (course as { status?: string } | null)?.status ?? "";

    return {
      id: row.id,
      title: (course as { title?: string } | null)?.title ?? "Untitled Course",
      type: "Course" as const,
      timestamp: row.last_activity_at ?? "",
      href: `/courses/generated/${row.course_id}`,
      progress: pct,
      completed: status === "completed" || pct === 100,
    };
  });
}

async function fetchAssessmentActivity(userId: string): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from("skill_assessment_results")
    .select(`
      id,
      score,
      completed_at,
      level,
      assessment:assessment_id (
        title,
        industry,
        role
      )
    `)
    .eq("user_id", userId)
    .order("completed_at", { ascending: false })
    .limit(5);

  if (error || !data) return [];

  return data.map((row) => {
    const a = Array.isArray(row.assessment) ? row.assessment[0] : row.assessment;
    const industry = (a as { industry?: string } | null)?.industry ?? "";
    const level = row.level ?? "";
    const metaParts = [level, industry].filter(Boolean);

    return {
      id: row.id,
      title: (a as { title?: string } | null)?.title ?? "Skill Assessment",
      type: "Assessment" as const,
      timestamp: row.completed_at ?? "",
      href: `/assessments/skill-assessment-results/${row.id}`,
      score: row.score != null ? Math.round(row.score) : undefined,
      completed: true,
      meta: metaParts.join(" · ") || undefined,
    };
  });
}

async function fetchInterviewActivity(userId: string): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select(`
      id,
      job_title,
      industry,
      created_at,
      interview_feedback ( id )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error || !data) return [];

  return data.map((row) => {
    const feedbackRows = Array.isArray(row.interview_feedback)
      ? row.interview_feedback
      : row.interview_feedback
        ? [row.interview_feedback]
        : [];
    const hasCompleted = feedbackRows.length > 0;
    const industry = row.industry ?? "";

    return {
      id: row.id,
      title: row.job_title ?? "Interview Session",
      type: "Interview" as const,
      timestamp: row.created_at ?? "",
      href: "/assessments/job-interview-simulator",
      completed: hasCompleted,
      meta: industry || undefined,
    };
  });
}

export function useRecentActivity(limit = 3) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [courses, assessments, interviews] = await Promise.all([
        fetchCourseActivity(user.id),
        fetchAssessmentActivity(user.id),
        fetchInterviewActivity(user.id),
      ]);

      const merged = [...courses, ...assessments, ...interviews]
        .filter((item) => item.timestamp)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

      setItems(merged);
    } catch (err) {
      console.error("useRecentActivity error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { items, isLoading, refresh: fetch };
}
