import { supabase } from '@/integrations/supabase/client';

export interface CertificateData {
  participantName: string;
  jobTitle: string;
  industry: string;
  companyName: string;
  completedAt: string;
  totalXP: number;
  averageLevel: number;
  topSkills: Array<{
    skill: { name: string };
    current_level: number;
  }>;
  completedTasks: number;
  totalTasks: number;
  certificateId: string;
  sessionId: string;
  userId: string;
}

export class CertificateService {
  /**
   * Generate a digital certificate for a completed internship
   */
  static async generateCertificate(sessionId: string, userId: string): Promise<string> {
    try {
      // Check if certificate already exists
      const { data: existingSubmission } = await supabase
        .from('internship_final_submissions')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single();

      if (existingSubmission) {
        return existingSubmission.id; // Return existing certificate ID
      }

      // Create new certificate entry
      const { data: submission, error } = await supabase
        .from('internship_final_submissions')
        .insert({
          session_id: sessionId,
          user_id: userId,
          submitted_at: new Date().toISOString(),
          reflection: 'Digital certificate generated'
        })
        .select('id')
        .single();

      if (error) throw error;

      return submission.id;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw new Error('Failed to generate certificate');
    }
  }

  /**
   * Get certificate data by ID
   */
  static async getCertificateData(certificateId: string): Promise<CertificateData | null> {
    try {
      // Get certificate from final submissions
      const { data: submission, error: submissionError } = await supabase
        .from('internship_final_submissions')
        .select(`
          *,
          session:internship_sessions(
            job_title,
            industry,
            user_id
          )
        `)
        .eq('id', certificateId)
        .single();

      if (submissionError || !submission) {
        return null;
      }

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', submission.user_id)
        .single();

      // Get completion data for stats
      const { data: tasks } = await supabase
        .from('internship_tasks')
        .select('*')
        .eq('session_id', submission.session_id);

      const { data: taskSubmissions } = await supabase
        .from('internship_task_submissions')
        .select('*')
        .eq('session_id', submission.session_id)
        .eq('user_id', submission.user_id);

      // Get skill progress
      const { data: skillProgress } = await supabase
        .from('user_skill_progress')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('user_id', submission.user_id)
        .order('current_level', { ascending: false })
        .order('current_xp', { ascending: false })
        .limit(6);

      // Calculate stats
      const totalTasks = tasks?.length || 0;
      const completedTasks = taskSubmissions?.length || 0;
      const totalXP = skillProgress?.reduce((sum, sp) => sum + sp.current_xp, 0) || 0;
      const averageLevel = skillProgress?.length 
        ? Math.round((skillProgress.reduce((sum, sp) => sum + sp.current_level, 0) / skillProgress.length) * 10) / 10
        : 0;

      const participantName = profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : 'Internship Participant';

      return {
        participantName,
        jobTitle: submission.session?.job_title || 'Virtual Intern',
        industry: submission.session?.industry || 'Professional Development',
        companyName: 'Tuterra',
        completedAt: submission.submitted_at,
        totalXP,
        averageLevel,
        topSkills: skillProgress || [],
        completedTasks,
        totalTasks,
        certificateId: submission.id,
        sessionId: submission.session_id,
        userId: submission.user_id
      };
    } catch (error) {
      console.error('Error fetching certificate data:', error);
      return null;
    }
  }

  /**
   * Verify if a certificate is valid
   */
  static async verifyCertificate(certificateId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('internship_final_submissions')
        .select('id')
        .eq('id', certificateId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get certificate URL
   */
  static getCertificateUrl(certificateId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/certificates/${certificateId}`;
  }

  /**
   * Generate certificate for completed internship and return URL
   */
  static async generateAndGetUrl(sessionId: string, userId: string): Promise<string> {
    const certificateId = await this.generateCertificate(sessionId, userId);
    return this.getCertificateUrl(certificateId);
  }
}
