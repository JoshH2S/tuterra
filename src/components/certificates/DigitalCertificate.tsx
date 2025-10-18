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
  logoDataUrl?: string;
}

interface DigitalCertificateProps {
  data: CertificateData;
  className?: string;
}

export const DigitalCertificate = forwardRef<HTMLDivElement, DigitalCertificateProps>(
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
          fontFamily: 'Georgia, serif'
        }}
      >
        {/* Certificate Border */}
        <div className="relative h-full border-4 border-double" style={{ borderColor: '#0E2A47' }}>
          {/* Inner Border */}
          <div className="absolute inset-2 border border-solid" style={{ borderColor: '#C9A227' }}></div>
          
          {/* Subtle Background Texture */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>

          {/* Content Container */}
          <div className="relative h-full flex flex-col justify-between p-12">
            
            {/* Header */}
            <div className="text-center">
              {/* Logo */}
              <div className="mb-6">
                {data.logoDataUrl ? (
                  <img 
                    src={data.logoDataUrl} 
                    alt="Tuterra Logo" 
                    className="h-16 mx-auto"
                  />
                ) : (
                  <div className="text-2xl font-bold text-blue-600 text-center">
                    TUTERRA
                  </div>
                )}
              </div>
              
              {/* Gradient Bar */}
              <div className="h-3 bg-gradient-to-r from-blue-600 to-blue-800 mx-auto mb-8" style={{ width: '200px' }}></div>
              
              {/* Title */}
              <h1 className="text-5xl font-bold tracking-wider mb-3" style={{ 
                color: '#0E2A47',
                fontFamily: 'Playfair Display, Georgia, serif',
                letterSpacing: '0.02em'
              }}>
                CERTIFICATE OF COMPLETION
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl text-gray-700 font-medium tracking-wide">
                Virtual Internship Program
              </p>
            </div>

            {/* Main Content */}
            <div className="text-center flex-1 flex flex-col justify-center">
              {/* Awarded To */}
              <p className="text-sm font-semibold tracking-widest mb-4" style={{ 
                color: '#0E2A47',
                textTransform: 'uppercase',
                letterSpacing: '0.15em'
              }}>
                Awarded to
              </p>
              
              {/* Recipient Name */}
              <h2 className="text-6xl font-bold mb-8 tracking-wide" style={{ 
                color: '#0E2A47',
                fontFamily: 'Playfair Display, Georgia, serif',
                lineHeight: '1.1'
              }}>
                {data.participantName}
              </h2>
              
              {/* Citation */}
              <p className="text-xl leading-relaxed mb-6 max-w-3xl mx-auto" style={{ color: '#0E2A47' }}>
                has successfully completed the <strong>{data.jobTitle}</strong> Virtual Internship 
                in the <strong>{data.industry}</strong> industry
              </p>
              
              {/* Meta Row */}
              <div className="text-base text-gray-600 mb-8">
                <span>Program Length: 8 weeks</span>
                <span className="mx-4">•</span>
                <span>Completed: {completionDate}</span>
                <span className="mx-4">•</span>
                <span>Tasks: {data.completedTasks}/{data.totalTasks}</span>
              </div>
            </div>

            {/* Signatures and Footer */}
            <div className="mt-auto">
              {/* Signatures Row */}
              <div className="flex justify-between items-end mb-8">
                {/* Left Signature */}
                <div className="text-center">
                  <div className="w-48 border-b border-gray-400 mb-2"></div>
                  <p className="text-sm font-medium" style={{ color: '#0E2A47' }}>Joshua Mughogho</p>
                  <p className="text-xs text-gray-600 tracking-wide" style={{ textTransform: 'uppercase' }}>
                    Chief Executive Officer
                  </p>
                </div>
                
                {/* Center Seal */}
                <div className="mx-8">
                  <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center text-xs font-bold" 
                       style={{ borderColor: '#C9A227', color: '#C9A227' }}>
                    <div className="text-center">
                      <div>TUTERRA</div>
                      <div className="text-xs">2025</div>
                    </div>
                  </div>
                </div>
                
                {/* Right Signature */}
                <div className="text-center">
                  <div className="w-48 border-b border-gray-400 mb-2"></div>
                  <p className="text-sm font-medium" style={{ color: '#0E2A47' }}>Austin Kennedy</p>
                  <p className="text-xs text-gray-600 tracking-wide" style={{ textTransform: 'uppercase' }}>
                    Chief Operations Officer
                  </p>
                </div>
              </div>
              
              {/* Verification Footer */}
              <div className="text-center text-xs text-gray-600">
                <p className="mb-1">Certificate ID: {data.certificateId}</p>
                <p>Verify at tuterra.ai/verify</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Print Styles */}
        <style jsx>{`
          @media print {
            @page {
              size: landscape;
              margin: 0.5in;
            }
            
            .ui, .buttons, button { display: none !important; }
            body { 
              margin: 0; 
              background: white !important;
            }
            * { 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
        `}</style>
      </div>
    );
  }
);

DigitalCertificate.displayName = 'DigitalCertificate';
