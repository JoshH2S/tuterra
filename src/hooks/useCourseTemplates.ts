
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CourseTemplate } from "@/types/media";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const useCourseTemplates = () => {
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
      const { data, error } = await supabase
        .from('course_templates')
        .insert({
          title,
          content,
          teacher_id: user.id,
        })
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

  const exportTemplate = async (template: CourseTemplate) => {
    try {
      const jsonContent = JSON.stringify(template, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.title.toLowerCase().replace(/\s+/g, '-')}-template.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting template:', error);
      toast({
        title: "Error",
        description: "Failed to export template",
        variant: "destructive",
      });
    }
  };

  const importTemplate = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to import templates",
        variant: "destructive",
      });
      return;
    }

    try {
      const content = await file.text();
      const template = JSON.parse(content);
      
      // Create new template with imported content
      const { error } = await supabase
        .from('course_templates')
        .insert({
          title: `${template.title} (Imported)`,
          content: template.content,
          description: template.description,
          teacher_id: user.id,
          metadata: template.metadata,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template imported successfully",
      });

      fetchTemplates();
    } catch (error) {
      console.error('Error importing template:', error);
      toast({
        title: "Error",
        description: "Failed to import template. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    createTemplate,
    deleteTemplate,
    exportTemplate,
    importTemplate,
  };
};
