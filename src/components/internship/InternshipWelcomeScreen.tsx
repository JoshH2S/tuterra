import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  BookOpen, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { CompanyProfileService, CompanyProfileGenerationStatus } from '@/services/companyProfileService';

interface InternshipWelcomeScreenProps {
  sessionId: string;
  jobTitle: string;
  industry: string;
  onComplete: () => void;
}

export function InternshipWelcomeScreen({ 
  sessionId, 
  jobTitle, 
  industry, 
  onComplete 
}: InternshipWelcomeScreenProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleStartInternship = async () => {
    setIsGenerating(true);
    setError('');
    setGenerationStep('Initializing...');

    try {
      // Step 1: Check current status
      setGenerationStep('Checking company profile status...');
      let status = await CompanyProfileService.checkProfileStatus(sessionId);

      if (status.isComplete) {
        // Already complete, go directly to dashboard
        onComplete();
        return;
      }

      if (status.error && !status.isGenerating) {
        // Previous generation failed, try again
        setGenerationStep('Previous generation failed, retrying...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
      }

      if (!status.isGenerating) {
        // Step 2: Start generation
        setGenerationStep('Generating your personalized company experience...');
        const generateResult = await CompanyProfileService.generateProfile(sessionId, jobTitle, industry);
        
        if (!generateResult.success) {
          throw new Error(generateResult.error || 'Failed to start company profile generation');
        }
        
        setGenerationStep('Company profile generation started...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Give it time to start
      }

      // Step 3: Wait for completion
      setGenerationStep('Creating your virtual company environment...');
      status = await CompanyProfileService.waitForCompletion(sessionId, 120000); // 2 minute timeout

      if (status.error) {
        throw new Error(status.error);
      }

      if (!status.isComplete) {
        throw new Error('Company profile generation timed out. Please try again.');
      }

      // Step 4: Success!
      setGenerationStep('Your internship experience is ready!');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete();

    } catch (error) {
      console.error('Error setting up internship:', error);
      setError(String(error));
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleRetry = () => {
    setError('');
    handleStartInternship();
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-xl">Setting Up Your Internship</CardTitle>
            <CardDescription>
              We're creating a personalized company experience just for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">{generationStep}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 animate-pulse w-3/4"></div>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              This usually takes 1-2 minutes...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Setup Error</CardTitle>
            <CardDescription>
              There was an issue setting up your internship experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={onComplete}
                className="flex-1"
              >
                Skip & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold mb-2">
            Welcome to Your Virtual Internship!
          </CardTitle>
          <CardDescription className="text-lg">
            Ready to start your journey as a <Badge variant="secondary" className="mx-1">{jobTitle}</Badge> 
            in the <Badge variant="secondary" className="mx-1">{industry}</Badge> industry?
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Realistic Company</h3>
              <p className="text-sm text-gray-600">
                Experience working at a virtual company with authentic projects and team members
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Team Collaboration</h3>
              <p className="text-sm text-gray-600">
                Work with AI-powered supervisors and team members who provide guidance and feedback
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold">Real Projects</h3>
              <p className="text-sm text-gray-600">
                Complete industry-relevant tasks and build a portfolio of professional work
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• We'll create your personalized company environment</li>
                  <li>• You'll meet your supervisor and team members</li>
                  <li>• Your first tasks and resources will be ready</li>
                  <li>• You can start working immediately</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleStartInternship}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              Start My Internship
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              This will take 1-2 minutes to set up your personalized experience
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 