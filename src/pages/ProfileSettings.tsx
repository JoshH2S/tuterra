
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileCompletion } from "@/components/profile/ProfileCompletion";
import { NotificationPreferences } from "@/components/profile/NotificationPreferences";
import {
  ArrowLeft,
  Bell,
  Lock,
  User,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { SubscriptionManager } from "@/components/subscription/SubscriptionManager";

const TABS = [
  { value: "profile",       label: "Profile",       icon: User },
  { value: "billing",       label: "Billing",       icon: CreditCard },
  { value: "security",      label: "Security",      icon: Lock },
  { value: "notifications", label: "Notifications", icon: Bell },
] as const;

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("profile");

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
    <div className="min-h-screen bg-[#f8f7f4]">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-500" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Tab bar */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
            <TabsList className="w-full bg-transparent h-auto p-0 flex rounded-xl overflow-hidden">
              {TABS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="
                    flex-1 flex items-center justify-center gap-2 py-3.5 px-4
                    text-sm font-medium rounded-none
                    text-gray-400 hover:text-gray-700
                    border-b-2 border-transparent
                    data-[state=active]:border-[#C8A84B]
                    data-[state=active]:text-gray-900
                    data-[state=active]:bg-transparent
                    data-[state=active]:shadow-none
                    transition-all duration-150
                  "
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Profile ── */}
          <TabsContent value="profile" className="mt-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-base font-semibold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-400 mt-0.5">Update your personal details and photo</p>
              </div>
              <div className="px-6 py-6 space-y-6">
                <ProfileAvatar
                  firstName={formData.firstName}
                  lastName={formData.lastName}
                  avatarUrl={formData.avatarUrl}
                  uploadingAvatar={uploadingAvatar}
                  onAvatarUpload={handleAvatarUpload}
                />
                <ProfileCompletion profile={formData} />
                <ProfileForm
                  formData={formData}
                  loading={loading}
                  onFormDataChange={handleFormDataChange}
                  onSubmit={updateProfile}
                  onCancel={() => navigate(-1)}
                />
              </div>
            </div>
          </TabsContent>

          {/* ── Billing ── */}
          <TabsContent value="billing" className="mt-0 space-y-4">
            <SubscriptionManager />
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-base font-semibold text-gray-900">Change Plan</h2>
                <p className="text-sm text-gray-400 mt-0.5">View available plans and upgrade options</p>
              </div>
              <div className="px-6 py-5">
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg border border-gray-100 hover:border-[#C8A84B]/40 hover:bg-[#fdf9f0] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#fdf3d6] flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-[#C8A84B]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">View all plans</p>
                      <p className="text-xs text-gray-400">Compare features and pricing</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#C8A84B] transition-colors" />
                </button>
              </div>
            </div>
          </TabsContent>

          {/* ── Security ── */}
          <TabsContent value="security" className="mt-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="text-base font-semibold text-gray-900">Security Settings</h2>
                <p className="text-sm text-gray-400 mt-0.5">Manage your password and account access</p>
              </div>
              <div className="px-6 py-5 space-y-3">
                <button
                  onClick={() => navigate("/update-password")}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg border border-gray-100 hover:border-[#C8A84B]/40 hover:bg-[#fdf9f0] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#f0f4ff] flex items-center justify-center">
                      <Lock className="h-4 w-4 text-[#3b5bdb]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">Change password</p>
                      <p className="text-xs text-gray-400">Update your account password</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#C8A84B] transition-colors" />
                </button>
              </div>
            </div>
          </TabsContent>

          {/* ── Notifications ── */}
          <TabsContent value="notifications" className="mt-0">
            <NotificationPreferences />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default ProfileSettings;
