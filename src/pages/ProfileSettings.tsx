
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { NewsTopicsDialog } from "@/components/profile/NewsTopicsDialog";
import { Newspaper, FileText, Lock } from "lucide-react";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { LegalLink } from "@/components/legal/LegalLink";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [showTopicsDialog, setShowTopicsDialog] = useState(false);
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
    <div className="container max-w-2xl mx-auto space-y-4 mb-16">
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

      <Card>
        <CardHeader>
          <CardTitle>News Preferences</CardTitle>
          <CardDescription>Customize your news feed by selecting topics of interest</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the topics you want to see in your news feed to stay updated on relevant content.
          </p>
          <Button 
            variant="outline"
            onClick={() => setShowTopicsDialog(true)}
            className="flex items-center gap-2"
          >
            <Newspaper className="h-4 w-4" />
            Manage News Topics
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legal</CardTitle>
          <CardDescription>Review our policies and terms</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Review our privacy policy and terms of use to understand how we handle your data and the conditions of using EduPortal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.dispatchEvent(new CustomEvent('open-privacy-policy'))}
            >
              <FileText className="h-4 w-4" />
              <LegalLink type="privacy" className="p-0" />
            </Button>
            
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => document.dispatchEvent(new CustomEvent('open-terms-of-use'))}
            >
              <FileText className="h-4 w-4" />
              <LegalLink type="terms" className="p-0" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Manage your password and account security</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Update your password to maintain the security of your account.
          </p>
          <Button 
            variant="outline"
            onClick={() => navigate("/update-password")}
            className="flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
        </CardContent>
      </Card>

      <NewsTopicsDialog
        open={showTopicsDialog}
        onClose={() => setShowTopicsDialog(false)}
      />
    </div>
  );
};

export default ProfileSettings;
