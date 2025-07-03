
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Plus, X, BookOpen, Briefcase, Target, Award, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobDescriptionStepProps {
  jobDescription: string;
  useExperienceBasedTailoring: boolean;
  education: string;
  fieldOfStudy: string;
  experienceYears: number;
  certifications: string[];
  skills: string[];
  careerGoal: string;
  onChange: (data: any) => void;
}

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

  const handleExperienceYearsChange = (increment: boolean) => {
    const newValue = increment 
      ? Math.min(experienceYears + 1, 20)
      : Math.max(experienceYears - 1, 0);
    onChange({ experienceYears: newValue });
  };

  const addCertification = () => {
    if (newCertification.trim() && certifications.length < 5) {
      onChange({ certifications: [...certifications, newCertification.trim()] });
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    onChange({ certifications: certifications.filter((_, i) => i !== index) });
  };

  const addSkill = () => {
    if (newSkill.trim() && skills.length < 8) {
      onChange({ skills: [...skills, newSkill.trim()] });
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    onChange({ skills: skills.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
          Tell us about your background
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          This helps us create a more personalized internship experience
        </p>
      </div>

      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Segmented Control for approach selection */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Choose Your Approach
              </h4>
              <p className="text-xs md:text-sm text-blue-800">
                Select how you'd like us to customize your internship experience
              </p>
            </div>
            
            <div className="inline-flex rounded-full bg-gray-200 p-1 self-start">
              <button
                type="button"
                onClick={() => onChange({ useExperienceBasedTailoring: true })}
                className={cn(
                  "px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 touch-manipulation",
                  "sm:px-4 sm:py-2",
                  useExperienceBasedTailoring
                    ? "bg-white shadow-sm text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                By Experience
              </button>
              <button
                type="button"
                onClick={() => onChange({ useExperienceBasedTailoring: false })}
                className={cn(
                  "px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 touch-manipulation",
                  "sm:px-4 sm:py-2",
                  !useExperienceBasedTailoring
                    ? "bg-white shadow-sm text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                By Job Description
              </button>
            </div>
          </div>
        </div>

        {useExperienceBasedTailoring ? (
          // Experience-based form
          <div className="space-y-6">
            {/* Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="education" className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Education Level *
                </Label>
                <select
                  id="education"
                  value={education}
                  onChange={(e) => onChange({ education: e.target.value })}
                  className="mt-2 w-full h-10 px-3 py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="field-of-study" className="text-sm font-medium">
                  Field of Study *
                </Label>
                <Input
                  id="field-of-study"
                  value={fieldOfStudy}
                  onChange={(e) => onChange({ fieldOfStudy: e.target.value })}
                  placeholder="e.g., Computer Science, Business, Engineering..."
                  className="mt-2 text-sm md:text-base"
                  required
                />
              </div>
            </div>

            {/* Work Experience */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-green-600" />
                Years of Work Experience
              </Label>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-md bg-white">
                  <button
                    type="button"
                    onClick={() => handleExperienceYearsChange(false)}
                    disabled={experienceYears <= 0}
                    className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md border-r border-gray-300 touch-manipulation"
                  >
                    <span className="text-lg font-medium">−</span>
                  </button>
                  <div className="h-10 px-4 flex items-center justify-center min-w-[60px] text-sm md:text-base font-medium">
                    {experienceYears}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExperienceYearsChange(true)}
                    disabled={experienceYears >= 20}
                    className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md border-l border-gray-300 touch-manipulation"
                  >
                    <span className="text-lg font-medium">+</span>
                  </button>
                </div>
                <span className="text-xs md:text-sm text-gray-500">
                  years {experienceYears === 0 && "(including internships)"}
                </span>
              </div>
            </div>

            {/* Certifications */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-600" />
                Certifications (Optional)
              </Label>
              <div className="mt-2 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="e.g., Google Analytics, AWS Cloud Practitioner..."
                    className="flex-1 text-sm md:text-base"
                    onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                  />
                  <Button
                    type="button"
                    onClick={addCertification}
                    disabled={!newCertification.trim() || certifications.length >= 5}
                    size="sm"
                    className="shrink-0 touch-manipulation"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((cert, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 pr-1"
                      >
                        {cert}
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="ml-1 hover:bg-yellow-200 rounded-full p-0.5 touch-manipulation"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {certifications.length}/5 certifications added
                </p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <Wrench className="h-4 w-4 text-purple-600" />
                Skills (Optional)
              </Label>
              <div className="mt-2 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g., Python, Project Management, Data Analysis..."
                    className="flex-1 text-sm md:text-base"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    disabled={!newSkill.trim() || skills.length >= 8}
                    size="sm"
                    className="shrink-0 touch-manipulation"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-purple-100 text-purple-800 pr-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="ml-1 hover:bg-purple-200 rounded-full p-0.5 touch-manipulation"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  {skills.length}/8 skills added
                </p>
              </div>
            </div>

            {/* Career Goal */}
            <div>
              <Label htmlFor="career-goal" className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-red-600" />
                Career Goal (Optional)
              </Label>
              <Textarea
                id="career-goal"
                value={careerGoal}
                onChange={(e) => onChange({ careerGoal: e.target.value })}
                placeholder="What do you hope to achieve in your career? This helps us align tasks with your aspirations..."
                className="mt-2 text-sm md:text-base min-h-[80px] resize-none"
                maxLength={300}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Help us understand your career aspirations
                </p>
                <span className="text-xs text-gray-400">
                  {careerGoal.length}/300
                </span>
              </div>
            </div>
          </div>
        ) : (
          // Simple job description approach
          <div>
            <Label htmlFor="job-description" className="text-sm font-medium">
              Job Description (Optional)
            </Label>
            <Textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => onChange({ jobDescription: e.target.value })}
              placeholder="Paste a job description you're interested in, and we'll tailor the internship to match those requirements and responsibilities..."
              className="mt-2 text-sm md:text-base min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-2">
              <p className="text-xs text-gray-500">
                This helps create more relevant tasks and experiences
              </p>
              <span className="text-xs text-gray-400 self-end sm:self-auto">
                {jobDescription.length}/2000
              </span>
            </div>
          </div>
        )}

        {/* Info card */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-900 mb-1">
                {useExperienceBasedTailoring ? "Personalized Experience" : "Job-Focused Approach"}
              </h4>
              <p className="text-xs md:text-sm text-amber-800">
                {useExperienceBasedTailoring 
                  ? "We'll create tasks that match your education level, experience, and career goals for maximum learning impact."
                  : "Provide a job description to get tasks and challenges that mirror real workplace responsibilities."
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
