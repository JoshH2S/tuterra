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
import { motion } from "framer-motion";

interface InternshipStats {
  totalTasks: number;
  completedTasks: number;
  messageCount: number;
  progressPercent: number;
}

interface InternshipWithStats extends InternshipSession {
  stats?: InternshipStats;
}

const MotionCard = motion(Card);

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
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Background Image - Full Opacity */}
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/characters/pexels-mart-production-7256413-2.jpg')"
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (internships.length === 0) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* Background Image - Full Opacity */}
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/characters/pexels-mart-production-7256413-2.jpg')"
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-white">Virtual Internships</h1>
            <p className="text-white/90 mb-8">
              Manage your virtual internship experiences
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-lg bg-white/95 backdrop-blur-md border-white/20 shadow-xl">
            <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Virtual Internships Found</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get hands-on experience by creating a virtual internship tailored to your career goals
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={handleCreateNew} 
                className="gap-2 rounded-full px-5 py-2 shadow-md bg-gradient-to-br from-primary-100 to-primary-200"
              >
                <PlusCircle className="h-5 w-5" />
                Create Your First Internship
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Image - Full Opacity */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/characters/pexels-mart-production-7256413-2.jpg')"
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Virtual Internships</h1>
            <p className="text-white/90">
              Manage your virtual internship experiences
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleCreateNew} 
              className="gap-2 rounded-full px-5 py-2 shadow-md bg-gradient-to-br from-primary-100 to-primary-200"
            >
              <PlusCircle className="h-5 w-5" />
              Create New Internship
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship, index) => (
            <motion.div
              key={internship.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MotionCard 
                className="flex flex-col shadow-xl bg-white/95 backdrop-blur-md border border-white/20 hover:shadow-2xl hover:bg-white/98"
                whileHover={{ scale: 1.01, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.2 }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge 
                        variant={internship.is_completed ? "default" : "secondary"}
                        className="mb-2"
                      >
                        {internship.is_completed ? "Completed" : "Active"}
                      </Badge>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        {internship.job_title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {internship.industry} Industry
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pt-0">
                  <div className="border-b border-gray-200 dark:border-gray-800 pb-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600/90 dark:text-gray-400/90">
                      <Calendar className="h-4 w-4" />
                      Started {format(new Date(internship.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>

                  {internship.stats && (
                    <div className="space-y-3">
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
                            <span className="text-xs uppercase font-semibold text-gray-500">Progress</span>
                            <span className="text-sm font-medium">{internship.stats.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            {internship.stats.progressPercent > 0 ? (
                              <motion.div 
                                className="bg-gradient-to-r from-primary-300 to-primary-500/80 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${internship.stats.progressPercent}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                style={{
                                  boxShadow: "0 0 5px rgba(var(--primary-500), 0.5)"
                                }}
                              />
                            ) : (
                              <div className="h-2" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {internship.is_completed && (
                    <div className="flex items-center gap-2 text-sm text-green-600 mt-3">
                      <Award className="h-4 w-4" />
                      <span className="font-medium">Internship completed!</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="gap-2 pt-3 border-t border-gray-200 dark:border-gray-800 mt-2">
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => handleContinue(internship.id)}
                      className="w-full gap-2 shadow-sm hover:shadow-md"
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
                  </motion.div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="hover:bg-destructive/10 transition-colors"
                          disabled={deletingId === internship.id}
                        >
                          {deletingId === internship.id ? (
                            <LoadingSpinner />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </motion.div>
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
              </MotionCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 