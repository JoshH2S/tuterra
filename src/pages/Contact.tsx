
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Header1 } from "@/components/ui/header";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Building, User, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: { name, email, company, message }
      });

      if (error) throw error;

      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      
      // Clear form
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
    } catch (error) {
      console.error("Error sending contact form:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again later or contact us directly at admin@tuterra.ai",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header1 />
      
      <div className="container mx-auto px-4 py-24 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interested in our Enterprise plan or have questions? Fill out the form below and our team will get back to you shortly.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-8 rounded-lg shadow-lg"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-1">
                  Company or Institution
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="pl-10"
                    placeholder="Your Company"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                  <Textarea 
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="pl-10 min-h-[120px]"
                    placeholder="Tell us about your needs and requirements..."
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col justify-center"
          >
            <div className="bg-primary/5 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Enterprise Features</h2>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Custom Dashboard</h3>
                    <p className="text-muted-foreground">Tailored to your organization's specific needs</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Advanced Analytics</h3>
                    <p className="text-muted-foreground">Track student progress and identify areas for improvement</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">LMS Integration</h3>
                    <p className="text-muted-foreground">Seamlessly connect with your existing learning management system</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-4 mt-1">
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Custom Content</h3>
                    <p className="text-muted-foreground">Curriculum-aligned learning materials and assessments</p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
