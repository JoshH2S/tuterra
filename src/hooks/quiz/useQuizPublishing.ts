
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useQuizPublishing = (duration: number) => {
  const handlePublish = async () => {
    try {
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

      const { error } = await supabase
        .from('quizzes')
        .update({ 
          published: true,
          duration_minutes: duration 
        })
        .eq('id', latestQuiz.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz published successfully!",
      });
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
