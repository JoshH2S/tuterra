
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MediaItem } from "@/types/media";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const useMediaLibrary = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchMediaItems = async () => {
    try {
      const { data, error } = await supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Explicitly type the data as MediaItem[]
      const typedData = (data || []) as MediaItem[];
      setMediaItems(typedData);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: "Error",
        description: "Failed to load media items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadMedia = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to upload media",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media_library')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('media_library')
        .insert({
          title: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          teacher_id: user.id,
          metadata: null
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });

      fetchMediaItems();
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: "Error",
        description: "Failed to upload media",
        variant: "destructive",
      });
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Media deleted successfully",
      });

      setMediaItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMediaItems();
  }, []);

  return {
    mediaItems,
    isLoading,
    uploadMedia,
    deleteMedia,
  };
};
