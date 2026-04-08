// Audit Scope Page (Simplified - only scope description and bullet points, no tables)
import jsPDF from 'jspdf';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setTextColorHex } from '../styles';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';
import { drawJustifiedText } from '../utils';

/**
 * Generate page 2 with an Introduction heading and Audit Scope subsection.
 */
export async function auditScope(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Main title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Introduction', startX, yPos);
  yPos += 20;
  
  // Introduction bullets
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);

  const introParagraphs = [
    'As a landlord there are three main areas you need to focus on: making sure your documentation is compliant, that you have good evidence-gathering systems in place, and the need to maintain good landlord-tenant communications. Doing so will help you avoid future legal penalties, financial losses, and reputational damage.',
    'This report provides a prioritised list of critical actions you need to take (red), improvements you need to make (orange) and things you are doing well but which you need to maintain the standard of going forwards (green).',
  ];

  introParagraphs.forEach((paragraph) => {
    const wrapped = drawJustifiedText(doc, paragraph, startX, yPos, contentWidth);
    yPos += wrapped.length * 4 + 8;
  });

  yPos += 8;

  // Section title
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', FONTS.h2.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Audit Scope', startX, yPos);
  yPos += 12;

  // Section description
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  const scopeDescription = 'This audit examined the following areas:';
  drawJustifiedText(doc, scopeDescription, startX, yPos, contentWidth);
  yPos += 10;
  
  // Bullet points
  const bulletPoints = [
    {
      title: 'Documentation Systems:',
      text: 'Safety certificates, tenancy agreements, council licensing, financial records, maintenance logs, and tenant communications.',
    },
    {
      title: 'Communication Protocols:',
      text: 'Written record systems, complaint handling procedures, notice protocols, response time tracking, and tenant accessibility.',
    },
    {
      title: 'Evidence Collection:',
      text: 'Photographic evidence, inspection procedures, witness statements, timestamping protocols, and secure storage systems.',
    },
  ];
  
  bulletPoints.forEach(item => {
    doc.setFont('helvetica', 'bold');
    doc.text(`• ${item.title}`, startX + 5, yPos);
    
    doc.setFont('helvetica', 'normal');
    const itemText = drawJustifiedText(doc, item.text, startX + 10, yPos + 5, contentWidth - 20);
    yPos += itemText.length * 4 + 8;
  });
  
  addPageFooter(doc);
}
