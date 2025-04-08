import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  school: string;
  avatarUrl: string;
}

export const useProfileManagement = () => {
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    school: "",
    avatarUrl: "",
  });

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, school, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          school: data.school || "",
          avatarUrl: data.avatar_url || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      setUploadingAvatar(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // First update the profiles table
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (profileUpdateError) throw profileUpdateError;

      // Then update the user metadata
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (userUpdateError) throw userUpdateError;

      setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          school: formData.school,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Also update user metadata to keep things in sync
      const { error: userUpdateError } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName
        }
      });

      if (userUpdateError) throw userUpdateError;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    uploadingAvatar,
    formData,
    setFormData,
    fetchProfile,
    handleAvatarUpload,
    updateProfile,
  };
};
