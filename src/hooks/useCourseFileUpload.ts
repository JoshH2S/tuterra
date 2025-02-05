import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { processFileContent } from "@/utils/file-utils";

export const useCourseFileUpload = () => {
  const handleFileUpload = async (file: File, courseId: string) => {
    try {
      console.log('Starting file upload process for:', file.name);
      
      const { content, wasContentTrimmed, originalLength } = await processFileContent(file);
      
      if (!content) {
        throw new Error('File appears to be empty after processing');
      }

      // Validate content before inserting
      const { data: isValid, error: validateError } = await supabase
        .rpc('validate_course_material_content', { content_to_validate: content });

      if (validateError) {
        console.error('Validation error:', validateError);
        throw new Error('Content validation failed: ' + validateError.message);
      }

      if (!isValid) {
        throw new Error('The file contains invalid characters or formatting. Please ensure your file is a valid document.');
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
          title: "File processed with modifications",
          description: `Some special characters were removed for compatibility. Original size: ${originalLength} characters.`,
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
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try a different file or format.",
        variant: "destructive",
      });
      throw error; // Re-throw to propagate to UI
    }
  };

  return { handleFileUpload };
};