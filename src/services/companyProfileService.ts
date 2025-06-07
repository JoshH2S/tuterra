import { supabase } from "@/integrations/supabase/client";

export interface CompanyProfileGenerationStatus {
  isGenerating: boolean;
  isComplete: boolean;
  hasProfile: boolean;
  error?: string;
}

export class CompanyProfileService {
  
  /**
   * Check if company profile exists for a session
   */
  static async checkProfileStatus(sessionId: string): Promise<CompanyProfileGenerationStatus> {
    try {
      const { data, error } = await supabase
        .from('internship_company_profiles')
        .select('id, profile_status, error_message')
        .eq('session_id', sessionId)
        .limit(1);

      if (error) {
        console.error('Error checking company profile status:', error);
        return {
          isGenerating: false,
          isComplete: false,
          hasProfile: false,
          error: error.message
        };
      }

      if (!data || data.length === 0) {
        // No profile exists yet
        return {
          isGenerating: false,
          isComplete: false,
          hasProfile: false
        };
      }

      const profile = data[0];
      
      return {
        isGenerating: profile.profile_status === 'pending',
        isComplete: profile.profile_status === 'completed',
        hasProfile: true,
        error: profile.profile_status === 'error' ? profile.error_message : undefined
      };
    } catch (error) {
      console.error('Exception checking company profile status:', error);
      return {
        isGenerating: false,
        isComplete: false,
        hasProfile: false,
        error: String(error)
      };
    }
  }

  /**
   * Generate company profile for a session
   */
  static async generateProfile(sessionId: string, jobTitle: string, industry: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🏢 Generating company profile for session:', sessionId);

      const { data, error } = await supabase.functions.invoke('generate-company-profile', {
        body: {
          session_id: sessionId,
          job_title: jobTitle,
          industry: industry
        }
      });

      if (error) {
        console.error('❌ Company profile generation failed:', error);
        return {
          success: false,
          error: error.message || 'Failed to generate company profile'
        };
      }

      console.log('✅ Company profile generation successful:', data);
      return { success: true };

    } catch (error) {
      console.error('❌ Exception generating company profile:', error);
      return {
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * Get the generated company profile data
   */
  static async getCompanyProfile(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('internship_company_profiles')
        .select('*')
        .eq('session_id', sessionId)
        .eq('profile_status', 'completed')
        .limit(1);

      if (error) {
        console.error('Error fetching company profile:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Exception fetching company profile:', error);
      return null;
    }
  }

  /**
   * Poll for profile completion status
   */
  static async waitForCompletion(sessionId: string, maxWaitTimeMs: number = 120000): Promise<CompanyProfileGenerationStatus> {
    const startTime = Date.now();
    const pollInterval = 2000; // Poll every 2 seconds
    let retryCount = 0;
    const maxRetries = 3;

    while (Date.now() - startTime < maxWaitTimeMs) {
      try {
        const status = await this.checkProfileStatus(sessionId);
        
        if (status.isComplete) {
          return status;
        }

        if (status.error) {
          // If we have retries left, wait and try again
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retry ${retryCount}/${maxRetries} after error: ${status.error}`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
            continue;
          }
          return status;
        }

        if (!status.isGenerating && !status.hasProfile) {
          // Profile generation hasn't started or failed silently
          return {
            ...status,
            error: 'Profile generation did not start or failed to initialize'
          };
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Error during profile status check:', error);
        
        // If we have retries left, wait and try again
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retry ${retryCount}/${maxRetries} after error`);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
          continue;
        }
        
        return {
          isGenerating: false,
          isComplete: false,
          hasProfile: false,
          error: String(error)
        };
      }
    }

    // Timeout reached
    return {
      isGenerating: false,
      isComplete: false,
      hasProfile: true,
      error: 'Profile generation timed out. Please try again.'
    };
  }
} 