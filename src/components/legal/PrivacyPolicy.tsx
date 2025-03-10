
import React from "react";

export function PrivacyPolicy() {
  return (
    <div className="legal-document space-y-6">
      <h1 className="text-2xl font-bold">EduPortal Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last Updated: March 15, 2024</p>
      
      <p>
        EduPortal ("we," "our," "us") is committed to protecting the privacy of our users ("you," "your"). 
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application, EduPortal.
      </p>
      
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Personal Information:</strong> Name, email address, and profile information when you create an account.</li>
          <li><strong>Usage Data:</strong> Automatically collected information, including IP address, device type, browser type, and usage statistics.</li>
          <li><strong>User-Generated Content:</strong> Information you provide through quizzes, assessments, and interactions with the AI tutor.</li>
        </ul>
      </section>
      
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
        <p>We may use the information we collect to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, maintain, and improve EduPortal's services.</li>
          <li>Personalize your experience, including AI-driven learning recommendations.</li>
          <li>Communicate with you about updates, offers, and support.</li>
          <li>Analyze usage and improve our app's functionality.</li>
        </ul>
      </section>
      
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Disclosure of Your Information</h2>
        <p>We do not share your personal information with third parties except:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>With your consent.</li>
          <li>To comply with legal obligations.</li>
          <li>With service providers who assist in operating our app (e.g., cloud storage, analytics).</li>
        </ul>
      </section>
      
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Data Security</h2>
        <p>
          We use industry-standard measures to protect your information. However, no method of transmission over the internet is entirely secure.
        </p>
      </section>
      
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Your Rights</h2>
        <p>
          You may update your account information or delete your account through the app's settings. You can also contact us for data-related requests.
        </p>
      </section>
      
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">6. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. We will notify you of any significant changes by posting the new policy on our app.
        </p>
      </section>
      
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">7. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at support@eduportal.com.
        </p>
      </section>
    </div>
  );
}
