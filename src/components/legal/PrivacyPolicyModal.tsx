
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal = ({ open, onClose }: PrivacyPolicyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">EduPortal Privacy Policy</DialogTitle>
          <DialogDescription>Last Updated: {new Date().toLocaleDateString()}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-180px)] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>EduPortal ("we," "our," "us") is committed to protecting the privacy of our users ("you," "your"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application, EduPortal.</p>
            
            <h3 className="text-base font-medium text-foreground mt-4">1. Information We Collect</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Personal Information:</strong> Name, email address, and profile information when you create an account.</li>
              <li><strong>Usage Data:</strong> Automatically collected information, including IP address, device type, browser type, and usage statistics.</li>
              <li><strong>User-Generated Content:</strong> Information you provide through quizzes, assessments, and interactions with the AI tutor.</li>
            </ul>
            
            <h3 className="text-base font-medium text-foreground mt-4">2. How We Use Your Information</h3>
            <p>We may use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide, maintain, and improve EduPortal's services.</li>
              <li>Personalize your experience, including AI-driven learning recommendations.</li>
              <li>Communicate with you about updates, offers, and support.</li>
              <li>Analyze usage and improve our app's functionality.</li>
            </ul>
            
            <h3 className="text-base font-medium text-foreground mt-4">3. Disclosure of Your Information</h3>
            <p>We do not share your personal information with third parties except:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>With your consent.</li>
              <li>To comply with legal obligations.</li>
              <li>With service providers who assist in operating our app (e.g., cloud storage, analytics).</li>
            </ul>
            
            <h3 className="text-base font-medium text-foreground mt-4">4. Data Security</h3>
            <p>We use industry-standard measures to protect your information. However, no method of transmission over the internet is entirely secure.</p>
            
            <h3 className="text-base font-medium text-foreground mt-4">5. Your Rights</h3>
            <p>You may update your account information or delete your account through the app's settings. You can also contact us for data-related requests.</p>
            
            <h3 className="text-base font-medium text-foreground mt-4">6. Changes to This Policy</h3>
            <p>We may update this policy from time to time. We will notify you of any significant changes by posting the new policy on our app.</p>
            
            <h3 className="text-base font-medium text-foreground mt-4">7. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at support@eduportal.com.</p>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
