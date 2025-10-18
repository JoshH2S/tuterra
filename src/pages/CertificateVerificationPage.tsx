import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CertificateService } from '@/services/certificateService';
import { CheckCircle, XCircle, Search, ExternalLink } from 'lucide-react';

export default function CertificateVerificationPage() {
  const [certificateId, setCertificateId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
    certificateUrl?: string;
  } | null>(null);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      toast({
        title: "Certificate ID Required",
        description: "Please enter a certificate ID to verify.",
        variant: "destructive"
      });
      return;
    }

    try {
      setVerifying(true);
      setVerificationResult(null);

      const isValid = await CertificateService.verifyCertificate(certificateId.trim());
      
      if (isValid) {
        setVerificationResult({
          isValid: true,
          message: "This certificate is valid and authentic.",
          certificateUrl: CertificateService.getCertificateUrl(certificateId.trim())
        });
      } else {
        setVerificationResult({
          isValid: false,
          message: "This certificate could not be verified. It may not exist or may have been revoked."
        });
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerificationResult({
        isValid: false,
        message: "An error occurred while verifying the certificate. Please try again."
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleViewCertificate = () => {
    if (verificationResult?.certificateUrl) {
      window.open(verificationResult.certificateUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Certificate Verification</h1>
          <p className="text-lg text-gray-600">
            Verify the authenticity of a Tuterra internship completion certificate
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Verify Certificate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="certificateId" className="text-sm font-medium">
                Certificate ID
              </label>
              <Input
                id="certificateId"
                placeholder="Enter certificate ID (e.g., TUT-12345-ABCDE)"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              />
              <p className="text-xs text-gray-500">
                The certificate ID can be found at the bottom of any Tuterra certificate.
              </p>
            </div>

            <Button 
              onClick={handleVerify}
              disabled={verifying}
              className="w-full"
            >
              {verifying ? 'Verifying...' : 'Verify Certificate'}
            </Button>

            {verificationResult && (
              <div className={`p-4 rounded-lg border ${
                verificationResult.isValid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {verificationResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      verificationResult.isValid ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {verificationResult.isValid ? 'Certificate Verified' : 'Verification Failed'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {verificationResult.message}
                    </p>
                    {verificationResult.isValid && verificationResult.certificateUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewCertificate}
                        className="mt-3 text-green-700 border-green-300 hover:bg-green-100"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            All Tuterra certificates are digitally signed and can be verified through this system.
          </p>
          <p className="mt-2">
            For questions about certificate verification, contact{' '}
            <a href="mailto:support@tuterra.ai" className="text-primary-blue hover:underline">
              support@tuterra.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
