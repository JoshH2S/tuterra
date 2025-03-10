
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { NewsTopicsDialog } from "@/components/profile/NewsTopicsDialog";
import { Newspaper, Shield, FileText } from "lucide-react";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { PrivacyPolicyLink } from "@/components/legal/PrivacyPolicyLink";
import { TermsOfServiceLink } from "@/components/legal/TermsOfServiceLink";
import { Footer } from "@/components/layout/Footer";

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
    <div className="container max-w-2xl mx-auto space-y-4 pb-20">
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
          >
            Change Password
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Legal</CardTitle>
          <CardDescription>View our legal policies and terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <PrivacyPolicyLink />
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <TermsOfServiceLink />
            </div>
          </div>
        </CardContent>
      </Card>

      <NewsTopicsDialog
        open={showTopicsDialog}
        onClose={() => setShowTopicsDialog(false)}
      />
      
      <Footer />
    </div>
  );
};

export default ProfileSettings;
