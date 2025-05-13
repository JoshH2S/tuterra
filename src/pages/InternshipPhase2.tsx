
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { FullPageLoader } from '@/components/shared/LoadingStates';
import { Button } from '@/components/ui/button';
import { Mail, Users, Briefcase, CheckCircle, LineChart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cleanMarkdownFormatting } from '@/utils/markdown-cleaner';

interface InternshipSession {
  id: string;
  user_id: string;
  job_title: string;
  industry: string;
  job_description: string | null;
  current_phase: number;
  created_at: string;
}

interface TeamMember {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
}

const InternshipPhase2 = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [session, setSession] = useState<InternshipSession | null>(null);
  const [userName, setUserName] = useState<string>('Intern');

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

        // Get user's first name for personalization
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('id', user.id)
            .single();
            
          if (profileData && profileData.first_name) {
            setUserName(profileData.first_name);
          }
        }
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
  }, [sessionId, navigate, user]);

  const getCompanyMission = (industry: string): string => {
    const missions: Record<string, string> = {
      'Technology': "WindNova is at the forefront of technological innovation, creating solutions that transform how businesses operate and people connect. Our mission is to make advanced technology accessible, intuitive, and impactful for organizations of all sizes.",
      'Healthcare': "At WindNova Health, we're revolutionizing patient care through data-driven insights and innovative technologies. Our mission is to improve health outcomes while reducing costs and enhancing the patient experience.",
      'Finance': "WindNova Financial empowers businesses and individuals to make smarter financial decisions. Our mission is to provide transparent, accessible financial tools and insights that drive prosperity.",
      'Education': "WindNova Learning is dedicated to transforming education through personalized, accessible learning experiences. Our mission is to empower students and educators with the tools they need to succeed in a rapidly evolving world.",
      'Renewable Energy': "WindNova Energy is committed to accelerating the global transition to clean, renewable energy. Our mission is to develop sustainable solutions that combat climate change while driving economic growth.",
      'Marketing': "WindNova Marketing helps brands tell compelling stories that resonate with audiences. Our mission is to create innovative marketing strategies that drive engagement, loyalty, and growth.",
      'Retail': "WindNova Retail is reimagining the shopping experience. Our mission is to connect consumers with products they love through seamless, personalized experiences.",
      'Manufacturing': "WindNova Manufacturing is dedicated to building the factories of the future. Our mission is to optimize production through innovation, sustainability, and operational excellence."
    };
    
    return missions[industry] || `WindNova is a pioneering company in the ${industry} industry. Our mission is to drive innovation, sustainability, and excellence in everything we do.`;
  };

  const getTeamMembers = (): TeamMember[] => {
    return [
      {
        name: "Priya Patel",
        role: "Team Lead",
        quote: "I'm excited to see what fresh perspectives you'll bring to the team. My door is always open for questions!"
      },
      {
        name: "Ethan Chen",
        role: "Senior Analyst",
        quote: "Don't worry about making mistakes - that's how we all learn. Happy to help you get up to speed."
      },
      {
        name: "Zara Washington",
        role: "Operations Coordinator",
        quote: "Don't be afraid to ask questions. We all started somewhere and are here to help you succeed."
      }
    ];
  };

  const getToolsAndTech = (jobTitle: string): string[] => {
    const toolsByRole: Record<string, string[]> = {
      'Data Analyst': ['Excel', 'SQL', 'Looker Studio', 'WindNova Analytics', 'Tableau'],
      'Marketing Intern': ['Canva', 'Google Analytics', 'Mailchimp', 'HubSpot', 'Social Media Tools'],
      'Software Engineer': ['Git', 'VS Code', 'Jira', 'AWS', 'CI/CD Tools'],
      'UX Designer': ['Figma', 'Sketch', 'Adobe Creative Suite', 'InVision', 'UserTesting'],
      'Financial Analyst': ['Excel', 'Bloomberg Terminal', 'Financial Modeling Tools', 'PowerBI', 'SQL'],
      'Project Manager': ['Asana', 'Jira', 'Microsoft Project', 'Slack', 'Confluence']
    };

    // Check for fuzzy matches on job title
    for (const [role, tools] of Object.entries(toolsByRole)) {
      if (jobTitle.toLowerCase().includes(role.toLowerCase())) {
        return tools;
      }
    }

    // Default tools for any role
    return ['Microsoft Office Suite', 'Slack', 'Google Workspace', 'Zoom', 'WindNova Internal Tools'];
  };

  const handleBeginInternship = async () => {
    if (!session || !user || !sessionId) return;
    
    setProcessingAction(true);
    
    try {
      // Insert record into internship_progress for phase 2
      const { error: progressError } = await supabase
        .from('internship_progress')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          phase_number: 2,
          created_at: new Date().toISOString()
        });
        
      if (progressError) throw progressError;
      
      // Update session to phase 3
      const { error: updateError } = await supabase
        .from('internship_sessions')
        .update({ current_phase: 3 })
        .eq('id', sessionId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Onboarding Complete!",
        description: "You're ready to begin your virtual internship tasks."
      });
      
      // Redirect to phase 3
      navigate(`/internship/phase-3/${sessionId}`);
    } catch (error) {
      console.error('Error processing:', error);
      toast({
        title: "Error",
        description: "Failed to proceed to the next phase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return <FullPageLoader />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">Welcome to Your Virtual Internship</h1>
      
      {session && (
        <div className="space-y-8">
          {/* Welcome Email */}
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader className="bg-muted/30 pb-2">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">From: priya.patel@windnova.com</span>
              </div>
              <CardTitle>Welcome to the Team, {userName}!</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">Hi {userName},</p>
              <p className="mb-4">
                We're excited to welcome you as a <strong>{session.job_title}</strong> at WindNova, a leading company in the <strong>{session.industry}</strong> space. You'll be helping us drive smarter decisions with data, innovation, and impact.
              </p>
              <p className="mb-4">
                In this onboarding phase, you'll learn about:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                <li>The company's mission</li>
                <li>The team you're working with</li>
                <li>Tools and technologies you'll use</li>
                <li>Expectations for your internship</li>
              </ul>
              <p className="mb-2">
                Please review everything carefully so you're prepared to jump into your tasks in the next phase.
              </p>
              <div className="text-sm mt-6 pt-2 border-t border-muted">
                <p>Best regards,</p>
                <p>Priya Patel</p>
                <p className="text-muted-foreground">Team Lead | WindNova</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Company Mission */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Company Mission & Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">
                {getCompanyMission(session.industry)}
              </p>
            </CardContent>
          </Card>
          
          {/* Team Introduction */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Meet Your Team
              </CardTitle>
              <CardDescription>
                These team members will guide you through your virtual internship experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {getTeamMembers().map((member, index) => (
                  <div key={index} className="flex flex-col p-4 border rounded-lg">
                    <div className="w-12 h-12 mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">{member.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                    <p className="text-sm italic">"{cleanMarkdownFormatting(member.quote)}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Tools & Tech */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Tools & Technologies
              </CardTitle>
              <CardDescription>
                You'll be using these tools during your virtual internship.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getToolsAndTech(session.job_title).map((tool, index) => (
                  <div key={index} className="bg-muted/30 p-3 rounded-md text-center">
                    {tool}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Expectations */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Internship Expectations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center text-xs">1</div>
                  <div>
                    <p className="font-medium">Respond to tasks on time</p>
                    <p className="text-sm text-muted-foreground">Complete assigned tasks within the virtual deadlines provided.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center text-xs">2</div>
                  <div>
                    <p className="font-medium">Ask for help when needed</p>
                    <p className="text-sm text-muted-foreground">Don't hesitate to seek guidance if you're stuck on a task.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center text-xs">3</div>
                  <div>
                    <p className="font-medium">Take initiative</p>
                    <p className="text-sm text-muted-foreground">Explore creative solutions and share your unique perspective, even in a simulated environment.</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center text-xs">4</div>
                  <div>
                    <p className="font-medium">Reflect on feedback</p>
                    <p className="text-sm text-muted-foreground">Use feedback from previous phases to improve your performance going forward.</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Ready to Begin Button */}
          <div className="flex justify-center pt-4">
            <Button 
              size="lg"
              disabled={processingAction}
              onClick={handleBeginInternship}
              className="px-8 py-6 text-lg"
            >
              {processingAction ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> 
                  Processing...
                </>
              ) : "I'm Ready to Begin"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipPhase2;
