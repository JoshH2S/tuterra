import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useCourseFileUpload = () => {
  const handleFileUpload = async (file: File, courseId: string) => {
    try {
      console.log('Starting file upload process for:', file.name);
      
      // Create a unique file path using the course ID and original filename
      const fileExt = file.name.split('.').pop();
      const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
      const uniqueFilePath = `${courseId}/${crypto.randomUUID()}-${sanitizedFileName}`;
      
      // Upload file to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('course_materials')
        .upload(uniqueFilePath, file);

      if (storageError) {
        console.error('Storage error:', storageError);
        throw new Error('Failed to upload file to storage');
      }

      // Insert metadata into course_materials table
      const { error: dbError } = await supabase
        .from('course_materials')
        .insert([
          {
            course_id: courseId,
            file_name: file.name,
            file_type: file.type,
            storage_path: uniqueFilePath,
            size: file.size
          }
        ]);

      if (dbError) {
        console.error('Database error:', dbError);
        // If database insert fails, clean up the uploaded file
        await supabase.storage
          .from('course_materials')
          .remove([uniqueFilePath]);
        throw new Error('Failed to save file metadata');
      }

      toast({
        title: "Success",
        description: `${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading material:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { handleFileUpload };
};