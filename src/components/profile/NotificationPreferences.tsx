
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
    newsUpdates: false,
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
    <Card className="border-0 shadow-sm bg-gradient-to-b from-background to-muted/20">
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
            <div className="space-y-1">
              <Label htmlFor="emailNotifications" className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive important updates via email</p>
            </div>
            <Switch 
              id="emailNotifications" 
              checked={preferences.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="quizReminders" className="text-base">Quiz Reminders</Label>
              <p className="text-sm text-muted-foreground">Get reminded about upcoming quizzes</p>
            </div>
            <Switch 
              id="quizReminders" 
              checked={preferences.quizReminders}
              onCheckedChange={() => handleToggle('quizReminders')}
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="studySessionAlerts" className="text-base">Study Session Alerts</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for scheduled study sessions</p>
            </div>
            <Switch 
              id="studySessionAlerts" 
              checked={preferences.studySessionAlerts}
              onCheckedChange={() => handleToggle('studySessionAlerts')}
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="newsUpdates" className="text-base">News Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified about new articles in your topics</p>
            </div>
            <Switch 
              id="newsUpdates" 
              checked={preferences.newsUpdates}
              onCheckedChange={() => handleToggle('newsUpdates')}
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="courseUpdates" className="text-base">Course Updates</Label>
              <p className="text-sm text-muted-foreground">Receive notifications about course changes</p>
            </div>
            <Switch 
              id="courseUpdates" 
              checked={preferences.courseUpdates}
              onCheckedChange={() => handleToggle('courseUpdates')}
            />
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="securityAlerts" className="text-base">Security Alerts</Label>
              <p className="text-sm text-muted-foreground">Get important security-related notifications</p>
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
