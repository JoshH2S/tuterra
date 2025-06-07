import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type InternshipSession = Tables<"internship_sessions">;

export class InternshipService {
  /**
   * Get all internship sessions for a user
   */
  static async getUserInternships(userId: string): Promise<InternshipSession[]> {
    const { data, error } = await supabase
      .from("internship_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch internships: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Delete an internship session and all related data
   * The database cascading deletes will handle related tables
   */
  static async deleteInternshipSession(sessionId: string, userId: string): Promise<void> {
    // First verify the session belongs to the user
    const { data: session, error: fetchError } = await supabase
      .from("internship_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !session) {
      throw new Error("Internship session not found or access denied");
    }

    // Delete the session (cascading deletes will handle related data)
    const { error: deleteError } = await supabase
      .from("internship_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (deleteError) {
      throw new Error(`Failed to delete internship session: ${deleteError.message}`);
    }
  }

  /**
   * Get internship session with related data
   */
  static async getInternshipWithDetails(sessionId: string, userId: string) {
    const { data, error } = await supabase
      .from("internship_sessions")
      .select(`
        *,
        internship_company_profiles(*),
        internship_tasks(count),
        internship_task_submissions(count)
      `)
      .eq("id", sessionId)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch internship details: ${error.message}`);
    }

    return data;
  }

  /**
   * Get basic stats for an internship session
   */
  static async getInternshipStats(sessionId: string) {
    // Get task count
    const { count: totalTasks } = await supabase
      .from("internship_tasks")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    // Get completed submissions count
    const { count: completedTasks } = await supabase
      .from("internship_task_submissions")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    // Get supervisor messages count
    const { count: messageCount } = await supabase
      .from("internship_supervisor_messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", sessionId);

    return {
      totalTasks: totalTasks || 0,
      completedTasks: completedTasks || 0,
      messageCount: messageCount || 0,
      progressPercent: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  }
} 