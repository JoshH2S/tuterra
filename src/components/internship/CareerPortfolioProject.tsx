import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, 
  Building, 
  FileText, 
  CheckCircle, 
  Target, 
  Lightbulb,
  Search,
  PenTool,
  Package,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LetterTemplateEditor } from "./LetterTemplateEditor";

interface CareerPortfolioProjectProps {
  sessionId: string;
  userId: string;
  jobTitle: string;
  industry: string;
  completedTasks: any[];
}

interface CompanyApplication {
  id: string;
  companyName: string;
  position: string;
  companyUrl: string;
  researchNotes: string;
  coverLetter: string;
  completed: boolean;
}

export function CareerPortfolioProject({ 
  sessionId, 
  userId, 
  jobTitle, 
  industry, 
  completedTasks 
}: CareerPortfolioProjectProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [reflectionEssay, setReflectionEssay] = useState("");
  const [companies, setCompanies] = useState<CompanyApplication[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Initialize with empty company slots
  useEffect(() => {
    if (companies.length === 0) {
      const initialCompanies: CompanyApplication[] = Array.from({ length: 5 }, (_, i) => ({
        id: `company-${i + 1}`,
        companyName: "",
        position: "",
        companyUrl: "",
        researchNotes: "",
        coverLetter: "",
        completed: false
      }));
      setCompanies(initialCompanies);
    }
  }, [companies.length]);

  const updateCompany = (id: string, field: keyof CompanyApplication, value: string | boolean) => {
    setCompanies(prev => prev.map(company => 
      company.id === id ? { ...company, [field]: value } : company
    ));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const calculateProgress = () => {
    let completed = 0;
    let total = 6; // 1 reflection + 5 companies

    // Check reflection
    if (reflectionEssay.length > 200) completed += 1;

    // Check companies
    companies.forEach(company => {
      if (company.companyName && company.coverLetter.length > 200) {
        completed += 1;
      }
    });

    return (completed / total) * 100;
  };

  const progress = calculateProgress();

  const coverLetterTemplate = `[Your Name]
[Your Address]
[City, State, Zip]
[Email] | [Phone] | [LinkedIn]
[Date]

Hiring Manager
[Company Name]
[Company Address]

Dear [Hiring Manager's Name],

Opening — Why this company excites me
I am deeply inspired by [Company Name]'s commitment to [specific mission, product, or value]. The opportunity to contribute to a team that [describe unique aspect of the company] excites me, as I am passionate about applying my skills to real-world challenges that align with your mission.

Body 1 — Skills from internship + task evidence
Through my recent virtual internship experience, I developed practical skills in [skill 1], [skill 2], and [skill 3]. For example, I completed a task that involved [specific task], which allowed me to strengthen my ability to [skill outcome]. I also [second task → second skill outcome], which mirrors the type of work your team does.

Body 2 — How I'd add value specifically to this company's role
I am eager to bring these skills to [Company Name]. I noticed that your team is currently focused on [specific project, product, or initiative], and my experience with [related skill/task] would enable me to add immediate value. Whether it's [skill application 1] or [skill application 2], I am confident that I can contribute meaningfully to your goals.

Closing — Enthusiasm + call to connect
I would welcome the chance to discuss how my skills and internship experience can support your team's success. Thank you for considering my application. I look forward to the possibility of contributing to [Company Name].

Sincerely,
[Your Full Name]`;

  const skillMappingGuide = [
    {
      internshipTask: "Technical documentation writing",
      realWorldApp: "Internal process docs, compliance paperwork, user guides"
    },
    {
      internshipTask: "Market research and analysis",
      realWorldApp: "Competitive analysis, product strategy briefs, market reports"
    },
    {
      internshipTask: "Data analysis and reporting",
      realWorldApp: "Business intelligence reporting, dashboard preparation, KPI tracking"
    },
    {
      internshipTask: "Email campaign creation",
      realWorldApp: "Customer outreach, newsletter creation, CRM workflows"
    },
    {
      internshipTask: "Team collaboration exercises",
      realWorldApp: "Cross-functional projects, async communication, agile teamwork"
    },
    {
      internshipTask: "Presentation development",
      realWorldApp: "Client presentations, investor communications, stakeholder updates"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-primary" />
                Career Application Portfolio
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Transform your {jobTitle} internship into career-ready application materials
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="reflection" className="text-xs">Reflection</TabsTrigger>
          <TabsTrigger value="research" className="text-xs">Research</TabsTrigger>
          <TabsTrigger value="applications" className="text-xs">Applications</TabsTrigger>
          <TabsTrigger value="submit" className="text-xs">Submit</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Project Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Create a professional portfolio that showcases your {jobTitle} internship experience 
                through tailored application materials for real companies. This isn't just an assignment—
                it's career preparation that results in 5 ready-to-send cover letters.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-blue-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium">Reflective Essay</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Synthesize your learning and growth through the internship experience
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-green-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium">Company Research</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Research 5 real companies actively hiring for {jobTitle} roles
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-purple-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <PenTool className="h-4 w-4 text-purple-600" />
                    <h4 className="font-medium">Tailored Applications</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Write personalized cover letters connecting your internship to each role
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills Mapping Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Skill → Real World Mapping Guide
              </CardTitle>
              <CardDescription>
                Connect your internship tasks to real workplace applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {skillMappingGuide.map((mapping, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/20">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{mapping.internshipTask}</div>
                      <div className="text-xs text-muted-foreground mt-1">→ {mapping.realWorldApp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reflection Tab */}
        <TabsContent value="reflection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Reflective Essay
              </CardTitle>
              <CardDescription>
                Reflect on your growth, surprises, and how you'll apply your new skills
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">3 Things That Surprised Me</h4>
                  <p className="text-xs text-muted-foreground">
                    What did you learn that you didn't expect? How did it change your perspective?
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Applying New Skills</h4>
                  <p className="text-xs text-muted-foreground">
                    How will you use these skills in a real job? Be specific with examples.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Challenges & Growth</h4>
                  <p className="text-xs text-muted-foreground">
                    What challenges did you face? How did working through them help you grow?
                  </p>
                </div>
              </div>

              <Textarea
                placeholder="Write your reflective essay here. Address the three prompts above and aim for 800-1200 words. This will be part of your final portfolio and demonstrates your self-awareness and professional growth..."
                value={reflectionEssay}
                onChange={(e) => setReflectionEssay(e.target.value)}
                className="min-h-[400px]"
              />
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{reflectionEssay.length} characters</span>
                <span>Target: 800-1200 words (~4000-6000 characters)</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Research Tab */}
        <TabsContent value="research" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-green-500" />
                Company Research
              </CardTitle>
              <CardDescription>
                Research 5 real companies currently hiring for {jobTitle} roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Research Prompts */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between mb-4">
                    <span>Research Guide & Prompts</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg bg-blue-50/50">
                      <h4 className="font-medium text-sm mb-2">Company Values & Mission</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Check their About/Mission page</li>
                        <li>• What values stand out?</li>
                        <li>• How do they describe their culture?</li>
                      </ul>
                    </div>
                    <div className="p-3 border rounded-lg bg-green-50/50">
                      <h4 className="font-medium text-sm mb-2">Current Initiatives</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Search recent news/press releases</li>
                        <li>• New products or market expansion?</li>
                        <li>• How could your skills contribute?</li>
                      </ul>
                    </div>
                    <div className="p-3 border rounded-lg bg-purple-50/50">
                      <h4 className="font-medium text-sm mb-2">Role Requirements</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Look at current job postings</li>
                        <li>• What skills do they emphasize?</li>
                        <li>• Match with your internship experience</li>
                      </ul>
                    </div>
                    <div className="p-3 border rounded-lg bg-amber-50/50">
                      <h4 className="font-medium text-sm mb-2">Employee Insights</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Check LinkedIn for current employees</li>
                        <li>• What skills/projects do they highlight?</li>
                        <li>• Company culture indicators?</li>
                      </ul>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Company Research Forms */}
              <div className="space-y-4">
                {companies.map((company, index) => (
                  <Card key={company.id} className="border-l-4 border-l-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Company #{index + 1}</CardTitle>
                        {company.companyName && company.researchNotes && (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Research Complete
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium">Company Name</label>
                          <Input
                            placeholder="e.g., Microsoft, Salesforce, HubSpot"
                            value={company.companyName}
                            onChange={(e) => updateCompany(company.id, 'companyName', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Position Title</label>
                          <Input
                            placeholder={`e.g., Junior ${jobTitle}, ${jobTitle} Associate`}
                            value={company.position}
                            onChange={(e) => updateCompany(company.id, 'position', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Company Website/Career Page</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://company.com/careers"
                            value={company.companyUrl}
                            onChange={(e) => updateCompany(company.id, 'companyUrl', e.target.value)}
                          />
                          {company.companyUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={company.companyUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Research Notes</label>
                        <Textarea
                          placeholder="Document your research: company values, recent news, culture insights, specific projects/initiatives, job requirements, employee backgrounds, etc."
                          value={company.researchNotes}
                          onChange={(e) => updateCompany(company.id, 'researchNotes', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-purple-500" />
                Cover Letter Applications
              </CardTitle>
              <CardDescription>
                Write tailored cover letters for each company using your research
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Cover Letter Template */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between mb-4">
                    <span>Cover Letter Template & Guide</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mb-6">
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                      {coverLetterTemplate}
                    </pre>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Cover Letter Forms */}
              <div className="space-y-6">
                {companies.map((company, index) => (
                  <Card key={company.id} className="border-l-4 border-l-purple-500/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Cover Letter #{index + 1}
                          {company.companyName && (
                            <span className="text-base font-normal text-muted-foreground ml-2">
                              - {company.companyName}
                            </span>
                          )}
                        </CardTitle>
                        {company.coverLetter.length > 200 && (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {company.companyName ? (
                        <LetterTemplateEditor
                          company={company}
                          onUpdate={updateCompany}
                          availableArtifacts={[]} // This would be populated with actual task artifacts
                          completedTasks={completedTasks}
                        />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Complete the company research first to write the cover letter
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submit Tab */}
        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-500" />
                Final Portfolio Package
              </CardTitle>
              <CardDescription>
                Review and submit your complete career application portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Portfolio Contents Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Portfolio Contents</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {reflectionEssay.length > 200 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 border rounded-full" />
                      )}
                      <span className="text-sm">Reflective Essay</span>
                    </div>
                    {companies.map((company, index) => (
                      <div key={company.id} className="flex items-center gap-2">
                        {company.companyName && company.coverLetter.length > 200 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 border rounded-full" />
                        )}
                        <span className="text-sm">
                          Company #{index + 1} Application
                          {company.companyName && ` (${company.companyName})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50/50">
                  <h4 className="font-medium mb-3">What You'll Receive</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Professional PDF portfolio package</li>
                    <li>• 5 ready-to-send cover letters</li>
                    <li>• Company research summaries</li>
                    <li>• Skills-based internship overview</li>
                    <li>• Professional development reflection</li>
                    <li>• LinkedIn-ready content</li>
                  </ul>
                </div>
              </div>

              {progress >= 100 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Portfolio Complete!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your career application portfolio is ready for submission.
                  </p>
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Submit Final Portfolio
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl font-bold text-primary mb-2">{Math.round(progress)}%</div>
                  <p className="text-muted-foreground mb-4">
                    Complete all sections to submit your portfolio
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Missing: {progress < 100 && (
                      <span>
                        {reflectionEssay.length <= 200 && "Reflective Essay"}
                        {companies.filter(c => !c.companyName || c.coverLetter.length <= 200).length > 0 && 
                          `, ${companies.filter(c => !c.companyName || c.coverLetter.length <= 200).length} Company Applications`
                        }
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
