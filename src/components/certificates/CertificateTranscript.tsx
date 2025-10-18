import React, { forwardRef } from 'react';
import { format } from 'date-fns';

interface CertificateData {
  participantName: string;
  jobTitle: string;
  industry: string;
  companyName: string;
  completedAt: string;
  totalXP: number;
  averageLevel: number;
  topSkills: Array<{
    skill: { name: string };
    current_level: number;
  }>;
  completedTasks: number;
  totalTasks: number;
  certificateId: string;
}

interface CertificateTranscriptProps {
  data: CertificateData;
  className?: string;
}

export const CertificateTranscript = forwardRef<HTMLDivElement, CertificateTranscriptProps>(
  ({ data, className = "" }, ref) => {
    const completionDate = format(new Date(data.completedAt), 'MMMM d, yyyy');
    
    return (
      <div 
        ref={ref}
        className={`bg-white mx-auto print:shadow-none ${className}`}
        style={{ 
          width: '8.5in', 
          height: '11in',
          padding: '0.75in',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* Header */}
        <div className="border-b-2 pb-6 mb-8" style={{ borderColor: '#0E2A47' }}>
          <div className="flex items-center justify-between">
            <div>
              <img 
                src="/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png" 
                alt="Tuterra Logo" 
                className="h-12 mb-2"
              />
              <h1 className="text-2xl font-bold" style={{ color: '#0E2A47' }}>
                LETTER OF ACHIEVEMENT
              </h1>
              <p className="text-gray-600">Virtual Internship Program</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Certificate ID: {data.certificateId}</p>
              <p>Issued: {completionDate}</p>
            </div>
          </div>
        </div>

        {/* Participant Info */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0E2A47' }}>
            Participant Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold">Name:</p>
              <p>{data.participantName}</p>
            </div>
            <div>
              <p className="font-semibold">Program:</p>
              <p>{data.jobTitle} Virtual Internship</p>
            </div>
            <div>
              <p className="font-semibold">Industry:</p>
              <p>{data.industry}</p>
            </div>
            <div>
              <p className="font-semibold">Completion Date:</p>
              <p>{completionDate}</p>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0E2A47' }}>
            Performance Summary
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold mb-2" style={{ color: '#0E2A47' }}>
                {data.completedTasks}/{data.totalTasks}
              </div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: `${(data.completedTasks / data.totalTasks) * 100}%`,
                    backgroundColor: '#0E2A47'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold mb-2" style={{ color: '#0E2A47' }}>
                {data.totalXP}
              </div>
              <p className="text-sm text-gray-600">Total XP Earned</p>
              <p className="text-xs text-gray-500 mt-2">Experience Points</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold mb-2" style={{ color: '#0E2A47' }}>
                {data.averageLevel}
              </div>
              <p className="text-sm text-gray-600">Average Skill Level</p>
              <p className="text-xs text-gray-500 mt-2">Out of 10</p>
            </div>
          </div>
        </div>

        {/* Skills Development */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0E2A47' }}>
            Skills Development
          </h2>
          {data.topSkills && data.topSkills.length > 0 ? (
            <div className="space-y-3">
              {data.topSkills.map((skillProgress, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{skillProgress.skill?.name || 'Unknown Skill'}</p>
                    <p className="text-sm text-gray-600">Level {skillProgress.current_level}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${(skillProgress.current_level / 10) * 100}%`,
                          backgroundColor: '#0E2A47'
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{skillProgress.current_level}/10</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">Skills assessment in progress</p>
          )}
        </div>

        {/* Program Details */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#0E2A47' }}>
            Program Details
          </h2>
          <div className="text-sm space-y-2">
            <p><strong>Duration:</strong> 8 weeks</p>
            <p><strong>Format:</strong> Virtual/Remote</p>
            <p><strong>Industry Focus:</strong> {data.industry}</p>
            <p><strong>Completion Rate:</strong> {Math.round((data.completedTasks / data.totalTasks) * 100)}%</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 border-t text-center text-sm text-gray-600">
          <p className="mb-2">
            This letter of achievement accompanies Certificate ID: {data.certificateId}
          </p>
          <p>
            Issued by Tuterra • Verify at tuterra.ai/verify
          </p>
        </div>
      </div>
    );
  }
);

CertificateTranscript.displayName = 'CertificateTranscript';

