import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, User, X, Plus } from "lucide-react";
import { InternshipPreviewData } from "@/pages/InternshipPreview";

interface JobDescriptionStepProps {
  jobDescription: string;
  useExperienceBasedTailoring: boolean;
  education: string;
  fieldOfStudy: string;
  experienceYears: number;
  certifications: string[];
  skills: string[];
  careerGoal: string;
  onChange: (data: Partial<InternshipPreviewData>) => void;
}

const EDUCATION_LEVELS = [
  "High School",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Associate Degree",
  "Professional Certificate",
  "Other"
];

export function JobDescriptionStep({
  jobDescription,
  useExperienceBasedTailoring,
  education,
  fieldOfStudy,
  experienceYears,
  certifications,
  skills,
  careerGoal,
  onChange
}: JobDescriptionStepProps) {
  const [newCertification, setNewCertification] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const handleAddCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      onChange({ certifications: [...certifications, newCertification.trim()] });
      setNewCertification("");
    }
  };

  const handleRemoveCertification = (cert: string) => {
    onChange({ certifications: certifications.filter(c => c !== cert) });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onChange({ skills: [...skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    onChange({ skills: skills.filter(s => s !== skill) });
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'certification' | 'skill') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'certification') {
        handleAddCertification();
      } else {
        handleAddSkill();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Tell us about your background
        </h2>
        <p className="text-gray-600">
          Paste a job description you'd like to replicate, or let us tailor based on your experience
        </p>
      </div>

      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Job Description Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <Label htmlFor="job-description" className="text-sm font-medium">
              Job Description (Optional)
            </Label>
          </div>
          <Textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => onChange({ jobDescription: e.target.value })}
            placeholder="Paste a job description you'd like your internship to replicate..."
            className="min-h-[120px] resize-none"
            disabled={useExperienceBasedTailoring}
          />
        </div>

        {/* Checkbox for Experience-Based Tailoring */}
        <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
          <Checkbox
            id="experience-tailoring"
            checked={useExperienceBasedTailoring}
            onCheckedChange={(checked) => {
              onChange({ 
                useExperienceBasedTailoring: !!checked,
                jobDescription: checked ? "" : jobDescription
              });
            }}
          />
          <Label htmlFor="experience-tailoring" className="text-sm font-medium cursor-pointer">
            I don't have a specific job — tailor my internship based on my background
          </Label>
        </div>

        {/* Experience-Based Fields */}
        <AnimatePresence>
          {useExperienceBasedTailoring && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 p-6 bg-white rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-medium text-gray-900">Your Background</h3>
              </div>

              {/* Education Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="education" className="text-sm font-medium">
                    Education Level *
                  </Label>
                  <Select value={education} onValueChange={(value) => onChange({ education: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="field-of-study" className="text-sm font-medium">
                    Field of Study *
                  </Label>
                  <Input
                    id="field-of-study"
                    value={fieldOfStudy}
                    onChange={(e) => onChange({ fieldOfStudy: e.target.value })}
                    placeholder="e.g., Computer Science, Business, Psychology..."
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Years of Experience */}
              <div>
                <Label htmlFor="experience-years" className="text-sm font-medium">
                  Years of Work Experience
                </Label>
                <Input
                  id="experience-years"
                  type="number"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => onChange({ experienceYears: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="mt-2 max-w-[120px]"
                />
              </div>

              {/* Certifications */}
              <div>
                <Label className="text-sm font-medium">Professional Certifications</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="e.g., PMP, AWS Certified, Google Analytics..."
                      onKeyPress={(e) => handleKeyPress(e, 'certification')}
                    />
                    <Button
                      type="button"
                      onClick={handleAddCertification}
                      disabled={!newCertification.trim()}
                      size="sm"
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {certifications.map((cert) => (
                        <Badge
                          key={cert}
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 pr-1"
                        >
                          {cert}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 ml-1 hover:bg-amber-200"
                            onClick={() => handleRemoveCertification(cert)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label className="text-sm font-medium">Skills or Tools</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g., Python, Excel, Photoshop, Public Speaking..."
                      onKeyPress={(e) => handleKeyPress(e, 'skill')}
                    />
                    <Button
                      type="button"
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim()}
                      size="sm"
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-green-100 text-green-800 pr-1"
                        >
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 ml-1 hover:bg-green-200"
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Career Goal */}
              <div>
                <Label htmlFor="career-goal" className="text-sm font-medium">
                  Career Goal or Interest (Optional)
                </Label>
                <Input
                  id="career-goal"
                  value={careerGoal}
                  onChange={(e) => onChange({ careerGoal: e.target.value })}
                  placeholder="e.g., Become a product manager, Start my own company..."
                  className="mt-2"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        {(jobDescription || useExperienceBasedTailoring) && (
          <motion.div 
            className="bg-purple-50 p-4 rounded-lg border border-purple-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-sm font-medium text-purple-900 mb-2">
              Tailoring Approach:
            </h4>
            {jobDescription && !useExperienceBasedTailoring && (
              <p className="text-sm text-purple-800">
                Using provided job description to create realistic internship tasks
              </p>
            )}
            {useExperienceBasedTailoring && (
              <p className="text-sm text-purple-800">
                Creating personalized internship based on your education, experience, and goals
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 