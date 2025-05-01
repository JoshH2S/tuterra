import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { NewsTopicsDialog } from "@/components/profile/NewsTopicsDialog";
import { ProfileCompletion } from "@/components/profile/ProfileCompletion";
import { NotificationPreferences } from "@/components/profile/NotificationPreferences";
import { 
  ArrowLeft,
  Bell, 
  Lock, 
  Newspaper, 
  User,
  CreditCard
} from "lucide-react";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { SubscriptionManager } from "@/components/subscription/SubscriptionManager";

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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center mb-6 space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full md:w-auto mb-6 grid grid-cols-5 h-auto bg-transparent space-x-2 p-0">
            <TabsTrigger 
              value="profile" 
              className="flex flex-col md:flex-row items-center space-x-0 md:space-x-2 rounded-xl data-[state=active]:bg-background"
            >
              <User className="h-4 w-4 mb-1 md:mb-0" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="news" 
              className="flex flex-col md:flex-row items-center space-x-0 md:space-x-2 rounded-xl data-[state=active]:bg-background"
            >
              <Newspaper className="h-4 w-4 mb-1 md:mb-0" />
              <span>News</span>
            </TabsTrigger>
            <TabsTrigger 
              value="subscription" 
              className="flex flex-col md:flex-row items-center space-x-0 md:space-x-2 rounded-xl data-[state=active]:bg-background"
            >
              <CreditCard className="h-4 w-4 mb-1 md:mb-0" />
              <span>Billing</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex flex-col md:flex-row items-center space-x-0 md:space-x-2 rounded-xl data-[state=active]:bg-background"
            >
              <Lock className="h-4 w-4 mb-1 md:mb-0" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex flex-col md:flex-row items-center space-x-0 md:space-x-2 rounded-xl data-[state=active]:bg-background"
            >
              <Bell className="h-4 w-4 mb-1 md:mb-0" />
              <span>Notifications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="profile"
            className="space-y-6 mt-0"
          >
            <Card className="border-0 shadow-sm bg-gradient-to-b from-background to-muted/20">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details and school information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileAvatar
                  firstName={formData.firstName}
                  lastName={formData.lastName}
                  avatarUrl={formData.avatarUrl}
                  uploadingAvatar={uploadingAvatar}
                  onAvatarUpload={handleAvatarUpload}
                />
                
                <div className="mb-6">
                  <ProfileCompletion profile={formData} />
                </div>
                
                <ProfileForm
                  formData={formData}
                  loading={loading}
                  onFormDataChange={handleFormDataChange}
                  onSubmit={updateProfile}
                  onCancel={() => navigate(-1)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent 
            value="news"
            className="space-y-6 mt-0"
          >
            <Card className="border-0 shadow-sm bg-gradient-to-b from-background to-muted/20">
              <CardHeader>
                <CardTitle>News Preferences</CardTitle>
                <CardDescription>
                  Customize your news feed by selecting topics of interest
                </CardDescription>
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
          </TabsContent>

          <TabsContent
            value="subscription"
            className="space-y-6 mt-0"
          >
            <SubscriptionManager />
            
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Change Plan</CardTitle>
                <CardDescription>
                  Upgrade or downgrade your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Visit our pricing page to view available plans and upgrade options.
                </p>
                <Button 
                  onClick={() => navigate("/pricing")}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  View Plans
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent 
            value="security"
            className="space-y-6 mt-0"
          >
            <Card className="border-0 shadow-sm bg-gradient-to-b from-background to-muted/20">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Password Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Keep your account secure by updating your password regularly. For security reasons, you'll need to enter your current password.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/update-password")}
                    className="flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold mb-2">Account Activity</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your account activity and set up additional security measures.
                  </p>
                  <div className="mt-4 bg-muted/30 p-4 rounded-md">
                    <p className="text-sm font-medium">Last password change</p>
                    <p className="text-xs text-muted-foreground">Not available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent 
            value="notifications"
            className="space-y-6 mt-0"
          >
            <NotificationPreferences />
          </TabsContent>
        </Tabs>
      </motion.div>

      <NewsTopicsDialog
        open={showTopicsDialog}
        onClose={() => setShowTopicsDialog(false)}
      />
    </div>
  );
};

export default ProfileSettings;
