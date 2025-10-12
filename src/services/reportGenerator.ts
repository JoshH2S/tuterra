import jsPDF from 'jspdf';
import { UserSkillProgress, Skill, SKILL_CATEGORIES } from '@/types/skills';

interface ReportData {
  participantName: string;
  jobTitle: string;
  industry: string;
  companyName: string;
  startDate: string;
  completedAt: string;
  totalXP: number;
  averageLevel: number;
  skills: Array<UserSkillProgress & { skill: Skill }>;
  taskSubmissions: Array<{
    id: string;
    task: { title: string; description: string };
    response_text: string;
    quality_rating?: number;
    timeliness_rating?: number;
    collaboration_rating?: number;
    overall_assessment?: string;
    skills_earned?: any;
    skill_analysis?: any;
    created_at: string;
  }>;
  totalTasks: number;
  completedTasks: number;
}

export class ReportGenerator {
  private static readonly COLORS = {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#F59E0B',
    text: '#374151',
    lightText: '#6B7280',
    success: '#10B981',
    background: '#F8FAFC'
  };

  static generateInternshipReport(data: ReportData): void {
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Page 1: Executive Summary
    this.addReportHeader(doc, pageWidth, data);
    this.addExecutiveSummary(doc, pageWidth, data);
    this.addSkillsOverview(doc, pageWidth, data);

    // Page 2: Skills Analysis
    doc.addPage();
    this.addPageHeader(doc, pageWidth, 'Skills Development Analysis', 2);
    this.addDetailedSkillsAnalysis(doc, pageWidth, data);

    // Page 3: Task Performance
    doc.addPage();
    this.addPageHeader(doc, pageWidth, 'Task Performance Review', 3);
    this.addTaskPerformanceAnalysis(doc, pageWidth, data);

    // Page 4: Career Development Insights
    doc.addPage();
    this.addPageHeader(doc, pageWidth, 'Career Development Insights', 4);
    this.addCareerInsights(doc, pageWidth, data);
    this.addRecommendations(doc, pageWidth, data);

    // Download
    const fileName = `${data.participantName.replace(/\s+/g, '_')}_Internship_Report.pdf`;
    doc.save(fileName);
  }

  private static addReportHeader(doc: jsPDF, pageWidth: number, data: ReportData): void {
    // Background header
    doc.setFillColor(this.COLORS.primary);
    doc.rect(0, 0, pageWidth, 50, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('Virtual Internship Report', 20, 25);

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.jobTitle} • ${data.industry}`, 20, 35);

    // Participant info
    doc.setTextColor(this.COLORS.text);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Participant: ${data.participantName}`, 20, 65);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const duration = this.calculateDuration(data.startDate, data.completedAt);
    doc.text(`Company: ${data.companyName}`, 20, 75);
    doc.text(`Duration: ${duration}`, 20, 82);
    doc.text(`Completion Date: ${new Date(data.completedAt).toLocaleDateString()}`, 20, 89);
  }

  private static addPageHeader(doc: jsPDF, pageWidth: number, title: string, pageNum: number): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(this.COLORS.primary);
    doc.text(title, 20, 25);

    // Page number
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.lightText);
    doc.text(`Page ${pageNum}`, pageWidth - 20, 20, { align: 'right' });

    // Underline
    doc.setDrawColor(this.COLORS.accent);
    doc.setLineWidth(0.5);
    doc.line(20, 30, pageWidth - 20, 30);
  }

  private static addExecutiveSummary(doc: jsPDF, pageWidth: number, data: ReportData): void {
    let yPos = 105;

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(this.COLORS.secondary);
    doc.text('Executive Summary', 20, yPos);
    yPos += 10;

    // Key metrics in boxes
    const metrics = [
      { label: 'Tasks Completed', value: `${data.completedTasks}/${data.totalTasks}`, percentage: (data.completedTasks / data.totalTasks) * 100 },
      { label: 'Total XP Earned', value: data.totalXP.toString(), subtext: 'Experience Points' },
      { label: 'Average Skill Level', value: data.averageLevel.toString(), subtext: 'Across All Skills' },
      { label: 'Skills Developed', value: data.skills.filter(s => s.current_xp > 0).length.toString(), subtext: 'Active Skills' }
    ];

    const boxWidth = (pageWidth - 60) / 2;
    const boxHeight = 25;

    metrics.forEach((metric, index) => {
      const x = 20 + (index % 2) * (boxWidth + 20);
      const y = yPos + Math.floor(index / 2) * (boxHeight + 10);

      // Box background
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, boxWidth, boxHeight, 2, 2, 'F');

      // Value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(this.COLORS.primary);
      doc.text(metric.value, x + 10, y + 12);

      // Label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(this.COLORS.text);
      doc.text(metric.label, x + 10, y + 20);

      // Subtext or percentage
      if (metric.subtext) {
        doc.setFontSize(8);
        doc.setTextColor(this.COLORS.lightText);
        doc.text(metric.subtext, x + boxWidth - 10, y + 20, { align: 'right' });
      }
    });

    yPos += 70;

    // Performance summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.text);
    doc.text('Performance Summary', 20, yPos);
    yPos += 8;

    const performanceSummary = this.generatePerformanceSummary(data);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.text);
    const summaryLines = doc.splitTextToSize(performanceSummary, pageWidth - 40);
    summaryLines.forEach((line: string) => {
      doc.text(line, 20, yPos);
      yPos += 5;
    });
  }

  private static addSkillsOverview(doc: jsPDF, pageWidth: number, data: ReportData): void {
    let yPos = 220;

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(this.COLORS.secondary);
    doc.text('Skills Overview', 20, yPos);
    yPos += 10;

    // Skills by category
    const skillsByCategory = this.groupSkillsByCategory(data.skills);

    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      if (skills.length === 0) return;

      const categoryInfo = SKILL_CATEGORIES[category as keyof typeof SKILL_CATEGORIES];
      
      // Category header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(this.COLORS.primary);
      doc.text(`${categoryInfo.name} Skills`, 20, yPos);
      yPos += 6;

      // Skills in this category
      skills.slice(0, 3).forEach(skillProgress => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(this.COLORS.text);
        
        const skillText = `• ${skillProgress.skill?.name}: Level ${skillProgress.current_level} (${skillProgress.current_xp} XP)`;
        doc.text(skillText, 25, yPos);
        yPos += 4;
      });

      yPos += 3;
    });
  }

  private static addDetailedSkillsAnalysis(doc: jsPDF, pageWidth: number, data: ReportData): void {
    let yPos = 40;

    // Top performing skills
    const topSkills = [...data.skills]
      .filter(s => s.current_xp > 0)
      .sort((a, b) => (b.current_level * 1000 + b.current_xp) - (a.current_level * 1000 + a.current_xp))
      .slice(0, 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.secondary);
    doc.text('Top Performing Skills', 20, yPos);
    yPos += 10;

    topSkills.forEach((skillProgress, index) => {
      // Skill box
      doc.setFillColor(this.COLORS.background);
      doc.roundedRect(20, yPos - 5, pageWidth - 40, 20, 2, 2, 'F');

      // Rank number
      doc.setFillColor(this.COLORS.primary);
      doc.circle(30, yPos + 5, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text((index + 1).toString(), 30, yPos + 7, { align: 'center' });

      // Skill name and level
      doc.setTextColor(this.COLORS.text);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(skillProgress.skill?.name || 'Unknown Skill', 40, yPos + 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(this.COLORS.lightText);
      doc.text(`Level ${skillProgress.current_level} • ${skillProgress.current_xp} XP • ${skillProgress.total_submissions} submissions`, 40, yPos + 10);

      yPos += 25;
    });

    yPos += 10;

    // Skills development timeline
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.secondary);
    doc.text('Skills Development Journey', 20, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.text);
    const journeyText = this.generateSkillsJourney(data);
    const journeyLines = doc.splitTextToSize(journeyText, pageWidth - 40);
    journeyLines.forEach((line: string) => {
      doc.text(line, 20, yPos);
      yPos += 5;
    });
  }

  private static addTaskPerformanceAnalysis(doc: jsPDF, pageWidth: number, data: ReportData): void {
    let yPos = 40;

    // Performance metrics summary
    const avgQuality = this.calculateAverageRating(data.taskSubmissions, 'quality_rating');
    const avgTimeliness = this.calculateAverageRating(data.taskSubmissions, 'timeliness_rating');
    const avgCollaboration = this.calculateAverageRating(data.taskSubmissions, 'collaboration_rating');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.secondary);
    doc.text('Performance Metrics', 20, yPos);
    yPos += 10;

    // Metrics bars
    const metrics = [
      { label: 'Quality', value: avgQuality, color: this.COLORS.success },
      { label: 'Timeliness', value: avgTimeliness, color: this.COLORS.primary },
      { label: 'Collaboration', value: avgCollaboration, color: this.COLORS.accent }
    ];

    metrics.forEach(metric => {
      // Label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(this.COLORS.text);
      doc.text(metric.label, 20, yPos);

      // Score
      doc.setFont('helvetica', 'bold');
      doc.text(`${metric.value.toFixed(1)}/10`, pageWidth - 20, yPos, { align: 'right' });

      // Progress bar background
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(60, yPos - 4, 100, 8, 2, 2, 'F');

      // Progress bar fill
      const fillWidth = (metric.value / 10) * 100;
      doc.setFillColor(metric.color);
      doc.roundedRect(60, yPos - 4, fillWidth, 8, 2, 2, 'F');

      yPos += 15;
    });

    yPos += 10;

    // Top submissions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.secondary);
    doc.text('Highlighted Submissions', 20, yPos);
    yPos += 10;

    const topSubmissions = data.taskSubmissions
      .filter(s => s.quality_rating && s.quality_rating >= 8)
      .slice(0, 3);

    if (topSubmissions.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(this.COLORS.lightText);
      doc.text('No submissions with quality rating of 8+ found.', 20, yPos);
      yPos += 10;
    } else {
      topSubmissions.forEach(submission => {
        // Submission title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(this.COLORS.text);
        doc.text(`• ${submission.task.title}`, 20, yPos);
        yPos += 5;

        // Quality score
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(this.COLORS.success);
        doc.text(`Quality Score: ${submission.quality_rating}/10`, 25, yPos);
        yPos += 4;

        // Brief assessment
        if (submission.overall_assessment) {
          const assessmentLines = doc.splitTextToSize(submission.overall_assessment, pageWidth - 50);
          doc.setTextColor(this.COLORS.lightText);
          assessmentLines.slice(0, 2).forEach((line: string) => {
            doc.text(line, 25, yPos);
            yPos += 4;
          });
        }

        yPos += 5;
      });
    }
  }

  private static addCareerInsights(doc: jsPDF, pageWidth: number, data: ReportData): void {
    let yPos = 40;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.secondary);
    doc.text('Career Development Insights', 20, yPos);
    yPos += 10;

    // Strengths
    const strengths = this.identifyStrengths(data);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(this.COLORS.success);
    doc.text('Key Strengths:', 20, yPos);
    yPos += 8;

    strengths.forEach(strength => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(this.COLORS.text);
      doc.text(`• ${strength}`, 25, yPos);
      yPos += 5;
    });

    yPos += 10;

    // Growth areas
    const growthAreas = this.identifyGrowthAreas(data);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(this.COLORS.accent);
    doc.text('Areas for Growth:', 20, yPos);
    yPos += 8;

    growthAreas.forEach(area => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(this.COLORS.text);
      doc.text(`• ${area}`, 25, yPos);
      yPos += 5;
    });
  }

  private static addRecommendations(doc: jsPDF, pageWidth: number, data: ReportData): void {
    let yPos = 180;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.secondary);
    doc.text('Next Steps & Recommendations', 20, yPos);
    yPos += 10;

    const recommendations = this.generateRecommendations(data);
    
    recommendations.forEach((rec, index) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(this.COLORS.primary);
      doc.text(`${index + 1}. ${rec.title}`, 20, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(this.COLORS.text);
      const recLines = doc.splitTextToSize(rec.description, pageWidth - 40);
      recLines.forEach((line: string) => {
        doc.text(line, 25, yPos);
        yPos += 4;
      });

      yPos += 6;
    });

    // Footer
    yPos = 260;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(this.COLORS.lightText);
    doc.text('Generated by Tuterra Virtual Internship Platform', pageWidth / 2, yPos, { align: 'center' });
    doc.text(`Report generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos + 6, { align: 'center' });
  }

  // Helper methods
  private static calculateDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const weeks = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return `${weeks} weeks`;
  }

  private static generatePerformanceSummary(data: ReportData): string {
    const completionRate = (data.completedTasks / data.totalTasks) * 100;
    const xpPerTask = data.completedTasks > 0 ? Math.round(data.totalXP / data.completedTasks) : 0;
    
    return `${data.participantName} successfully completed ${data.completedTasks} out of ${data.totalTasks} tasks (${completionRate.toFixed(1)}% completion rate) during their ${data.jobTitle} virtual internship. They demonstrated strong performance across multiple skill areas, earning a total of ${data.totalXP} experience points with an average skill level of ${data.averageLevel}. The participant showed consistent engagement with an average of ${xpPerTask} XP earned per task submission.`;
  }

  private static groupSkillsByCategory(skills: Array<UserSkillProgress & { skill: Skill }>) {
    return skills.reduce((acc, skillProgress) => {
      const category = skillProgress.skill?.category || 'other';
      if (!acc[category]) acc[category] = [];
      if (skillProgress.current_xp > 0) {
        acc[category].push(skillProgress);
      }
      return acc;
    }, {} as Record<string, Array<UserSkillProgress & { skill: Skill }>>);
  }

  private static calculateAverageRating(submissions: any[], field: string): number {
    const ratings = submissions.map(s => s[field]).filter(r => r != null);
    return ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
  }

  private static generateSkillsJourney(data: ReportData): string {
    const skillCount = data.skills.filter(s => s.current_xp > 0).length;
    const topSkill = data.skills.reduce((max, skill) => 
      skill.current_xp > max.current_xp ? skill : max, 
      data.skills[0]
    );

    return `Throughout the internship, ${data.participantName} developed proficiency in ${skillCount} different skill areas. Their strongest performance was in ${topSkill.skill?.name}, reaching level ${topSkill.current_level} with ${topSkill.current_xp} experience points. This demonstrates a well-rounded approach to professional development with particular strength in ${topSkill.skill?.category} skills.`;
  }

  private static identifyStrengths(data: ReportData): string[] {
    const strengths: string[] = [];
    
    // Top skills
    const topSkills = data.skills
      .filter(s => s.current_level >= 3)
      .sort((a, b) => b.current_level - a.current_level)
      .slice(0, 3);

    topSkills.forEach(skill => {
      strengths.push(`Strong ${skill.skill?.name} capabilities (Level ${skill.current_level})`);
    });

    // High performance metrics
    const avgQuality = this.calculateAverageRating(data.taskSubmissions, 'quality_rating');
    if (avgQuality >= 8) {
      strengths.push('Consistently high-quality work delivery');
    }

    const avgTimeliness = this.calculateAverageRating(data.taskSubmissions, 'timeliness_rating');
    if (avgTimeliness >= 8) {
      strengths.push('Excellent time management and deadline adherence');
    }

    return strengths.slice(0, 4);
  }

  private static identifyGrowthAreas(data: ReportData): string[] {
    const growthAreas: string[] = [];
    
    // Skills with low levels but activity
    const developingSkills = data.skills
      .filter(s => s.current_xp > 0 && s.current_level < 3)
      .sort((a, b) => a.current_level - b.current_level)
      .slice(0, 2);

    developingSkills.forEach(skill => {
      growthAreas.push(`Continue developing ${skill.skill?.name} skills`);
    });

    // Performance areas
    const avgCollaboration = this.calculateAverageRating(data.taskSubmissions, 'collaboration_rating');
    if (avgCollaboration < 7) {
      growthAreas.push('Focus on collaborative work and team communication');
    }

    return growthAreas.slice(0, 3);
  }

  private static generateRecommendations(data: ReportData): Array<{title: string, description: string}> {
    const recommendations = [];

    // Based on top skills
    const topSkill = data.skills.reduce((max, skill) => 
      skill.current_xp > max.current_xp ? skill : max, 
      data.skills[0]
    );

    recommendations.push({
      title: `Leverage Your ${topSkill.skill?.name} Expertise`,
      description: `Your strongest skill area is ${topSkill.skill?.name}. Consider pursuing roles or projects that heavily utilize this skill, such as specialized positions in ${data.industry} that require advanced ${topSkill.skill?.name} capabilities.`
    });

    // Career progression
    recommendations.push({
      title: 'Continue Skill Development',
      description: `Build on your current foundation by pursuing advanced training in your top skill areas. Consider professional certifications, specialized courses, or hands-on projects that can take your skills to the next level.`
    });

    // Networking
    recommendations.push({
      title: 'Build Professional Network',
      description: `Connect with professionals in the ${data.industry} industry, particularly those working in ${data.jobTitle} roles. Your demonstrated skills make you a strong candidate for entry-level positions in this field.`
    });

    return recommendations;
  }
}
