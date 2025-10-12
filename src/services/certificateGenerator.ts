import jsPDF from 'jspdf';
import { UserSkillProgress, Skill } from '@/types/skills';

interface CertificateData {
  participantName: string;
  jobTitle: string;
  industry: string;
  companyName: string;
  completedAt: string;
  totalXP: number;
  averageLevel: number;
  topSkills: Array<UserSkillProgress & { skill: Skill }>;
  completedTasks: number;
  totalTasks: number;
}

export class CertificateGenerator {
  private static readonly COLORS = {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#F59E0B',
    text: '#374151',
    lightText: '#6B7280',
    success: '#10B981'
  };

  static generateSkillsCertificate(data: CertificateData): void {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background and border
    this.addCertificateBackground(doc, pageWidth, pageHeight);
    
    // Header
    this.addHeader(doc, pageWidth, data);
    
    // Main content
    this.addMainContent(doc, pageWidth, pageHeight, data);
    
    // Skills section
    this.addSkillsSection(doc, pageWidth, data);
    
    // Footer
    this.addFooter(doc, pageWidth, pageHeight, data);

    // Download
    const fileName = `${data.participantName.replace(/\s+/g, '_')}_Internship_Certificate.pdf`;
    doc.save(fileName);
  }

  private static addCertificateBackground(doc: jsPDF, pageWidth: number, pageHeight: number): void {
    // Outer border
    doc.setDrawColor(this.COLORS.primary);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    // Inner border
    doc.setDrawColor(this.COLORS.secondary);
    doc.setLineWidth(0.5);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Decorative corner elements
    this.addCornerDecorations(doc, pageWidth, pageHeight);
  }

  private static addCornerDecorations(doc: jsPDF, pageWidth: number, pageHeight: number): void {
    const cornerSize = 15;
    doc.setFillColor(this.COLORS.accent);
    
    // Top corners
    doc.triangle(15, 15, 15 + cornerSize, 15, 15, 15 + cornerSize, 'F');
    doc.triangle(pageWidth - 15, 15, pageWidth - 15 - cornerSize, 15, pageWidth - 15, 15 + cornerSize, 'F');
    
    // Bottom corners  
    doc.triangle(15, pageHeight - 15, 15 + cornerSize, pageHeight - 15, 15, pageHeight - 15 - cornerSize, 'F');
    doc.triangle(pageWidth - 15, pageHeight - 15, pageWidth - 15 - cornerSize, pageHeight - 15, pageWidth - 15, pageHeight - 15 - cornerSize, 'F');
  }

  private static addHeader(doc: jsPDF, pageWidth: number, data: CertificateData): void {
    // Certificate title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(this.COLORS.primary);
    doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 35, { align: 'center' });

    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(this.COLORS.text);
    doc.text('Virtual Internship Program', pageWidth / 2, 45, { align: 'center' });

    // Decorative line
    doc.setDrawColor(this.COLORS.accent);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 40, 50, pageWidth / 2 + 40, 50);
  }

  private static addMainContent(doc: jsPDF, pageWidth: number, pageHeight: number, data: CertificateData): void {
    const centerY = pageHeight / 2;

    // "This is to certify that" text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.text);
    doc.text('This is to certify that', pageWidth / 2, centerY - 30, { align: 'center' });

    // Participant name (large and prominent)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(this.COLORS.secondary);
    doc.text(data.participantName, pageWidth / 2, centerY - 15, { align: 'center' });

    // Achievement text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.text);
    const achievementText = `has successfully completed the ${data.jobTitle} Virtual Internship`;
    doc.text(achievementText, pageWidth / 2, centerY, { align: 'center' });

    // Company and industry
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(this.COLORS.lightText);
    const companyText = `at ${data.companyName} in the ${data.industry} industry`;
    doc.text(companyText, pageWidth / 2, centerY + 8, { align: 'center' });

    // Performance stats
    this.addPerformanceStats(doc, pageWidth, centerY + 25, data);
  }

  private static addPerformanceStats(doc: jsPDF, pageWidth: number, yPos: number, data: CertificateData): void {
    const statsY = yPos;
    const statSpacing = 60;
    const startX = pageWidth / 2 - statSpacing * 1.5;

    const stats = [
      { label: 'Tasks Completed', value: `${data.completedTasks}/${data.totalTasks}` },
      { label: 'Total XP Earned', value: `${data.totalXP}` },
      { label: 'Average Skill Level', value: `${data.averageLevel}` }
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    stats.forEach((stat, index) => {
      const x = startX + (index * statSpacing);
      
      // Stat box background
      doc.setFillColor(248, 250, 252); // gray-50
      doc.roundedRect(x - 25, statsY - 8, 50, 16, 2, 2, 'F');
      
      // Stat value
      doc.setTextColor(this.COLORS.primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(stat.value, x, statsY - 2, { align: 'center' });
      
      // Stat label
      doc.setTextColor(this.COLORS.lightText);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(stat.label, x, statsY + 4, { align: 'center' });
    });
  }

  private static addSkillsSection(doc: jsPDF, pageWidth: number, data: CertificateData): void {
    const skillsStartY = 160;
    
    // Skills header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.secondary);
    doc.text('Top Skills Demonstrated', pageWidth / 2, skillsStartY, { align: 'center' });

    // Skills grid
    const skillsPerRow = 3;
    const skillWidth = 60;
    const skillHeight = 15;
    const startX = pageWidth / 2 - (skillsPerRow * skillWidth) / 2;

    data.topSkills.slice(0, 6).forEach((skillProgress, index) => {
      const row = Math.floor(index / skillsPerRow);
      const col = index % skillsPerRow;
      const x = startX + (col * skillWidth);
      const y = skillsStartY + 10 + (row * (skillHeight + 5));

      // Skill box
      doc.setFillColor(this.COLORS.primary);
      doc.roundedRect(x, y, skillWidth - 5, skillHeight, 2, 2, 'F');

      // Skill name
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      const skillName = skillProgress.skill?.name || 'Unknown Skill';
      doc.text(skillName, x + (skillWidth - 5) / 2, y + 6, { align: 'center' });

      // Level indicator
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`Level ${skillProgress.current_level}`, x + (skillWidth - 5) / 2, y + 11, { align: 'center' });
    });
  }

  private static addFooter(doc: jsPDF, pageWidth: number, pageHeight: number, data: CertificateData): void {
    const footerY = pageHeight - 40;

    // Completion date
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.text);
    const completionDate = new Date(data.completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Completed on ${completionDate}`, 30, footerY);

    // Tuterra branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(this.COLORS.primary);
    doc.text('Powered by Tuterra', pageWidth - 30, footerY, { align: 'right' });

    // Certificate ID (for verification)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(this.COLORS.lightText);
    const certificateId = `Certificate ID: TUT-${data.jobTitle.replace(/\s+/g, '')}-${Date.now().toString(36).toUpperCase()}`;
    doc.text(certificateId, pageWidth / 2, footerY + 8, { align: 'center' });
  }
}

// Helper method to add triangle shape (since jsPDF doesn't have built-in triangle)
declare module 'jspdf' {
  interface jsPDF {
    triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, style?: string): jsPDF;
  }
}

// Extend jsPDF with triangle method
if (typeof jsPDF !== 'undefined') {
  jsPDF.API.triangle = function(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, style: string = 'S') {
    this.lines([[x2 - x1, y2 - y1], [x3 - x2, y3 - y2], [x1 - x3, y1 - y3]], x1, y1, [1, 1], style, true);
    return this;
  };
}
