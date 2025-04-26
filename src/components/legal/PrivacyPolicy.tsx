
import { ScrollArea } from "@/components/ui/scroll-area";

export const PrivacyPolicy = () => {
  return (
    <ScrollArea className="h-[70vh] md:h-[60vh]">
      <div className="prose dark:prose-invert max-w-none p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">Tuterra Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-4">Last Updated: June 15, 2024</p>
        
        <p>
          Tuterra ("we," "our," "us") is committed to protecting the privacy of our users 
          ("you," "your"). This Privacy Policy explains how we collect, use, disclose, 
          and safeguard your information when you use our application, Tuterra.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">1. Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Personal Information:</strong> Name, email address, and profile 
            information when you create an account.
          </li>
          <li>
            <strong>Usage Data:</strong> Automatically collected information, including IP 
            address, device type, browser type, and usage statistics.
          </li>
          <li>
            <strong>User-Generated Content:</strong> Information you provide through quizzes, 
            assessments, and interactions with the AI tutor.
          </li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">2. How We Use Your Information</h2>
        <p>We may use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, maintain, and improve Tuterra's services.</li>
          <li>Personalize your experience, including AI-driven learning recommendations.</li>
          <li>Communicate with you about updates, offers, and support.</li>
          <li>Analyze usage and improve our app's functionality.</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">3. Disclosure of Your Information</h2>
        <p>We do not share your personal information with third parties except:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>With your consent.</li>
          <li>To comply with legal obligations.</li>
          <li>With service providers who assist in operating our app (e.g., cloud storage, analytics).</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h2>
        <p>
          We use industry-standard measures to protect your information. However, no method 
          of transmission over the internet is entirely secure.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">5. Your Rights</h2>
        <p>
          You may update your account information or delete your account through the app's 
          settings. You can also contact us for data-related requests.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">6. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. We will notify you of any significant 
          changes by posting the new policy on our app.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">7. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at 
          [support@tuterra.ai].
        </p>
      </div>
    </ScrollArea>
  );
};
