import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { X, Mail, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VirtualInternshipSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VirtualInternshipSignupModal({ isOpen, onClose }: VirtualInternshipSignupModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    emailConsent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.emailConsent) {
      toast({
        title: "Email Consent Required",
        description: "Please opt in to receive email communications.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('=== VIRTUAL INTERNSHIP WAITLIST SIGNUP ===');
      console.log('Form data:', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        email_consent: formData.emailConsent
      });

      const { data, error } = await supabase
        .from('virtual_internship_waitlist')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          email_consent: formData.emailConsent,
          signed_up_at: new Date().toISOString()
        });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ Successfully joined waitlist');
      setIsSuccess(true);
      
      toast({
        title: "Successfully Joined Waitlist!",
        description: "We'll notify you as soon as virtual internships are available.",
      });

    } catch (error) {
      console.error('=== WAITLIST SIGNUP ERROR ===');
      console.error('Full error object:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      
      // Handle duplicate email error gracefully
      if (error?.code === '23505') {
        console.log('Handling duplicate email error');
        toast({
          title: "Already on Waitlist",
          description: "This email is already registered for our virtual internship waitlist.",
          variant: "destructive",
        });
      } else if (error?.message?.includes('JWT')) {
        console.log('Handling JWT/auth error');
        toast({
          title: "Authentication Error",
          description: "There was an authentication issue. Please refresh the page and try again.",
          variant: "destructive",
        });
      } else if (error?.message?.includes('RLS')) {
        console.log('Handling RLS policy error');
        toast({
          title: "Permission Error",
          description: "There was a permission issue. Please contact support.",
          variant: "destructive",
        });
      } else if (error?.code === 'PGRST116') {
        console.log('Handling table not found error');
        toast({
          title: "Service Unavailable",
          description: "The waitlist service is temporarily unavailable. Please try again later.",
          variant: "destructive",
        });
      } else {
        console.log('Handling generic error');
        toast({
          title: "Signup Failed",
          description: `Something went wrong: ${error?.message || 'Unknown error'}. Please try again.`,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', email: '', emailConsent: false });
      setIsSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md mx-4"
        >
          <Card className="bg-white shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-xl">Join Virtual Internship Waitlist</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    You're on the list!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We'll notify you as soon as virtual internships become available.
                  </p>
                  <Button onClick={handleClose} className="bg-amber-600 hover:bg-amber-700">
                    Close
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email address"
                        disabled={isSubmitting}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Checkbox
                        id="emailConsent"
                        checked={formData.emailConsent}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailConsent: !!checked }))}
                        disabled={isSubmitting}
                        className="mt-0.5"
                      />
                      <Label htmlFor="emailConsent" className="text-sm leading-5 cursor-pointer">
                        I agree to receive email communications about virtual internship program updates 
                        and launch notifications from Tuterra. I can unsubscribe at any time.
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.name.trim() || !formData.email.trim() || !formData.emailConsent}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Joining Waitlist...
                      </>
                    ) : (
                      'Join Waitlist'
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By joining our waitlist, you'll be among the first to experience Tuterra's 
                    innovative virtual internship program.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 