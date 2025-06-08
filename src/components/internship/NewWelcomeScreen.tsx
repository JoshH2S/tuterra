import React from 'react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

interface NewWelcomeScreenProps {
  sessionId: string;
  internshipData: {
    jobTitle: string;
    companyName: string;
    startDate?: string | Date;
  };
  onStart: () => void;
}

export function NewWelcomeScreen({ 
  sessionId, 
  internshipData,
  onStart
}: NewWelcomeScreenProps) {
  const { jobTitle, companyName, startDate } = internshipData;
  
  // Format the date if available
  const formattedDate = startDate 
    ? `Internship begins: ${format(new Date(startDate), 'MMMM d, yyyy')}` 
    : null;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center">
        {/* Left content section */}
        <div className="w-full md:w-1/2 px-6 py-8 md:py-12 flex flex-col space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 leading-tight">
            Welcome to Your Virtual Internship
          </h1>
          
          <h2 className="text-xl text-gray-600">
            Experience real-world learning. Start building skills that matter.
          </h2>
          
          <p className="text-lg text-indigo-800 font-medium mt-2">
            Your journey as a {jobTitle} at {companyName} begins now.
          </p>
          
          {formattedDate && (
            <p className="text-sm text-amber-600 font-medium">
              {formattedDate}
            </p>
          )}
          
          <div className="pt-6">
            <Button 
              onClick={onStart}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 rounded-lg text-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Start Internship
            </Button>
          </div>
        </div>
        
        {/* Right illustration section */}
        <div className="w-full md:w-1/2 p-6 flex items-center justify-center">
          <div className="relative w-full max-w-md">
            {/* Background shape */}
            <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-70 transform scale-110"></div>
            
            {/* Illustrations */}
            <div className="relative z-10 p-6">
              <img 
                src="/images/internship-illustration.svg" 
                alt="Virtual Internship" 
                className="w-full h-auto"
                onError={(e) => {
                  // Fallback illustration when image is not found
                  e.currentTarget.outerHTML = `
                    <div class="w-full h-64 flex items-center justify-center bg-indigo-50 rounded-lg border-2 border-dashed border-indigo-200">
                      <div class="text-center">
                        <div class="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-indigo-600">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                          </svg>
                        </div>
                        <p class="text-indigo-600 font-medium">Ready to start your internship journey</p>
                      </div>
                    </div>
                  `;
                }}
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-1/4 right-0 w-12 h-12 bg-amber-300 rounded-full opacity-70 transform translate-x-1/2"></div>
            <div className="absolute bottom-1/4 left-0 w-8 h-8 bg-amber-300 rounded-full opacity-70 transform -translate-x-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 