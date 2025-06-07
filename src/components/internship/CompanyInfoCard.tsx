import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Use the Database types
type CompanyProfile = Database['public']['Tables']['internship_company_profiles']['Row'];
type CompanyDetails = Database['public']['Tables']['internship_company_details']['Row'];

interface CompanyInfoCardProps {
  sessionId: string;
}

type ProfileStatus = 'pending' | 'completed' | 'error' | 'not_found';

export function CompanyInfoCard({ sessionId }: CompanyInfoCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('not_found');
  const [generatingProfile, setGeneratingProfile] = useState(false);

  const fetchCompanyData = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("🔍 Fetching company data for session:", sessionId);
      
      // Fetch both company profile and company details in parallel
      const [profileResult, detailsResult] = await Promise.allSettled([
        supabase
          .from('internship_company_profiles')
          .select('*')
          .eq('session_id', sessionId)
          .limit(1),
        supabase
          .from('internship_company_details')
          .select('*')
          .eq('session_id', sessionId)
          .limit(1)
      ]);
      
      let profileData = null;
      let detailsData = null;
      
      if (profileResult.status === 'fulfilled' && profileResult.value.data && profileResult.value.data.length > 0) {
        profileData = profileResult.value.data[0];
        console.log("✅ Company profile found with status:", profileData.profile_status);
        setProfileStatus(profileData.profile_status as ProfileStatus || 'completed');
      } else if (profileResult.status === 'rejected') {
        console.warn("Failed to fetch company profile:", profileResult.reason);
      }
      
      if (detailsResult.status === 'fulfilled' && detailsResult.value.data && detailsResult.value.data.length > 0) {
        detailsData = detailsResult.value.data[0];
        console.log("✅ Company details found");
      } else if (detailsResult.status === 'rejected') {
        console.warn("Failed to fetch company details:", detailsResult.reason);
      }
      
      setCompanyProfile(profileData);
      setCompanyDetails(detailsData);
      
      // Determine overall status
      if (!profileData && !detailsData) {
        console.log("📝 No company data found");
        setProfileStatus('not_found');
      }

    } catch (err) {
      console.error("❌ Error fetching company data:", err);
      setError("Failed to fetch company information");
      setProfileStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const generateCompanyProfile = async () => {
    setGeneratingProfile(true);
    setError(null);
    setProfileStatus('pending');
    
    try {
      console.log("🚀 Starting company profile generation for session:", sessionId);
      
      // Get session info to determine job title and industry
      const { data: sessionData, error: sessionError } = await supabase
        .from('internship_sessions')
        .select('job_title, industry')
        .eq('id', sessionId)
        .limit(1);

      if (sessionError) {
        console.error("❌ Failed to get session info:", sessionError);
        throw new Error(`Failed to get session info: ${sessionError.message}`);
      }

      if (!sessionData || sessionData.length === 0) {
        console.error("❌ Session not found");
        throw new Error("Session not found");
      }

      const { job_title, industry } = sessionData[0];
      
      if (!job_title || !industry) {
        console.error("❌ Session missing required fields:", { job_title, industry });
        throw new Error("Session missing job title or industry information");
      }

      console.log("📋 Session info retrieved:", { job_title, industry, sessionId });

      // Call the edge function with detailed logging
      console.log("📞 Calling generate-company-profile edge function...");
      const { data, error } = await supabase.functions.invoke('generate-company-profile', {
        body: {
          session_id: sessionId,
          job_title,
          industry
        }
      });

      if (error) {
        console.error("❌ Edge function error:", error);
        setProfileStatus('error');
        throw error;
      }

      console.log("✅ Edge function response:", data);
      
      // If we get a pending status from the response, start polling
      if (data && data.status === 'pending') {
        console.log("📋 Profile generation started, polling for completion...");
        setProfileStatus('pending');
        startPolling();
      } else {
        // If completed immediately, refresh data
        await fetchCompanyData();
      }
      
    } catch (err) {
      console.error("❌ Company profile generation failed:", err);
      setError(err instanceof Error ? err.message : "Failed to generate company profile");
      setProfileStatus('error');
    } finally {
      setGeneratingProfile(false);
    }
  };

  const startPolling = () => {
    console.log("🔄 Starting polling for profile completion...");
    
    const pollInterval = setInterval(async () => {
      try {
        const { data: profileData } = await supabase
          .from('internship_company_profiles')
          .select('*')
          .eq('session_id', sessionId)
          .limit(1);

        if (profileData && profileData.length > 0) {
          console.log("✅ Profile generation completed!");
          clearInterval(pollInterval);
          await fetchCompanyData();
        }
      } catch (pollError) {
        console.error("❌ Polling error:", pollError);
      }
    }, 2000); // Poll every 2 seconds

    // Clear polling after 2 minutes max
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log("⏰ Polling timeout reached");
    }, 120000);
  };

  useEffect(() => {
    if (sessionId) {
      fetchCompanyData();
      
      // Set up real-time subscription for profile changes
      const subscription = supabase
        .channel('company_profiles')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'internship_company_profiles',
            filter: `session_id=eq.${sessionId}`
          },
          (payload) => {
            console.log("🔄 Real-time profile update:", payload);
            fetchCompanyData();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [sessionId]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2">Loading company information...</span>
        </div>
      </Card>
    );
  }

  // Show pending state
  if (profileStatus === 'pending') {
    return (
      <Card className="p-6 border-blue-200">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-medium text-blue-600">Generating Company Profile</h3>
          <p className="text-gray-600">
            Creating a comprehensive company profile for your internship experience...
          </p>
          <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
            This typically takes 30-60 seconds. The page will update automatically when complete.
          </div>
        </div>
      </Card>
    );
  }

  // Show error state
  if (profileStatus === 'error' || error) {
    return (
      <Card className="p-6 border-red-200">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium text-red-600">Company Profile Generation Failed</h3>
          <p className="text-gray-600">
            {error || "An error occurred while generating the company profile."}
          </p>
          <button
            onClick={generateCompanyProfile}
            disabled={generatingProfile}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {generatingProfile ? "Retrying..." : "🔄 Retry Generation"}
          </button>
        </div>
      </Card>
    );
  }

  // Show generation option if no data
  if (profileStatus === 'not_found') {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-medium">No Company Information Available</h3>
          <p className="text-gray-600">
            No company profile has been generated for this internship session yet.
          </p>
          <button
            onClick={generateCompanyProfile}
            disabled={generatingProfile}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {generatingProfile ? "Starting Generation..." : "🚀 Generate Company Profile"}
          </button>
          <p className="text-xs text-gray-400">
            This will create a comprehensive company profile for your internship experience.
          </p>
        </div>
      </Card>
    );
  }

  // Show available data
  return (
    <div className="space-y-6">
      {companyProfile && (
        <div className="space-y-6">
          {/* Company Header */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{companyProfile.company_name}</h2>
                  {companyProfile.company_tagline && (
                    <p className="text-lg text-primary italic">"{companyProfile.company_tagline}"</p>
                  )}
                </div>
                {companyProfile.company_logo_url && (
                  <img 
                    src={companyProfile.company_logo_url} 
                    alt={`${companyProfile.company_name} logo`}
                    className="h-16 w-auto"
                  />
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Industry:</span> {companyProfile.industry}
                </div>
                <div>
                  <span className="font-medium">Founded:</span> {companyProfile.founded_year}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {companyProfile.company_size}
                </div>
              </div>
            </div>
          </Card>

          {/* Company Overview */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">About {companyProfile.company_name}</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{companyProfile.company_overview}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Mission</h4>
                  <p className="text-gray-700">{companyProfile.company_mission}</p>
                </div>
                {companyProfile.company_vision && (
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Vision</h4>
                    <p className="text-gray-700">{companyProfile.company_vision}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Leadership */}
          {companyProfile.ceo_name && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Leadership</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">{companyProfile.ceo_name}</h4>
                  <p className="text-sm text-gray-600 mb-2">Chief Executive Officer</p>
                  {companyProfile.ceo_bio && (
                    <p className="text-gray-700">{companyProfile.ceo_bio}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Organization Structure */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Organization</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-primary mb-2">Team Structure</h4>
                <p className="text-gray-700">{companyProfile.team_structure}</p>
              </div>
              
              {companyProfile.departments && Array.isArray(companyProfile.departments) && companyProfile.departments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Key Departments</h4>
                  <div className="flex flex-wrap gap-2">
                    {companyProfile.departments.map((dept, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {companyProfile.team_members && Array.isArray(companyProfile.team_members) && companyProfile.team_members.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-3">Team Members</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companyProfile.team_members.map((member: any, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <h5 className="font-medium">{member.name}</h5>
                        <p className="text-sm text-gray-600">{member.role}</p>
                        <p className="text-sm text-gray-500">{member.department}</p>
                        <p className="text-sm text-blue-600">{member.email}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Your Internship */}
          <Card className="p-6 border-2 border-primary/20 bg-primary/5">
            <h3 className="text-xl font-semibold mb-4 text-primary">Your Internship</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Department</h4>
                  <p className="text-gray-700">{companyProfile.intern_department || "General Operations"}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Supervisor</h4>
                  <p className="text-gray-700">{companyProfile.supervisor_name}</p>
                </div>
              </div>
              
              {companyProfile.sample_projects && Array.isArray(companyProfile.sample_projects) && companyProfile.sample_projects.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Sample Projects</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {companyProfile.sample_projects.map((project, index) => (
                      <li key={index}>{project}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {companyProfile.intern_expectations && Array.isArray(companyProfile.intern_expectations) && companyProfile.intern_expectations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">What We're Looking For</h4>
                  <div className="flex flex-wrap gap-2">
                    {companyProfile.intern_expectations.map((expectation, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {expectation}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Business Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Business Information</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Core Values</h4>
                  <p className="text-gray-700">{companyProfile.company_values}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Target Market</h4>
                  <p className="text-gray-700">{companyProfile.target_market || "Various industry segments"}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-primary mb-2">Products & Services</h4>
                <p className="text-gray-700">{companyProfile.clients_or_products}</p>
              </div>
              
              {companyProfile.notable_clients && Array.isArray(companyProfile.notable_clients) && companyProfile.notable_clients.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Notable Clients</h4>
                  <div className="flex flex-wrap gap-2">
                    {companyProfile.notable_clients.map((client, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                        {client}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Tools & Technology */}
          {companyProfile.tools_technologies && Array.isArray(companyProfile.tools_technologies) && companyProfile.tools_technologies.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Tools & Technology</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {companyProfile.tools_technologies.map((tool, index) => (
                  <div key={index} className="text-center p-3 border rounded-lg hover:bg-gray-50">
                    <span className="text-sm font-medium">{tool}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Company Story */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Our Story</h3>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">{companyProfile.background_story}</p>
              <div className="text-sm text-gray-500">
                📍 Headquarters: {companyProfile.headquarters_location}
              </div>
            </div>
          </Card>
        </div>
      )}

      {companyDetails && !companyProfile && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Company Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Founded</h3>
              <p className="text-gray-700">{companyDetails.founded_year}</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Company Size</h3>
              <p className="text-gray-700">{companyDetails.size}</p>
            </div>
            
            {companyDetails.vision && (
              <div className="md:col-span-2">
                <h3 className="font-semibold">Vision</h3>
                <p className="text-gray-700">{companyDetails.vision}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {!companyProfile && !companyDetails && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">No Company Information Available</h3>
            <p className="text-gray-600">
              Company information is being prepared for this internship session.
            </p>
            <button
              onClick={generateCompanyProfile}
              disabled={generatingProfile}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {generatingProfile ? "Generating..." : "Generate Company Profile"}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
} 