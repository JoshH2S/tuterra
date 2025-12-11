import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Calendar, 
  Target, 
  MapPin, 
  Users, 
  Globe, 
  CheckCircle,
  Clock,
  Award,
  MessageCircle
} from "lucide-react";
import { InternshipPreviewData, InternshipPreviewResponse } from "@/pages/InternshipPreview";

interface InternshipPreviewResultsProps {
  data: InternshipPreviewResponse;
  formData: InternshipPreviewData;
  onBackToForm: () => void;
}

export function InternshipPreviewResults({ data, formData, onBackToForm }: InternshipPreviewResultsProps) {
  const { company, supervisor, tasks, expectations } = data;

  // Group tasks by week
  const tasksByWeek = tasks.reduce((acc, task) => {
    if (!acc[task.week]) {
      acc[task.week] = [];
    }
    acc[task.week].push(task);
    return acc;
  }, {} as Record<number, typeof tasks>);

  const weeks = Object.keys(tasksByWeek).map(Number).sort((a, b) => a - b);

  // Scroll to top when results page first loads
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100); // Small delay to ensure content is rendered

    return () => clearTimeout(scrollTimer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        
        <p className="text-lg text-gray-600">
          Here's what your {expectations.duration} Tuterra internship would look like
        </p>
      </motion.div>

      {/* Company Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl">Company Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{company.name}</h3>
                  <Badge variant="secondary" className="mb-3">{company.sector}</Badge>
                  <p className="text-gray-700 leading-relaxed">{company.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mission</h4>
                  <p className="text-gray-700">{company.mission}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Vision</h4>
                  <p className="text-gray-700">{company.vision}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Core Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.coreValues.map((value, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Company Details</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Founded {company.foundedYear}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{company.employeeCount.toLocaleString()} employees</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{company.headquartersLocation}</span>
                    </div>
                    {company.websiteUrl && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span className="text-blue-600">{company.websiteUrl}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Supervisor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-amber-600" />
              <CardTitle className="text-xl">Your Virtual Supervisor</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{supervisor.name}</h3>
                <p className="text-amber-600 font-medium mb-3">{supervisor.title}</p>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-800 italic">"{supervisor.introMessage}"</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tasks Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-amber-600" />
              <CardTitle className="text-xl">Your Internship Schedule</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {weeks.map((week) => (
              <div key={week} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-amber-600">
                    Week {week}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                  {tasksByWeek[week].map((task, index) => (
                    <div key={index} className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                          <p className="text-sm text-gray-700">{task.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {week < weeks[weeks.length - 1] && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Expectations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-amber-600" />
              <CardTitle className="text-xl">What to Expect</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Duration</h4>
                    <p className="text-gray-700">{expectations.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Total Tasks</h4>
                    <p className="text-gray-700">{expectations.totalTasks} hands-on projects</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Feedback</h4>
                    <p className="text-gray-700">{expectations.feedbackCycle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-amber-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">Final Project</h4>
                    <p className="text-gray-700">{expectations.finalDeliverable}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Your Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-900">Industry:</span>
                <p className="text-blue-800">{formData.industry}</p>
              </div>
              {formData.jobRole && (
                <div>
                  <span className="font-medium text-blue-900">Role:</span>
                  <p className="text-blue-800">{formData.jobRole}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-blue-900">Duration:</span>
                <p className="text-blue-800">{formData.internshipDurationWeeks} weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div 
        className="flex flex-col gap-4 pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {/* Primary CTA for Getting Started */}
        <Card className="bg-gradient-to-br from-primary-100/80 to-primary-200/80 border-amber-200 p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-amber-900 mb-2">
              Ready to Start Your Virtual Internship?
            </h3>
            <p className="text-gray-700 mb-4">
              Join Tuterra and get hands-on experience with realistic workplace scenarios, 
              AI-powered supervision, and personalized feedback to build your professional skills.
            </p>
            <Button
              onClick={() => {
                console.log('🚀 Get Started button clicked - dispatching custom event');
                const event = new CustomEvent('openVirtualInternshipSignup');
                window.dispatchEvent(event);
                console.log('✅ Custom event dispatched:', event);
              }}
              className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg font-semibold shadow-md border-0"
            >
              Get Started
            </Button>
          </div>
        </Card>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={onBackToForm}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Try Different Settings
          </Button>
        </div>
      </motion.div>
    </div>
  );
} 