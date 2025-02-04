import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { processFileContent } from "@/utils/file-utils";

export const useCourseFileUpload = () => {
  const handleFileUpload = async (file: File, courseId: string) => {
    try {
      const { content, wasContentTrimmed, originalLength } = await processFileContent(file);
      
      if (!content || content.trim().length === 0) {
        throw new Error('File content is empty after processing');
      }

      // Validate content before inserting
      const { data: isValid, error: validateError } = await supabase
        .rpc('validate_course_material_content', { content_to_validate: content });

      if (validateError) {
        throw new Error('Content validation failed: ' + validateError.message);
      }

      if (!isValid) {
        throw new Error('Content validation failed: Invalid content format');
      }

      const { error: uploadError } = await supabase
        .from('course_materials')
        .insert([
          {
            course_id: courseId,
            file_name: file.name,
            file_type: file.type,
            content: content
          }
        ]);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload material: ' + uploadError.message);
      }
      
      if (wasContentTrimmed) {
        toast({
          title: "Content modified",
          description: `File content has been sanitized for compatibility. Original length: ${originalLength} characters.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Success",
          description: `${file.name} has been uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload material. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handleFileUpload };
};