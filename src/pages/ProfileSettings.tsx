
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useProfileManagement } from "@/hooks/useProfileManagement";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const {
    loading,
    uploadingAvatar,
    formData,
    setFormData,
    fetchProfile,
    handleAvatarUpload,
    updateProfile,
  } = useProfileManagement();

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFormDataChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileAvatar
            firstName={formData.firstName}
            lastName={formData.lastName}
            avatarUrl={formData.avatarUrl}
            uploadingAvatar={uploadingAvatar}
            onAvatarUpload={handleAvatarUpload}
          />
          <ProfileForm
            formData={formData}
            loading={loading}
            onFormDataChange={handleFormDataChange}
            onSubmit={updateProfile}
            onCancel={() => navigate(-1)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
