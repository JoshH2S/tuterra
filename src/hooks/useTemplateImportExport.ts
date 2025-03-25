
import { supabase } from "@/integrations/supabase/client";
import { CourseTemplate } from "@/types/media";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const useTemplateImportExport = (onImportSuccess?: () => void) => {
  const { user } = useAuth();

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
      
      const { error } = await supabase
        .from('course_templates')
        .insert({
          title: `${template.title} (Imported)`,
          content: template.content,
          description: template.description,
          user_id: user.id,
          metadata: template.metadata,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template imported successfully",
      });

      onImportSuccess?.();
    } catch (error) {
      console.error('Error importing template:', error);
      toast({
        title: "Error",
        description: "Failed to import template. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  return {
    exportTemplate,
    importTemplate,
  };
};
