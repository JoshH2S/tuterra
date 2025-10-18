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
    primary: '#3498db',      // Tuterra's blue
    secondary: '#2c3e50',    // Dark blue-gray for contrast
    accent: '#3498db',       // Tuterra's blue accent
    text: '#333333',         // Tuterra's neutral text
    lightText: '#666666',    // Tuterra's muted text
    success: '#2ecc71',      // Keep success green
    background: '#FFFFFF',   // White background
    border: '#e1e8ed',       // Light border
    gradient: {
      start: '#3498db',      // Tuterra blue
      end: '#2980b9'         // Darker blue
    }
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
    // White background
    doc.setFillColor(this.COLORS.background);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Outer border with Tuterra blue
    doc.setDrawColor(this.COLORS.primary);
    doc.setLineWidth(3);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    // Inner subtle border
    doc.setDrawColor(this.COLORS.border);
    doc.setLineWidth(1);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Modern decorative corner elements
    this.addCornerDecorations(doc, pageWidth, pageHeight);
  }

  private static addCornerDecorations(doc: jsPDF, pageWidth: number, pageHeight: number): void {
    const cornerSize = 15;
    doc.setFillColor(this.COLORS.primary); // Use Tuterra blue instead of gold
    
    // Top corners
    doc.triangle(15, 15, 15 + cornerSize, 15, 15, 15 + cornerSize, 'F');
    doc.triangle(pageWidth - 15, 15, pageWidth - 15 - cornerSize, 15, pageWidth - 15, 15 + cornerSize, 'F');
    
    // Bottom corners  
    doc.triangle(15, pageHeight - 15, 15 + cornerSize, pageHeight - 15, 15, pageHeight - 15 - cornerSize, 'F');
    doc.triangle(pageWidth - 15, pageHeight - 15, pageWidth - 15 - cornerSize, pageHeight - 15, pageWidth - 15, pageHeight - 15 - cornerSize, 'F');
  }

  private static addHeader(doc: jsPDF, pageWidth: number, data: CertificateData): void {
    // Tuterra branding at top (will replace with logo later)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(this.COLORS.primary);
    doc.text('tuterra', pageWidth / 2, 25, { align: 'center' });
    
    // Certificate title with Tuterra blue
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(this.COLORS.primary);
    doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 40, { align: 'center' });

    // Subtitle with better spacing
    doc.setFontSize(16);
    doc.setTextColor(this.COLORS.text);
    doc.text('Virtual Internship Program', pageWidth / 2, 52, { align: 'center' });

    // Modern decorative line with Tuterra blue
    doc.setDrawColor(this.COLORS.primary);
    doc.setLineWidth(2);
    doc.line(pageWidth / 2 - 60, 58, pageWidth / 2 + 60, 58);
    
    // Subtle accent line
    doc.setDrawColor(this.COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 80, 60, pageWidth / 2 + 80, 60);
  }

  private static addMainContent(doc: jsPDF, pageWidth: number, pageHeight: number, data: CertificateData): void {
    const centerY = pageHeight / 2;

    // "This is to certify that" text with better styling
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(this.COLORS.lightText);
    doc.text('This is to certify that', pageWidth / 2, centerY - 35, { align: 'center' });

    // Participant name (large and prominent with Tuterra colors)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(this.COLORS.primary);
    doc.text(data.participantName, pageWidth / 2, centerY - 18, { align: 'center' });

    // Achievement text with better formatting
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(this.COLORS.text);
    const achievementText = `has successfully completed the ${data.jobTitle} Virtual Internship`;
    doc.text(achievementText, pageWidth / 2, centerY - 2, { align: 'center' });

    // Company and industry with Tuterra branding
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.lightText);
    const companyText = `with ${data.companyName} in the ${data.industry} industry`;
    doc.text(companyText, pageWidth / 2, centerY + 10, { align: 'center' });

    // Performance stats with better positioning
    this.addPerformanceStats(doc, pageWidth, centerY + 30, data);
  }

  private static addPerformanceStats(doc: jsPDF, pageWidth: number, yPos: number, data: CertificateData): void {
    const statsY = yPos;
    const statSpacing = 80; // Increased spacing for better centering
    const startX = pageWidth / 2 - statSpacing; // Center the 3 boxes properly

    const stats = [
      { label: 'Tasks Completed', value: `${data.completedTasks}/${data.totalTasks}` },
      { label: 'Total XP Earned', value: `${data.totalXP}` },
      { label: 'Average Skill Level', value: `${data.averageLevel}` }
    ];

    stats.forEach((stat, index) => {
      const x = startX + (index * statSpacing);
      
      // Modern stat box with white background and blue border
      doc.setFillColor(255, 255, 255); // White background
      doc.setDrawColor(this.COLORS.primary);
      doc.setLineWidth(2);
      doc.roundedRect(x - 35, statsY - 12, 70, 24, 4, 4, 'FD');
      
      // Stat value with Tuterra blue
      doc.setTextColor(this.COLORS.primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(stat.value, x, statsY - 2, { align: 'center' });
      
      // Stat label with better styling
      doc.setTextColor(this.COLORS.text);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(stat.label, x, statsY + 8, { align: 'center' });
    });
  }

  private static addSkillsSection(doc: jsPDF, pageWidth: number, data: CertificateData): void {
    const skillsStartY = 170;
    
    // Skills header with Tuterra styling
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(this.COLORS.primary);
    doc.text('Top Skills Demonstrated', pageWidth / 2, skillsStartY, { align: 'center' });

    // Only show skills if we have them
    if (data.topSkills && data.topSkills.length > 0) {
      // Skills grid with better spacing
      const skillsPerRow = 3;
      const skillWidth = 70;
      const skillHeight = 18;
      const startX = pageWidth / 2 - (skillsPerRow * skillWidth) / 2;

      data.topSkills.slice(0, 6).forEach((skillProgress, index) => {
        const row = Math.floor(index / skillsPerRow);
        const col = index % skillsPerRow;
        const x = startX + (col * skillWidth);
        const y = skillsStartY + 15 + (row * (skillHeight + 8));

        // Modern skill box with blue styling
        doc.setFillColor(this.COLORS.primary);
        doc.roundedRect(x, y, skillWidth - 5, skillHeight, 4, 4, 'F');
        
        // Inner highlight with lighter blue
        doc.setFillColor(52, 152, 219); // Lighter blue
        doc.roundedRect(x + 1, y + 1, skillWidth - 7, skillHeight - 2, 3, 3, 'F');

        // Skill name with white text for contrast on blue
        doc.setTextColor(255, 255, 255); // White text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        const skillName = skillProgress.skill?.name || 'Unknown Skill';
        doc.text(skillName, x + (skillWidth - 5) / 2, y + 8, { align: 'center' });

        // Level indicator with white text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255); // White text
        doc.text(`Level ${skillProgress.current_level}`, x + (skillWidth - 5) / 2, y + 14, { align: 'center' });
      });
    } else {
      // Fallback message if no skills
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(this.COLORS.lightText);
      doc.text('Skills assessment in progress', pageWidth / 2, skillsStartY + 15, { align: 'center' });
    }
  }

  private static addFooter(doc: jsPDF, pageWidth: number, pageHeight: number, data: CertificateData): void {
    const footerY = pageHeight - 35;

    // Completion date with better styling
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(this.COLORS.text);
    const completionDate = new Date(data.completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Completed on ${completionDate}`, 30, footerY);

    // Tuterra branding with blue styling
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.primary);
    doc.text('Powered by tuterra', pageWidth - 30, footerY, { align: 'right' });

    // Certificate ID with modern formatting
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(this.COLORS.lightText);
    const certificateId = `Certificate ID: TUT-${data.jobTitle.replace(/\s+/g, '')}-${Date.now().toString(36).toUpperCase()}`;
    doc.text(certificateId, pageWidth / 2, footerY + 10, { align: 'center' });
    
    // Subtle verification note
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(this.COLORS.lightText);
    doc.text('This certificate can be verified at tuterra.ai/verify', pageWidth / 2, footerY + 18, { align: 'center' });
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
