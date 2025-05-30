import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, Users, FileCheck, Target, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CompanyInfoCardProps {
  sessionId: string;
}

interface CompanyProfile {
  company_name: string;
  company_overview: string | null;
  company_mission: string | null;
  team_structure: string | null;
  company_values: string | null;
  clients_or_products: string | null;
  headquarters_location: string | null;
  supervisor_name: string | null;
  background_story: string | null;
}

export function CompanyInfoCard({ sessionId }: CompanyInfoCardProps) {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCompanyProfile() {
      if (!sessionId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from("internship_company_profiles")
          .select("*")
          .eq("session_id", sessionId)
          .limit(1)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setCompanyProfile(data);
        } else {
          // If no company profile exists yet, trigger the generation function
          const { data: generatedData, error: functionError } = await supabase.functions.invoke('generate-company-profile', {
            body: {
              session_id: sessionId,
              // Fetch job title and industry from the session
              ...(await fetchSessionInfo(sessionId))
            }
          });
          
          if (functionError) throw functionError;
          
          if (generatedData && generatedData.data) {
            setCompanyProfile(generatedData.data);
          }
        }
      } catch (err) {
        console.error("Error fetching company profile:", err);
        setError("Failed to load company information");
      } finally {
        setIsLoading(false);
      }
    }
    
    async function fetchSessionInfo(sessionId: string) {
      const { data, error } = await supabase
        .from("internship_sessions")
        .select("job_title, industry")
        .eq("id", sessionId)
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching session info:", error);
        return { job_title: "", industry: "" };
      }
      
      return data;
    }
    
    fetchCompanyProfile();
  }, [sessionId]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Error loading company details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!companyProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Company details unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No company information is available for this internship.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Parse comma-separated values into arrays
  const teamStructure = companyProfile.team_structure?.split(',').map(item => item.trim()) || [];
  const companyValues = companyProfile.company_values?.split(',').map(item => item.trim()) || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{companyProfile.company_name}</CardTitle>
        <CardDescription>{companyProfile.company_overview}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {companyProfile.company_mission && (
            <div className="flex items-start gap-2">
              <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Mission</p>
                <p className="text-sm text-muted-foreground">{companyProfile.company_mission}</p>
              </div>
            </div>
          )}
          
          {teamStructure.length > 0 && (
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Team Structure</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teamStructure.map((team, index) => (
                    <Badge key={index} variant="secondary" className="font-normal">
                      {team}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {companyValues.length > 0 && (
            <div className="flex items-start gap-2">
              <FileCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Company Values</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {companyValues.map((value, index) => (
                    <Badge key={index} variant="outline" className="font-normal">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {companyProfile.clients_or_products && (
            <div className="flex items-start gap-2">
              <ShoppingBag className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Products & Clients</p>
                <p className="text-sm text-muted-foreground">{companyProfile.clients_or_products}</p>
              </div>
            </div>
          )}
          
          {companyProfile.headquarters_location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Headquarters</p>
                <p className="text-sm text-muted-foreground">{companyProfile.headquarters_location}</p>
              </div>
            </div>
          )}
          
          {companyProfile.background_story && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm">{companyProfile.background_story}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 