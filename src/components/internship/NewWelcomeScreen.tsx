import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from 'date-fns';
import { Calendar, Building2, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface NewWelcomeScreenProps {
  sessionId: string;
  internshipData: {
    jobTitle: string;
    companyName: string;
    startDate?: string | Date;
    industry?: string;
  };
  onStart: () => void;
  isStarting?: boolean;
}

export function NewWelcomeScreen({ 
  sessionId, 
  internshipData,
  onStart,
  isStarting = false
}: NewWelcomeScreenProps) {
  const { jobTitle, companyName, startDate, industry } = internshipData;
  
  // Format the date if available
  const formattedDate = startDate 
    ? format(new Date(startDate), 'MMMM d, yyyy')
    : null;

  const features = [
    { icon: CheckCircle2, text: "Real-world projects and tasks" },
    { icon: CheckCircle2, text: "Professional feedback and guidance" },
    { icon: CheckCircle2, text: "Industry-relevant experience" },
    { icon: CheckCircle2, text: "Certificate upon completion" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with Logo */}
        <motion.header 
          className="px-6 py-6 md:px-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png" 
            alt="Tuterra Logo" 
            className="h-8 md:h-10 w-auto object-contain"
          />
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Left: Welcome Content */}
              <motion.div 
                className="space-y-6 md:space-y-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="space-y-4">
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-sm px-3 py-1" style={{ backgroundColor: '#ac9571', color: 'white' }}>
                    Virtual Internship Program
                  </Badge>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Welcome to Your
                    <span className="block mt-2" style={{ color: '#ac9571' }}>
                      Virtual Internship
                    </span>
                  </h1>
                  
                  <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                    Experience real-world learning and start building professional skills that matter in today's industry.
                  </p>
                </div>

                {/* Internship Details Card */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-lg" style={{ borderColor: '#ac9571' }}>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#ac957120' }}>
                        <Briefcase className="w-5 h-5" style={{ color: '#ac9571' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium">Your Role</p>
                        <p className="text-lg font-semibold text-gray-900">{jobTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: '#ac957120' }}>
                        <Building2 className="w-5 h-5" style={{ color: '#ac9571' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 font-medium">Company</p>
                        <p className="text-lg font-semibold text-gray-900">{companyName}</p>
                        {industry && (
                          <p className="text-sm text-gray-600 mt-0.5">{industry} Industry</p>
                        )}
                      </div>
                    </div>

                    {formattedDate && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: '#ac957120' }}>
                          <Calendar className="w-5 h-5" style={{ color: '#ac9571' }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 font-medium">Start Date</p>
                          <p className="text-lg font-semibold text-gray-900">{formattedDate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Start Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={onStart}
                    disabled={isStarting}
                    size="lg"
                    className="w-full md:w-auto text-white px-8 py-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      background: `linear-gradient(to right, #ac9571, #8b7355)`,
                      ':hover': { background: `linear-gradient(to right, #8b7355, #6d5a42)` }
                    }}
                  >
                    {isStarting ? 'Setting Up Your Internship...' : 'Start Your Internship Journey'}
                    <ArrowRight className={`ml-2 w-5 h-5 transition-transform ${isStarting ? 'animate-pulse' : 'group-hover:translate-x-1'}`} />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right: Features & Illustration */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {/* Professional Image */}
                <div className="flex items-center justify-center">
                  <div className="w-full max-w-sm mx-auto">
                    <div className="relative">
                      <img 
                        src="https://nhlsrtubyvggtkyrhkuu.supabase.co/storage/v1/object/public/characters/pexels-august-de-richelieu-4427712.jpg"
                        alt="Ready to Begin Your Virtual Internship" 
                        className="w-full h-80 object-cover rounded-2xl shadow-lg"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-center">
                        <p className="text-white font-semibold text-lg mb-1">Ready to Begin</p>
                        <p className="text-white/90 text-sm">Your professional journey starts now</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What You'll Get Section */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 shadow-lg" style={{ borderColor: '#ac957150' }}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What You'll Get</h3>
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
                      >
                        <feature.icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ac9571' }} />
                        <p className="text-gray-700">{feature.text}</p>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

            </div>
          </div>
        </div>

        {/* Footer Note */}
        <motion.footer 
          className="px-6 py-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-sm text-gray-500">
            Powered by AI-driven learning experiences
          </p>
        </motion.footer>
      </div>
    </div>
  );
} 