import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Lightbulb, 
  Target, 
  ExternalLink,
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface CompanyApplication {
  id: string;
  companyName: string;
  position: string;
  companyUrl: string;
  researchNotes: string;
  coverLetter: string;
  completed: boolean;
}


interface ArtifactReference {
  id: string;
  title: string;
  description: string;
  skillTags: string[];
  url?: string;
}

interface LetterTemplateEditorProps {
  company: CompanyApplication;
  onUpdate: (field: keyof CompanyApplication, value: string) => void;
  availableArtifacts: ArtifactReference[];
  completedTasks: any[];
}

export function LetterTemplateEditor({ 
  company, 
  onUpdate, 
  availableArtifacts,
  completedTasks 
}: LetterTemplateEditorProps) {
  const [selectedArtifacts, setSelectedArtifacts] = useState<string[]>([]);
  const [showGuidance, setShowGuidance] = useState(true);
  const [wordCounts, setWordCounts] = useState({ total: 0, target: { min: 300, max: 450 } });

  // Update word count when letter changes
  useEffect(() => {
    const wordCount = company.coverLetter.split(/\s+/).filter(word => word.length > 0).length;
    setWordCounts(prev => ({ ...prev, total: wordCount }));
  }, [company.coverLetter]);

  const toggleArtifact = (artifactId: string) => {
    setSelectedArtifacts(prev => 
      prev.includes(artifactId) 
        ? prev.filter(id => id !== artifactId)
        : [...prev, artifactId]
    );
  };

  const insertSuggestion = (suggestion: string) => {
    const currentLetter = company.coverLetter;
    const newLetter = currentLetter + (currentLetter ? '\n\n' : '') + suggestion;
    onUpdate('coverLetter', newLetter);
  };

  const getWordCountStatus = () => {
    if (wordCounts.total < wordCounts.target.min) return { status: 'under', color: 'text-orange-600' };
    if (wordCounts.total > wordCounts.target.max) return { status: 'over', color: 'text-red-600' };
    return { status: 'good', color: 'text-green-600' };
  };

  const wordCountStatus = getWordCountStatus();

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="text-sm font-medium">Cover Letter</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuidance(!showGuidance)}
            className="text-xs"
          >
            {showGuidance ? 'Hide' : 'Show'} Writing Tips
          </Button>
          <div className="text-sm">
            <span className={wordCountStatus.color}>
              {wordCounts.total} words
            </span>
            <span className="text-muted-foreground">
              {' '}/ {wordCounts.target.min}-{wordCounts.target.max} target
            </span>
          </div>
          {wordCountStatus.status === 'good' && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          {wordCountStatus.status !== 'good' && (
            <AlertCircle className="h-4 w-4 text-orange-600" />
          )}
        </div>
      </div>

      {/* Main Letter Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Letter Writing Area */}
        <div className="lg:col-span-2">
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Cover Letter for {company.companyName} - {company.position}
            </label>
            <Textarea
              placeholder={`Write your personalized cover letter for ${company.companyName}. Use the writing tips on the right for guidance on what to include in each section.`}
              value={company.coverLetter}
              onChange={(e) => onUpdate('coverLetter', e.target.value)}
              className="min-h-[400px] font-mono text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Guidance Sidebar */}
        {showGuidance && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Writing Tips & Suggestions
            </h3>
            {/* Opening Suggestions */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Opening: Why This Company?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Hook them with specific knowledge about {company.companyName || 'the company'}
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto p-2 text-left justify-start"
                    onClick={() => insertSuggestion(`I'm excited about ${company.companyName || '[Company Name]'} because of your commitment to [specific mission/value]. Your recent [initiative/product] aligns with my passion for [relevant area].`)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add mission-focused opening
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto p-2 text-left justify-start"
                    onClick={() => insertSuggestion(`After researching ${company.companyName || '[Company Name]'}, I'm impressed by [specific recent news/achievement]. This opportunity to contribute to [specific team/project] excites me.`)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add research-based opening
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Skills + Evidence Suggestions */}
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-green-500" />
                  Skills + Evidence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Connect internship experience to this role with specific examples
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto p-2 text-left justify-start"
                    onClick={() => insertSuggestion(`Through my virtual internship, I developed [skill 1], [skill 2], and [skill 3]. For example, in my [project/task name], I [specific action] which resulted in [outcome].`)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add skills paragraph
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto p-2 text-left justify-start"
                    onClick={() => insertSuggestion(`My experience with [specific tool/process] directly relates to your [job requirement]. I successfully [specific achievement] during my internship.`)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add relevant experience
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Value Proposition Suggestions */}
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-500" />
                  Value Proposition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Show how you'll solve their problems or advance their goals
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto p-2 text-left justify-start"
                    onClick={() => insertSuggestion(`Given your focus on [company priority], I can contribute by [specific way 1] and [specific way 2]. My experience positions me to help [desired outcome].`)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add value statement
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto p-2 text-left justify-start"
                    onClick={() => insertSuggestion(`I'm particularly excited about [specific project/initiative] mentioned in the job posting. My background in [relevant area] would allow me to [specific contribution].`)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add project-specific value
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Closing Suggestions */}
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-amber-500" />
                  Professional Closing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  End with enthusiasm and clear next steps
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto p-2 text-left justify-start"
                    onClick={() => insertSuggestion(`I'd welcome the opportunity to discuss how my skills and internship experience can support ${company.companyName || '[Company Name]'}'s continued success. Thank you for your consideration.`)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add professional closing
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto p-2 text-left justify-start"
                    onClick={() => insertSuggestion(`I'm excited about the possibility of contributing to your team and would appreciate the chance to discuss this role further. I look forward to hearing from you.`)}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Add enthusiastic closing
                  </Button>
                </div>
              </CardContent>
            </Card>

              <Card className="border-l-4 border-l-indigo-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Reference Your Work
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Add specific examples from your internship artifacts
                  </p>
                  <div className="space-y-2">
                    {availableArtifacts.slice(0, 3).map((artifact) => (
                      <Button
                        key={artifact.id}
                        variant="outline"
                        size="sm"
                        className="text-xs h-auto p-2 text-left justify-start w-full"
                        onClick={() => insertSuggestion(`In my "${artifact.title}" project, I [describe specific action] which resulted in [outcome]. This demonstrates my ability to [relevant skill].`)}
                      >
                        <Plus className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">Reference: {artifact.title}</span>
                      </Button>
                    ))}
                    {availableArtifacts.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{availableArtifacts.length - 3} more artifacts available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* General Writing Tips */}
            <Card className="bg-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Writing Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• Be specific - mention company names, projects, and outcomes</li>
                  <li>• Use active voice and strong action verbs</li>
                  <li>• Reference 2-3 internship artifacts with concrete examples</li>
                  <li>• Show enthusiasm but remain professional</li>
                  <li>• Aim for 300-450 words total</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
