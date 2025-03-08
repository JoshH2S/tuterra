
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useQuizPublishing = (duration: number, title?: string) => {
  const navigate = useNavigate();

  const handlePublish = async () => {
    try {
      // Show loading toast
      toast({
        title: "Publishing quiz",
        description: "Your quiz is being published...",
      });

      const { data: latestQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!latestQuiz) {
        toast({
          title: "Error",
          description: "No quiz found to publish",
          variant: "destructive",
        });
        return;
      }

      // Prepare the update data
      const updateData: any = { 
        published: true,
        duration_minutes: duration || 30 // Default to 30 minutes if no duration set
      };
      
      // Add title if provided
      if (title) {
        updateData.title = title;
      }

      const { error } = await supabase
        .from('quizzes')
        .update(updateData)
        .eq('id', latestQuiz.id);

      if (error) throw error;

      // Show success toast
      toast({
        title: "Success",
        description: "Quiz published successfully! Students can now take this quiz.",
      });

      // Optionally navigate to quizzes page after publishing
      setTimeout(() => {
        navigate('/quizzes');
      }, 1500);
    } catch (error) {
      console.error('Error publishing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to publish quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handlePublish };
};
