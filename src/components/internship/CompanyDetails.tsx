import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { supabase } from "@/integrations/supabase/client";
import { Building, Users, Calendar, Award } from "lucide-react";

interface CompanyDetailsProps {
  sessionId: string;
}

interface CompanyInfo {
  id: string;
  session_id: string;
  name: string;
  industry: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  founded_year: string;
  size: string;
  created_at: string;
  updated_at: string;
}

export function CompanyDetails({ sessionId }: CompanyDetailsProps) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanyDetails() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("internship_company_profiles")
          .select("*")
          .eq("session_id", sessionId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          // Map database fields to interface fields
          const companyData: CompanyInfo = {
            id: data.id,
            session_id: data.session_id,
            name: data.company_name,
            industry: data.industry,
            description: data.company_overview,
            mission: data.company_mission,
            vision: data.company_vision || '',
            values: data.company_values ? [data.company_values] : [],
            founded_year: data.founded_year?.toString() || '',
            size: data.company_size || '',
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          setCompanyInfo(companyData);
        }
      } catch (error) {
        console.error("Failed to load company details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      fetchCompanyDetails();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-6">
          <LoadingSpinner size="default" />
        </CardContent>
      </Card>
    );
  }

  if (!companyInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Building className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="font-medium">Company Information Unavailable</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Company information could not be loaded.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 pb-2">
        <CardTitle className="flex items-center text-xl">
          <Building className="mr-2 h-5 w-5" />
          {companyInfo.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{companyInfo.industry}</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm">{companyInfo.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-start space-x-2">
              <Calendar className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <h4 className="text-xs font-medium">Founded</h4>
                <p className="text-sm">{companyInfo.founded_year}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Users className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <h4 className="text-xs font-medium">Company Size</h4>
                <p className="text-sm">{companyInfo.size}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-1 flex items-center">
              <Award className="mr-1 h-4 w-4 text-primary" />
              Mission & Values
            </h3>
            <p className="text-sm mb-2">{companyInfo.mission}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {companyInfo.values && companyInfo.values.map((value, index) => (
                <span 
                  key={index}
                  className="text-xs bg-primary/10 text-primary-foreground px-2 py-0.5 rounded"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 