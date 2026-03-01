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
  MessageCircle,
  Plus
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

  const HeroCard = () => (
    <div className="relative z-10 mb-8 px-4 sm:px-6 pt-6">
      <div
        className="relative rounded-2xl border-2 border-[#C8A84B] shadow-[0_4px_24px_rgba(0,0,0,0.12)] flex flex-col sm:flex-row bg-[#F7F3EC] p-4 gap-4"
        style={{ minHeight: '300px' }}
      >
        <div className="flex flex-col justify-between p-4 sm:w-[36%] shrink-0">
          <div>
            <p className="text-xs font-mono text-[#8a7a5a] mb-4 tracking-wide uppercase">Hands-On Experience</p>
            <div className="flex items-start gap-3 mb-4">
              <Briefcase className="h-8 w-8 text-[#7a6a2a] mt-1 shrink-0" />
              <h1 className="text-3xl md:text-4xl font-medium font-manrope text-[#1a1a1a] leading-tight tracking-tight">Virtual Internships</h1>
            </div>
            <p className="text-sm text-[#5a5040] leading-relaxed">
              Gain real-world experience with AI-guided virtual internships tailored to your career goals.
            </p>
          </div>
          <div className="mt-8">
            <Button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-6 py-5 rounded-full text-black/80 bg-white/30 backdrop-blur-md border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-white/45 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] hover:-translate-y-0.5 transition-all font-semibold"
            >
              <Plus className="h-5 w-5" />
              {internships.length === 0 ? "Create Your First Internship" : "Create New Internship"}
            </Button>
          </div>
        </div>
        <div
          className="flex-1 rounded-xl bg-cover bg-center min-h-[200px] sm:min-h-0"
          style={{ backgroundImage: "url('https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/characters/pexels-mart-production-7256413-2.jpg')" }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen w-full relative">
        <div className="fixed inset-0 w-full h-full bg-white" />
        <HeroCard />
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
      <div className="min-h-screen w-full relative">
        <div className="fixed inset-0 w-full h-full bg-white" />
        <HeroCard />
        <div className="relative z-10 container mx-auto px-4 pb-8 max-w-4xl">
          <div className="flex flex-col items-center justify-center text-center p-6 sm:p-12 border border-dashed rounded-lg bg-white shadow">
            <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">No Virtual Internships Yet</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md">
              Get hands-on experience by creating a virtual internship tailored to your career goals
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      <div className="fixed inset-0 w-full h-full bg-white" />
      <HeroCard />
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pb-8 max-w-6xl">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {internships.map((internship, index) => (
            <motion.div
              key={internship.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MotionCard 
                className="flex flex-col border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:shadow-lg bg-white"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge 
                        variant="outline"
                        className="mb-3 bg-gray-50 text-gray-600 border-gray-200"
                      >
                        {internship.is_completed ? "Completed" : "Active"}
                      </Badge>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2 leading-tight mb-1">
                        <Building className="h-4 w-4 text-gray-500" />
                        {internship.job_title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 mt-2">
                        {internship.industry} Industry
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 pt-0">
                  <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      Started {format(new Date(internship.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>

                  {internship.stats && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <BarChart className="h-3.5 w-3.5 text-gray-400" />
                        <span>{internship.stats.completedTasks} / {internship.stats.totalTasks} tasks completed</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
                        <span>{internship.stats.messageCount} messages</span>
                      </div>

                      {internship.stats.totalTasks > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-[10px] uppercase font-medium text-gray-500">Progress</span>
                            <span className="text-xs font-medium text-gray-700">{internship.stats.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            {internship.stats.progressPercent > 0 ? (
                              <motion.div 
                                className="bg-gray-700 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${internship.stats.progressPercent}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            ) : (
                              <div className="h-1.5" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {internship.is_completed && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600 mt-2 sm:mt-3">
                      <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="font-medium">Internship completed!</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="gap-2 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-800 mt-2">
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={() => handleContinue(internship.id)}
                      className="w-full gap-2 shadow-sm hover:shadow-md text-xs sm:text-sm"
                      variant={internship.is_completed ? "outline" : "default"}
                      size="sm"
                    >
                      {internship.is_completed ? (
                        <>
                          <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          View Certificate
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                          className="hover:bg-destructive/10 transition-colors h-8 w-8 sm:h-9 sm:w-9"
                          disabled={deletingId === internship.id}
                        >
                          {deletingId === internship.id ? (
                            <LoadingSpinner />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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