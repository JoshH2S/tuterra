import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { DigitalCertificate } from '@/components/certificates/DigitalCertificate';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Share2, ArrowLeft, ExternalLink } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  sessionId: string;
  userId: string;
  // Add pre-converted images to avoid CORS issues
  logoDataUrl?: string;
}

// Helper to convert image to data URL to avoid CORS issues
async function convertImageToDataUrl(url: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn('Canvas context not available, using original URL');
          resolve(url); // Fallback to original
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        console.log('Successfully converted image to data URL');
        resolve(dataUrl);
      } catch (error) {
        console.warn('Failed to convert image, using original:', error);
        resolve(url); // Fallback to original
      }
    };
    
    img.onerror = () => {
      console.warn('Failed to load image, using original URL');
      resolve(url); // Fallback to original
    };
    
    img.src = url;
  });
}

export default function CertificatePage() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!certificateId) {
      navigate('/dashboard');
      return;
    }

    fetchCertificateData();
  }, [certificateId, navigate]);

  const fetchCertificateData = async () => {
    try {
      setLoading(true);

      // Get certificate from final submissions
      const { data: submission, error: submissionError } = await supabase
        .from('internship_final_submissions')
        .select(`
          *,
          session:internship_sessions(
            job_title,
            industry,
            user_id
          )
        `)
        .eq('id', certificateId)
        .single();

      if (submissionError || !submission) {
        throw new Error('Certificate not found');
      }

      // Get user profile for name
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', submission.user_id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Get completion data for stats
      const { data: tasks } = await supabase
        .from('internship_tasks')
        .select('*')
        .eq('session_id', submission.session_id);

      const { data: taskSubmissions } = await supabase
        .from('internship_task_submissions')
        .select('*')
        .eq('session_id', submission.session_id)
        .eq('user_id', submission.user_id);

      // Calculate stats (using available data)
      const totalTasks = tasks?.length || 0;
      const completedTasks = taskSubmissions?.length || 0;
      
      // Use mock skill data for now (can be replaced with real skill progress later)
      const totalXP = completedTasks * 100; // 100 XP per completed task
      const averageLevel = Math.min(Math.floor(completedTasks / 2) + 1, 5); // Level up every 2 tasks, max level 5
      
      const mockSkills = [
        { skill: { name: 'Communication' }, current_level: averageLevel },
        { skill: { name: 'Problem Solving' }, current_level: Math.max(averageLevel - 1, 1) },
        { skill: { name: 'Time Management' }, current_level: averageLevel },
        { skill: { name: 'Critical Thinking' }, current_level: Math.max(averageLevel - 1, 1) },
        { skill: { name: 'Teamwork' }, current_level: averageLevel },
        { skill: { name: 'Leadership' }, current_level: Math.max(averageLevel - 2, 1) }
      ];

      const participantName = profile?.first_name && profile?.last_name
        ? `${profile.first_name} ${profile.last_name}`
        : 'Internship Participant';

      const certificateData: CertificateData = {
        participantName,
        jobTitle: submission.session?.job_title || 'Virtual Intern',
        industry: submission.session?.industry || 'Professional Development',
        companyName: 'Tuterra',
        completedAt: submission.submitted_at,
        totalXP,
        averageLevel,
        topSkills: mockSkills,
        completedTasks,
        totalTasks,
        certificateId: submission.id,
        sessionId: submission.session_id,
        userId: submission.user_id
      };

      // PRE-CONVERT LOGO IMAGE to avoid CORS issues during download
      console.log('Converting logo to data URL...');
      const logoUrl = '/lovable-uploads/e4d97c37-c1df-4857-b0d5-dcd941fb1867.png';
      const logoDataUrl = await convertImageToDataUrl(logoUrl);
      certificateData.logoDataUrl = logoDataUrl;
      console.log('Logo conversion complete');

      setCertificateData(certificateData);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      toast({
        title: "Certificate not found",
        description: "This certificate may not exist or may have been removed.",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    console.log('Download PDF clicked');
    console.log('Certificate ref:', certificateRef.current);
    console.log('Certificate data:', certificateData);
    
    if (!certificateRef.current) {
      toast({
        title: "Download Failed",
        description: "Certificate element not found. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }
    
    if (!certificateData) {
      toast({
        title: "Download Failed",
        description: "Certificate data not loaded. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }

    try {
      setExporting(true);
      console.log('Starting PDF generation...');
      
      // Since images are now data URLs, html2canvas should work perfectly!
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true, // Safe since we're using data URLs
        useCORS: false // Not needed with data URLs
      });

      console.log('Canvas created for PDF:', canvas);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      console.log('Image data created, length:', imgData.length);
      
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      console.log('PDF dimensions:', pdfWidth, 'x', pdfHeight);
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const filename = `${certificateData.participantName.replace(/\s+/g, '_')}_Certificate.pdf`;
      pdf.save(filename);
      
      console.log('PDF download triggered for:', filename);

      toast({
        title: "Certificate Downloaded!",
        description: "Your certificate has been saved as a PDF.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Fallback: Use browser print functionality
      toast({
        title: "Download Alternative",
        description: "PDF download failed. Please use the Print button and save as PDF instead.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadImage = async () => {
    console.log('Download Image clicked');
    console.log('Certificate ref:', certificateRef.current);
    console.log('Certificate data:', certificateData);
    
    if (!certificateRef.current) {
      toast({
        title: "Download Failed",
        description: "Certificate element not found. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }
    
    if (!certificateData) {
      toast({
        title: "Download Failed", 
        description: "Certificate data not loaded. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }

    try {
      setExporting(true);
      console.log('Starting PNG generation...');
      
      // Since images are now data URLs, html2canvas should work perfectly!
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true, // Safe since we're using data URLs
        useCORS: false // Not needed with data URLs
      });

      console.log('Canvas created:', canvas);

      // Download as PNG
      const link = document.createElement('a');
      const filename = `${certificateData.participantName.replace(/\s+/g, '_')}_Certificate.png`;
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      
      // Add to DOM temporarily to ensure click works
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Download triggered for:', filename);

      toast({
        title: "Certificate Downloaded!",
        description: "Your certificate has been saved as an image.",
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Fallback: Use browser print functionality
      toast({
        title: "Download Alternative",
        description: "Image download failed. Please use the Print button and save as PDF instead.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    console.log('Share button clicked');
    console.log('Certificate data:', certificateData);
    
    const url = window.location.href;
    console.log('Sharing URL:', url);
    
    if (!certificateData) {
      toast({
        title: "Share Failed",
        description: "Certificate data not loaded. Please try refreshing the page.",
        variant: "destructive"
      });
      return;
    }
    
    if (navigator.share) {
      console.log('Using native share API');
      try {
        await navigator.share({
          title: `${certificateData.participantName}'s Internship Certificate`,
          text: `Check out my completion certificate for the ${certificateData.jobTitle} Virtual Internship!`,
          url: url
        });
        console.log('Native share completed');
      } catch (error) {
        console.log('Native share failed, falling back to clipboard:', error);
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: "Link Copied!",
            description: "Certificate link has been copied to your clipboard.",
          });
        } catch (clipboardError) {
          console.error('Clipboard fallback failed:', clipboardError);
          toast({
            title: "Share Failed",
            description: "Unable to share or copy link. Please copy the URL manually.",
            variant: "destructive"
          });
        }
      }
    } else {
      console.log('Using clipboard fallback');
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied!",
          description: "Certificate link has been copied to your clipboard.",
        });
      } catch (error) {
        console.error('Clipboard failed:', error);
        toast({
          title: "Share Failed", 
          description: "Unable to copy link. Please copy the URL manually from your browser.",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Certificate Not Found</h1>
          <p className="text-gray-600 mb-6">This certificate may not exist or may have been removed.</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="container mx-auto px-4 print:px-0">
        {/* Header - Hidden in Print */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => {
                console.log('Share button clicked - outer handler');
                handleShare();
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            
            <Button 
              onClick={() => {
                console.log('Download PNG button clicked - outer handler');
                handleDownloadImage();
              }}
              variant="outline"
              disabled={exporting}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </Button>
            
            <Button 
              onClick={() => {
                console.log('Download PDF button clicked - outer handler');
                handleDownloadPDF();
              }}
              disabled={exporting}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Generating...' : 'Download PDF'}
            </Button>
            
            <Button 
              onClick={() => window.print()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Certificate */}
        <div className="flex justify-center print:block">
          <DigitalCertificate 
            ref={certificateRef}
            data={certificateData}
            className="shadow-lg print:shadow-none"
          />
        </div>
        
        {/* Debug Info - Remove in production */}
        <div className="mt-4 p-4 bg-gray-100 text-xs text-gray-600 print:hidden">
          <p><strong>Debug Info:</strong></p>
          <p>Certificate Ref: {certificateRef.current ? 'Available' : 'Not Available'}</p>
          <p>Certificate Data: {certificateData ? 'Loaded' : 'Not Loaded'}</p>
          <p>Participant Name: {certificateData?.participantName || 'N/A'}</p>
          <p>Certificate ID: {certificateData?.certificateId || 'N/A'}</p>
          <p>Exporting: {exporting ? 'Yes' : 'No'}</p>
        </div>

        {/* Verification Info - Hidden in Print */}
        <div className="text-center text-sm text-gray-600 mt-8 print:hidden">
          <p className="mb-2">
            This certificate can be verified at{' '}
            <a 
              href={`/certificates/${certificateId}`}
              className="text-primary-blue hover:underline font-medium"
            >
              tuterra.ai/certificates/{certificateId}
            </a>
          </p>
          <p>Certificate ID: {certificateData.certificateId}</p>
        </div>
      </div>
    </div>
  );
}
