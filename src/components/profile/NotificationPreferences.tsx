
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    quizReminders: true,
    studySessionAlerts: true,
    courseUpdates: true,
    securityAlerts: true
  });
  
  const [saving, setSaving] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleSave = async () => {
    setSaving(true);
    
    // Simulate saving to database
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved successfully."
    });
    
    setSaving(false);
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-gray-50">
        <CardTitle className="text-base font-semibold text-gray-900">Notification Settings</CardTitle>
        <CardDescription className="text-sm text-gray-400 mt-0.5">
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-6 space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="space-y-4"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications" className="text-sm font-medium text-gray-800">Email Notifications</Label>
              <p className="text-xs text-gray-400">Receive important updates via email</p>
            </div>
            <Switch 
              id="emailNotifications" 
              checked={preferences.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="quizReminders" className="text-sm font-medium text-gray-800">Quiz Reminders</Label>
              <p className="text-xs text-gray-400">Get reminded about upcoming quizzes</p>
            </div>
            <Switch 
              id="quizReminders" 
              checked={preferences.quizReminders}
              onCheckedChange={() => handleToggle('quizReminders')}
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="studySessionAlerts" className="text-sm font-medium text-gray-800">Study Session Alerts</Label>
              <p className="text-xs text-gray-400">Receive alerts for scheduled study sessions</p>
            </div>
            <Switch 
              id="studySessionAlerts" 
              checked={preferences.studySessionAlerts}
              onCheckedChange={() => handleToggle('studySessionAlerts')}
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="courseUpdates" className="text-sm font-medium text-gray-800">Course Updates</Label>
              <p className="text-xs text-gray-400">Receive notifications about course changes</p>
            </div>
            <Switch 
              id="courseUpdates" 
              checked={preferences.courseUpdates}
              onCheckedChange={() => handleToggle('courseUpdates')}
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="securityAlerts" className="text-sm font-medium text-gray-800">Security Alerts</Label>
              <p className="text-xs text-gray-400">Get important security-related notifications</p>
            </div>
            <Switch 
              id="securityAlerts" 
              checked={preferences.securityAlerts}
              onCheckedChange={() => handleToggle('securityAlerts')}
            />
          </motion.div>
        </motion.div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
