
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useQuizPublishing = () => {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async (quizId: string, duration: number = 30, title?: string) => {
    if (!quizId) {
      toast({
        title: "Error",
        description: "No quiz ID provided for publishing",
        variant: "destructive",
      });
      return false;
    }

    setIsPublishing(true);
    try {
      // Show loading toast
      toast({
        title: "Publishing quiz",
        description: "Your quiz is being published...",
      });

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
        .eq('id', quizId);

      if (error) throw error;

      // Show success toast
      toast({
        title: "Success",
        description: "Quiz published successfully! Users can now take this quiz.",
      });

      // Navigate to quizzes page after publishing and force a refresh
      navigate('/quizzes', { replace: true });
      return true;
    } catch (error) {
      console.error('Error publishing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to publish quiz. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPublishing(false);
    }
  };

  return { handlePublish, isPublishing };
};
