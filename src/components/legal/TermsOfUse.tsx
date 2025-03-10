
import { ScrollArea } from "@/components/ui/scroll-area";

export const TermsOfUse = () => {
  return (
    <ScrollArea className="h-[70vh] md:h-[60vh]">
      <div className="prose dark:prose-invert max-w-none p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">EduPortal Terms of Use</h1>
        <p className="text-sm text-muted-foreground mb-4">Last Updated: June 15, 2024</p>
        
        <p>
          These Terms of Use ("Terms") govern your access to and use of EduPortal's services. 
          By using EduPortal, you agree to comply with these Terms.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Use of the Service</h2>
        <p>
          EduPortal provides AI-driven educational tools, including quiz generation, skill 
          assessments, and an AI tutor. You must:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Be at least 13 years old or have parental consent if under 18.</li>
          <li>Use the app in compliance with all applicable laws and regulations.</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">2. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account and password. 
          You agree to notify us immediately of any unauthorized use of your account.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Subscription Tiers</h2>
        <p>
          EduPortal offers free, premium, and enterprise subscription tiers. Premium features 
          may include advanced AI functionalities, increased usage limits, and customization options.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Misuse the app by attempting to access unauthorized features or data.</li>
          <li>Distribute harmful or illegal content.</li>
          <li>Violate the intellectual property rights of EduPortal or others.</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">5. Limitation of Liability</h2>
        <p>
          EduPortal is provided on an "as-is" basis. We do not guarantee the accuracy or 
          reliability of AI-generated content. You use EduPortal at your own risk.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">6. Termination</h2>
        <p>
          We may suspend or terminate your account if you violate these Terms or if we 
          suspect any misuse of our platform.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">7. Governing Law</h2>
        <p>
          These Terms are governed by the laws of [Your Jurisdiction]. Any disputes will be 
          resolved in accordance with local laws.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">8. Contact Us</h2>
        <p>
          For questions regarding these Terms, please contact us at [support@eduportal.com].
        </p>
      </div>
    </ScrollArea>
  );
};
