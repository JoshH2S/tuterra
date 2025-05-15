
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Download, Share2, ArrowLeft, Award, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

type InternshipSession = {
  id: string;
  job_title: string;
  industry: string;
  user_id: string;
  created_at: string;
  current_phase: number;
};

type CompletedTask = {
  id: string;
  title: string;
  status: 'feedback_given';
  strengths?: string[];
  improvements?: string[];
};

const InternshipCompletion = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<InternshipSession | null>(null);
  const [tasks, setTasks] = useState<CompletedTask[]>([]);
  const [userName, setUserName] = useState('');
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCompletionData = async () => {
      try {
        setLoading(true);
        
        // Get user details
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // Get user's name from profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        if (profileData) {
          setUserName(`${profileData.first_name} ${profileData.last_name}`.trim());
        }
        
        // Get session details
        const { data: sessionData, error: sessionError } = await supabase
          .from('internship_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;
        setSession(sessionData);

        // Fetch completed tasks with feedback
        const { data: tasksData, error: tasksError } = await supabase
          .from('internship_tasks')
          .select(`
            id,
            title,
            description,
            status
          `)
          .eq('session_id', sessionId)
          .eq('status', 'feedback_given')
          .order('task_order', { ascending: true });

        if (tasksError) throw tasksError;
        
        // For each task, get the feedback (strengths and improvements)
        const tasksWithFeedback = await Promise.all(tasksData.map(async (task) => {
          // Get the deliverable for this task
          const { data: deliverableData } = await supabase
            .from('internship_deliverables')
            .select('id')
            .eq('task_id', task.id)
            .single();
          
          if (deliverableData) {
            // Get the feedback for this deliverable
            const { data: feedbackData } = await supabase
              .from('internship_feedback')
              .select('strengths, improvements')
              .eq('deliverable_id', deliverableData.id)
              .single();
            
            return {
              ...task,
              strengths: feedbackData?.strengths || [],
              improvements: feedbackData?.improvements || [],
            };
          }
          
          return task;
        }));
        
        setTasks(tasksWithFeedback);
      } catch (error) {
        console.error('Error fetching completion data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchCompletionData();
    }
  }, [sessionId]);

  const generatePDF = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${session?.job_title.replace(/\s/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };
  
  const shareToLinkedIn = () => {
    // LinkedIn sharing URL
    const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(`${session?.job_title || 'Virtual Internship'} - ${session?.industry || 'Industry'} Experience`)}&organizationName=YourApp&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth() + 1}&certUrl=${window.location.href}`;
    
    window.open(linkedinUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <Award className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
        <h1 className="text-4xl font-bold mb-4">Congratulations!</h1>
        <p className="text-xl text-gray-600">
          You've successfully completed your {session?.job_title} virtual internship in the {session?.industry} industry!
        </p>
      </motion.div>

      <div className="mb-12">
        <div 
          ref={certificateRef} 
          className="relative border-8 border-blue-800 rounded-lg p-10 bg-gradient-to-br from-blue-50 to-white text-center max-w-4xl mx-auto"
        >
          <div className="absolute inset-0 border-4 border-blue-600 rounded m-2"></div>
          <div className="flex flex-col items-center">
            <div className="text-blue-800 uppercase tracking-wider mb-2">Certificate of Completion</div>
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Virtual Internship Experience</h2>
            
            <p className="text-lg mb-4">This certifies that</p>
            <h3 className="text-2xl font-bold mb-4 text-blue-900">{userName || 'Student Name'}</h3>
            <p className="text-lg mb-6">has successfully completed</p>
            <h4 className="text-xl font-semibold mb-2 text-blue-800">{session?.job_title}</h4>
            <p className="text-lg mb-6">in the {session?.industry} industry</p>
            
            <div className="flex items-center mb-4">
              <Award className="h-8 w-8 text-yellow-500 mr-2" />
              <span className="text-blue-900">{tasks.length} Tasks Completed</span>
            </div>
            
            <div className="text-sm text-gray-600 mt-4">
              Issued on {format(new Date(), 'MMMM dd, yyyy')}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center mb-12">
        <Button 
          onClick={generatePDF} 
          className="flex items-center gap-2"
          size="lg"
        >
          <Download className="h-5 w-5" />
          Download Certificate
        </Button>
        
        <Button 
          onClick={shareToLinkedIn} 
          variant="outline" 
          className="flex items-center gap-2"
          size="lg"
        >
          <Share2 className="h-5 w-5" />
          Add to LinkedIn
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Internship Summary
            </CardTitle>
            <CardDescription>
              Your achievements during this internship
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Position</h4>
                <p>{session?.job_title}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Industry</h4>
                <p>{session?.industry}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Completion Date</h4>
                <p>{format(new Date(), 'MMMM dd, yyyy')}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tasks Completed</h4>
                <p>{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Skills Demonstrated</CardTitle>
            <CardDescription>
              Based on your task performance and feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Key Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(tasks.flatMap(task => task.strengths || []))).slice(0, 5).map((strength, i) => (
                  <Badge key={i} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Growth Areas</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(tasks.flatMap(task => task.improvements || []))).slice(0, 3).map((improvement, i) => (
                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-100">
                    {improvement}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              These skills can be highlighted on your resume and during interviews.
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <div className="text-center">
        <Link to="/dashboard">
          <Button variant="outline" size="lg">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default InternshipCompletion;
