
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FullPageLoader } from '@/components/shared/LoadingStates';
import { Button } from '@/components/ui/button';

interface InternshipSession {
  id: string;
  user_id: string;
  job_title: string;
  industry: string;
  job_description: string | null;
  current_phase: number;
  created_at: string;
}

const InternshipPhase2 = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<InternshipSession | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        if (!sessionId) return;
        
        const { data, error } = await supabase
          .from('internship_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (error) {
          throw error;
        }

        if (data.current_phase < 2) {
          toast({
            title: "Phase not unlocked",
            description: "You need to complete Phase 1 first.",
            variant: "destructive"
          });
          navigate(`/interview/${sessionId}`);
          return;
        }

        setSession(data as InternshipSession);
      } catch (error) {
        console.error('Error fetching session:', error);
        toast({
          title: "Error",
          description: "Failed to load internship data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId, navigate]);

  if (loading) {
    return <FullPageLoader />;
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Virtual Internship: Phase 2</h1>
      
      {session && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{session.job_title} - {session.industry}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              Welcome to Phase 2 of your virtual internship! 
              Now that you've completed the interview process, it's time to work on some practical assignments.
            </p>
            <p className="mb-6">
              This phase will involve completing tasks related to the {session.job_title} position in the {session.industry} industry.
            </p>
            <div className="flex justify-center">
              <Button size="lg" onClick={() => toast({
                title: "Coming Soon",
                description: "Phase 2 content is under development."
              })}>
                Start Phase 2 Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InternshipPhase2;
