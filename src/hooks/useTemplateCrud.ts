
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CourseTemplate } from "@/types/media";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const useTemplateCrud = () => {
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('course_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load course templates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (title: string, content: Record<string, any>) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create templates",
        variant: "destructive",
      });
      return null;
    }

    try {
      const templateData = {
        title,
        content,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('course_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template created successfully",
      });

      await fetchTemplates();
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('course_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  return {
    templates,
    isLoading,
    createTemplate,
    deleteTemplate,
    fetchTemplates,
  };
};
