
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, BarChart2 } from "lucide-react";
import jsPDF from "jspdf";
import { FeedbackResponse } from "@/types/interview";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface InterviewCompletedProps {
  transcript: Array<{id: string; role: string; text: string}>;
  isGeneratingFeedback?: boolean;
  feedback?: string;
  detailedFeedback?: FeedbackResponse;
  onRegenerateFeedback?: () => void;
}

export const InterviewCompleted = ({ 
  transcript, 
  isGeneratingFeedback = false,
  feedback,
  detailedFeedback,
  onRegenerateFeedback
}: InterviewCompletedProps) => {
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'strengths' | 'improvements' | 'details'>('summary');

  const downloadTranscript = () => {
    setDownloading(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;
      
      // Add title
      doc.setFontSize(16);
      doc.text("Interview Transcript and Feedback", margin, y);
      y += 15;
      
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
      y += 15;
      
      // Add transcript section
      doc.setFontSize(14);
      doc.text("Transcript", margin, y);
      y += 10;
      
      // Add messages
      doc.setFontSize(10);
      
      transcript.forEach((message) => {
        const roleText = message.role === 'ai' ? "Interviewer" : "You";
        const text = `${roleText}: ${message.text}`;
        
        // Text wrapping
        const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin);
        
        // Check if we need a new page
        if (y + splitText.length * 7 > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = 20;
        }
        
        // Add the text
        doc.text(splitText, margin, y);
        y += splitText.length * 7 + 5;
      });
      
      // Add detailed feedback if available
      if (detailedFeedback || feedback) {
        // Add a new page for feedback
        doc.addPage();
        y = 20;
        
        doc.setFontSize(14);
        doc.text("Interview Feedback", margin, y);
        y += 10;
        
        doc.setFontSize(10);
        
        // Add detailed scores if available
        if (detailedFeedback?.categoryScores) {
          y += 10;
          doc.text("Category Scores:", margin, y);
          y += 8;
          
          Object.entries(detailedFeedback.categoryScores).forEach(([category, score]) => {
            doc.text(`${category}: ${score}%`, margin + 10, y);
            y += 6;
          });
          
          y += 8;
        }
        
        // Add strengths
        if (detailedFeedback?.strengths && detailedFeedback.strengths.length > 0) {
          y += 8;
          doc.text("Strengths:", margin, y);
          y += 8;
          
          detailedFeedback.strengths.forEach((strength, index) => {
            doc.text(`${index + 1}. ${strength}`, margin + 10, y);
            y += 6;
          });
          
          y += 8;
        }
        
        // Add improvements
        if (detailedFeedback?.improvements && detailedFeedback.improvements.length > 0) {
          y += 8;
          doc.text("Areas for Improvement:", margin, y);
          y += 8;
          
          detailedFeedback.improvements.forEach((improvement, index) => {
            doc.text(`${index + 1}. ${improvement}`, margin + 10, y);
            y += 6;
          });
          
          y += 8;
        }
        
        // Add detailed feedback text
        const feedbackText = detailedFeedback?.detailedFeedback || feedback || "";
        y += 8;
        doc.text("Detailed Feedback:", margin, y);
        y += 8;
        
        const splitFeedback = doc.splitTextToSize(feedbackText, pageWidth - 2 * margin);
        
        // Check if we need a new page
        if (y + splitFeedback.length * 7 > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(splitFeedback, margin, y);
      }
      
      doc.save("interview-transcript.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  const renderScoreSection = () => {
    if (!detailedFeedback?.overallScore && !detailedFeedback?.categoryScores) {
      return null;
    }
    
    return (
      <Card className="p-4 mb-4">
        {detailedFeedback?.overallScore && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Overall Score</h4>
            <div className="flex items-center gap-2">
              <Progress value={detailedFeedback.overallScore} className="h-2" />
              <span className="text-sm font-semibold">{detailedFeedback.overallScore}%</span>
            </div>
          </div>
        )}
        
        {detailedFeedback?.categoryScores && (
          <div>
            <h4 className="text-sm font-medium mb-2">Category Scores</h4>
            {Object.entries(detailedFeedback.categoryScores).map(([category, score]) => (
              <div key={category} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize">{category}</span>
                  <span>{score}%</span>
                </div>
                <Progress value={score} className="h-1.5" />
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };
  
  const renderKeywords = () => {
    if (!detailedFeedback?.keywords) {
      return null;
    }
    
    return (
      <div className="mt-4">
        {detailedFeedback.keywords.used && detailedFeedback.keywords.used.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Keywords Used:</h4>
            <div className="flex flex-wrap gap-1">
              {detailedFeedback.keywords.used.map((keyword, i) => (
                <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {detailedFeedback.keywords.missed && detailedFeedback.keywords.missed.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Keywords Missed:</h4>
            <div className="flex flex-wrap gap-1">
              {detailedFeedback.keywords.missed.map((keyword, i) => (
                <span key={i} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <>
            {renderScoreSection()}
            <div className="text-left whitespace-pre-line">
              {detailedFeedback?.detailedFeedback || feedback || "No feedback available."}
            </div>
            {renderKeywords()}
          </>
        );
      case 'strengths':
        return (
          <div className="text-left">
            <h4 className="font-medium mb-2">Strengths:</h4>
            {detailedFeedback?.strengths && detailedFeedback.strengths.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {detailedFeedback.strengths.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No specific strengths identified.</p>
            )}
          </div>
        );
      case 'improvements':
        return (
          <div className="text-left">
            <h4 className="font-medium mb-2">Areas for Improvement:</h4>
            {detailedFeedback?.improvements && detailedFeedback.improvements.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {detailedFeedback.improvements.map((improvement, i) => (
                  <li key={i}>{improvement}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No specific areas for improvement identified.</p>
            )}
          </div>
        );
      case 'details':
        return (
          <div className="text-left">
            <h4 className="font-medium mb-2">Interview Transcript:</h4>
            <div className="bg-muted p-3 rounded-md max-h-[200px] overflow-y-auto text-sm">
              {transcript.map((message, i) => (
                <div key={i} className="mb-2">
                  <span className="font-semibold">{message.role === 'ai' ? 'Interviewer: ' : 'You: '}</span>
                  {message.text}
                </div>
              ))}
            </div>
          </div>
        );
    }
  };
  
  return (
    <motion.div
      key="completed"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-4 p-4 w-full max-w-[90%] md:max-w-2xl mx-auto"
    >
      <h3 className="text-xl font-medium mb-2">Interview Completed!</h3>
      
      {isGeneratingFeedback ? (
        <>
          <div className="flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Analyzing your interview responses...
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="flex border-b border-gray-200 mb-4">
            <button 
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'summary' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('summary')}
            >
              Summary
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'strengths' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('strengths')}
            >
              Strengths
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'improvements' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('improvements')}
            >
              Improve
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
              onClick={() => setActiveTab('details')}
            >
              Transcript
            </button>
          </div>
          
          <div className="mb-6">
            {renderContent()}
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={downloadTranscript}
              disabled={downloading}
            >
              {downloading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download Report
            </Button>
            
            {onRegenerateFeedback && (
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={onRegenerateFeedback}
                disabled={isGeneratingFeedback}
              >
                {isGeneratingFeedback ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate Feedback
              </Button>
            )}
            
            <Button 
              variant="default" 
              className="gap-2"
              onClick={() => window.location.reload()}
            >
              <BarChart2 className="h-4 w-4" />
              New Interview
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
};
