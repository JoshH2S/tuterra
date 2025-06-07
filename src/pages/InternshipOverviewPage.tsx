import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { InternshipService, InternshipSession } from "@/services/internshipService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-states";
import { 
  Briefcase, 
  PlusCircle, 
  Trash2, 
  Play, 
  Calendar, 
  Building, 
  BarChart,
  Award,
  Clock,
  Users,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface InternshipStats {
  totalTasks: number;
  completedTasks: number;
  messageCount: number;
  progressPercent: number;
}

interface InternshipWithStats extends InternshipSession {
  stats?: InternshipStats;
}

export default function InternshipOverviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [internships, setInternships] = useState<InternshipWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchInternships();
    }
  }, [user]);

  const fetchInternships = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const sessions = await InternshipService.getUserInternships(user.id);
      
      // Fetch stats for each internship
      const sessionsWithStats = await Promise.all(
        sessions.map(async (session) => {
          try {
            const stats = await InternshipService.getInternshipStats(session.id);
            return { ...session, stats };
          } catch (error) {
            console.error(`Failed to fetch stats for session ${session.id}:`, error);
            return session;
          }
        })
      );

      setInternships(sessionsWithStats);
    } catch (error) {
      console.error("Error fetching internships:", error);
      toast({
        title: "Error",
        description: "Failed to load internships. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!user) return;

    try {
      setDeletingId(sessionId);
      await InternshipService.deleteInternshipSession(sessionId, user.id);
      
      // Remove from local state
      setInternships(prev => prev.filter(session => session.id !== sessionId));
      
      toast({
        title: "Success",
        description: "Internship session deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting internship:", error);
      toast({
        title: "Error",
        description: "Failed to delete internship session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleContinue = (sessionId: string) => {
    navigate(`/dashboard/virtual-internship?sessionId=${sessionId}`);
  };

  const handleCreateNew = () => {
    navigate("/dashboard/virtual-internship/new");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (internships.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Virtual Internships</h1>
          <p className="text-muted-foreground mb-8">
            Manage your virtual internship experiences
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-lg bg-muted/20">
          <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Virtual Internships Found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get hands-on experience by creating a virtual internship tailored to your career goals
          </p>
          <Button onClick={handleCreateNew} className="gap-2">
            <PlusCircle className="h-5 w-5" />
            Create Your First Internship
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Virtual Internships</h1>
          <p className="text-muted-foreground">
            Manage your virtual internship experiences
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <PlusCircle className="h-5 w-5" />
          Create New Internship
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((internship) => (
          <Card key={internship.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    {internship.job_title}
                  </CardTitle>
                  <CardDescription>
                    {internship.industry} Industry
                  </CardDescription>
                </div>
                <Badge variant={internship.is_completed ? "default" : "secondary"}>
                  {internship.is_completed ? "Completed" : "Active"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Started {format(new Date(internship.created_at), 'MMM d, yyyy')}
                </div>

                {internship.stats && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart className="h-4 w-4 text-blue-500" />
                      <span>{internship.stats.completedTasks} / {internship.stats.totalTasks} tasks completed</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="h-4 w-4 text-green-500" />
                      <span>{internship.stats.messageCount} messages</span>
                    </div>

                    {internship.stats.totalTasks > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{internship.stats.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${internship.stats.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {internship.is_completed && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Award className="h-4 w-4" />
                    <span>Internship completed!</span>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="gap-2">
              <Button 
                onClick={() => handleContinue(internship.id)}
                className="flex-1 gap-2"
                variant={internship.is_completed ? "outline" : "default"}
              >
                {internship.is_completed ? (
                  <>
                    <Award className="h-4 w-4" />
                    View Certificate
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Continue
                  </>
                )}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={deletingId === internship.id}
                  >
                    {deletingId === internship.id ? (
                      <LoadingSpinner />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Internship</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this internship session? This action cannot be undone.
                      All tasks, submissions, messages, and progress will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDelete(internship.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 