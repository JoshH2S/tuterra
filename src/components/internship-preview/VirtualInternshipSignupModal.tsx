import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface VirtualInternshipSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VirtualInternshipSignupModal({ isOpen, onClose }: VirtualInternshipSignupModalProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handleGetStarted = () => {
    onClose();
    if (isLoggedIn) {
      // User is already logged in, take them to create internship
      navigate('/dashboard/virtual-internship/new');
    } else {
      // User needs to sign up
      navigate('/auth?tab=signup');
    }
  };

  const handleClose = () => {
    onClose();
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
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl">Start Your Virtual Internship</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Ready to gain real-world experience?
                </h3>
                <p className="text-gray-600 mb-6">
                  Join Tuterra and start your virtual internship journey with AI-powered supervision, 
                  realistic workplace tasks, and personalized feedback.
                </p>

                {/* Highlight Features */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm font-semibold text-gray-900 mb-2">What you'll get:</p>
                  <ul className="text-sm text-gray-700 space-y-1.5">
                    <li>✨ AI supervisor with personalized feedback</li>
                    <li>💼 Realistic workplace scenarios</li>
                    <li>📈 Professional skill development</li>
                    <li>🎓 Certificate of completion</li>
                  </ul>
                </div>

                {/* Promo Callout */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                  <p className="text-sm font-semibold text-amber-900">
                    🎉 Limited Time: Use code <span className="font-mono bg-amber-100 px-2 py-0.5 rounded">FIRST30</span>
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    First 30 users get 1 free virtual internship!
                  </p>
                </div>

                <Button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-base font-semibold"
                >
                  {isLoggedIn ? 'Create Internship' : 'Get Started'}
                </Button>

                <p className="text-xs text-gray-500 mt-4">
                  {isLoggedIn 
                    ? 'Start your virtual internship experience now'
                    : 'Create your free account to get started'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 