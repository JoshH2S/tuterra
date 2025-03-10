
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyModalProps {
  open: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal = ({ open, onClose }: PrivacyPolicyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>EduPortal Privacy Policy</DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-3">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="text-lg font-medium mb-2">1. Information We Collect</h3>
              <p className="mb-2">At EduPortal, we collect several types of information to provide and improve our services:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Account Information:</strong> When you register, we collect your name, email address, and other information you provide during signup.</li>
                <li><strong>Profile Information:</strong> Information you add to your profile such as education level, interests, and preferences.</li>
                <li><strong>Usage Data:</strong> We collect data about how you use EduPortal, including courses you access, quiz results, interaction with AI tutors, and content you create.</li>
                <li><strong>Learning Progress:</strong> Your performance data, quiz results, and personalized feedback.</li>
                <li><strong>Device Information:</strong> Information about the device you use to access EduPortal, including device type, operating system, and unique device identifiers.</li>
                <li><strong>Communications:</strong> We may retain records of your communications with us for support or feedback purposes.</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">2. How We Use Your Information</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Provide and Improve EduPortal:</strong> We use your information to operate EduPortal, personalize your learning experience, and improve our platform.</li>
                <li><strong>Personalize Learning:</strong> We analyze your progress and preferences to tailor educational content to your needs.</li>
                <li><strong>AI-Powered Features:</strong> Information you provide helps our AI tutors and quiz generators create more relevant content.</li>
                <li><strong>Communicate with You:</strong> We use your information to send you important updates, notifications, and educational resources.</li>
                <li><strong>Research and Analytics:</strong> We analyze usage data to understand how EduPortal is used and to develop new features.</li>
                <li><strong>Security:</strong> We use your information to protect EduPortal and our users from fraud and unauthorized access.</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">3. How We Share Your Information</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Service Providers:</strong> We share your information with third-party service providers who help us operate EduPortal (e.g., hosting providers, email delivery services).</li>
                <li><strong>AI Processing:</strong> We use AI services to process content for educational purposes.</li>
                <li><strong>Legal Compliance:</strong> We may disclose your information if required by law or legal process.</li>
                <li><strong>Aggregated Data:</strong> We may share aggregated, anonymized data with third parties for research or educational purposes.</li>
              </ul>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">4. Your Rights</h3>
              <p>Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access, correct, or delete your personal information</li>
                <li>Object to certain processing of your information</li>
                <li>Data portability (receiving a copy of your data)</li>
                <li>Opt out of receiving marketing communications</li>
              </ul>
              <p className="mt-2">To exercise these rights, please contact us using the information in the "Contact Us" section.</p>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">5. Data Security</h3>
              <p>We take reasonable measures to protect your information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.</p>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">6. Children's Privacy</h3>
              <p>EduPortal is designed for users of all ages, including students. We comply with applicable laws regarding children's privacy. If you're under the age required to manage your own account, you must have parental consent.</p>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">7. Changes to this Privacy Policy</h3>
              <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
            </section>
            
            <section>
              <h3 className="text-lg font-medium mb-2">8. Contact Us</h3>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <p className="mt-1">Email: privacy@eduportal.example.com</p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
