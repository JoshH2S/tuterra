
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsOfServiceModalProps {
  open: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal = ({ open, onClose }: TermsOfServiceModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">EduPortal Terms of Use</DialogTitle>
          <DialogDescription>Last Updated: {new Date().toLocaleDateString()}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-180px)] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>These Terms of Use ("Terms") govern your access to and use of EduPortal's services. By using EduPortal, you agree to comply with these Terms.</p>
            
            <h3 className="text-base font-medium text-foreground mt-4">1. Use of the Service</h3>
            <p>EduPortal provides AI-driven educational tools, including quiz generation, skill assessments, and an AI tutor. You must:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Be at least 13 years old or have parental consent if under 18.</li>
              <li>Use the app in compliance with all applicable laws and regulations.</li>
            </ul>
            
            <h3 className="text-base font-medium text-foreground mt-4">2. User Accounts</h3>
            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account.</p>
            
            <h3 className="text-base font-medium text-foreground mt-4">3. Subscription Tiers</h3>
            <p>EduPortal offers free, premium, and enterprise subscription tiers. Premium features may include advanced AI functionalities, increased usage limits, and customization options.</p>
            
            <h3 className="text-base font-medium text-foreground mt-4">4. Acceptable Use</h3>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Misuse the app by attempting to access unauthorized features or data.</li>
              <li>Distribute harmful or illegal content.</li>
              <li>Violate the intellectual property rights of EduPortal or others.</li>
            </ul>
            
            <h3 className="text-base font-medium text-foreground mt-4">5. Limitation of Liability</h3>
            <p>EduPortal is provided on an "as-is" basis. We do not guarantee the accuracy or reliability of AI-generated content. You use EduPortal at your own risk.</p>
            
            <h3 className="text-base font-medium text-foreground mt-4">6. Termination</h3>
            <p>We may suspend or terminate your account if you violate these Terms or if we suspect any misuse of our platform.</p>
            
            <h3 className="text-base font-medium text-foreground mt-4">7. Governing Law</h3>
            <p>These Terms are governed by applicable laws. Any disputes will be resolved in accordance with local laws.</p>
            
            <h3 className="text-base font-medium text-foreground mt-4">8. Contact Us</h3>
            <p>For questions regarding these Terms, please contact us at support@eduportal.com.</p>
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
