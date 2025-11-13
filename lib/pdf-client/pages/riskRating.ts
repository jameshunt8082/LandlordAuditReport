// Risk Rating Page
import jsPDF from 'jspdf';
import { ReportData } from '@/lib/pdf/formatters';
import { COLORS, FONTS, LAYOUT, setFillColorHex, setTextColorHex, setDrawColorHex } from '../styles';
import { addNewPageIfNeeded } from '../utils';
import { addPageHeader } from '../components/header';
import { addPageFooter } from '../components/footer';

interface TierInfo {
  number: number;
  title: string;
  description: string;
  implication: string;
  color: string;
}

const TIER_DEFINITIONS: TierInfo[] = [
  {
    number: 0,
    title: 'Minimal Risk',
    description: 'Exemplary compliance. All statutory requirements met with robust systems in place. Minimal probability of enforcement action or tenant tribunal claims.',
    implication: 'Insurance: Premium rates. Lending: Favorable terms. Licensing: Fast-track renewals.',
    color: COLORS.darkGreen,
  },
  {
    number: 1,
    title: 'Low Risk',
    description: 'Good compliance with minor non-statutory gaps. Robust systems generally in place. Low probability of enforcement proceedings.',
    implication: 'Insurance: Standard rates. Lending: Normal terms. Licensing: Routine processing.',
    color: COLORS.green,
  },
  {
    number: 2,
    title: 'Moderate Risk',
    description: 'Acceptable compliance with some significant gaps. Systems need strengthening. Moderate risk of tribunal claims and enforcement notices.',
    implication: 'Insurance: Higher premiums likely. Lending: Additional scrutiny. Licensing: Conditions may apply.',
    color: COLORS.orange,
  },
  {
    number: 3,
    title: 'High Risk',
    description: 'Poor compliance with multiple critical gaps. Immediate action required. High probability of financial penalties and enforcement intervention.',
    implication: 'Insurance: Premium loading or coverage restrictions. Lending: Difficult. Licensing: At risk.',
    color: COLORS.orange,
  },
  {
    number: 4,
    title: 'Severe Risk',
    description: 'Serious non-compliance with statutory breaches. Immediate prosecution risk. Property may face prohibition orders preventing legal letting.',
    implication: 'Insurance: May be refused. Lending: Prohibited. Licensing: Revocation likely.',
    color: COLORS.red,
  },
];

/**
 * Generate Risk Rating Page
 */
export async function riskRating(doc: jsPDF, data: ReportData): Promise<void> {
  const { margins, contentWidth } = LAYOUT;
  const startX = margins.left;
  
  doc.addPage();
  addPageHeader(doc, doc.getCurrentPageInfo().pageNumber, 999);
  
  let yPos = margins.top + 15;
  
  // Title
  doc.setFontSize(FONTS.h1.size);
  doc.setFont('helvetica', FONTS.h1.style);
  setTextColorHex(doc, COLORS.primaryGreen);
  doc.text('Understanding Your Risk Rating', startX, yPos);
  yPos += 20;
  
  // Description
  doc.setFontSize(FONTS.body.size);
  doc.setFont('helvetica', 'normal');
  setTextColorHex(doc, COLORS.black);
  
  const descText = 'Your overall risk rating determines the level of legal exposure and potential financial liability you face. This rating influences insurance premiums, lending decisions, and licensing authority assessments.';
  const wrapped = doc.splitTextToSize(descText, contentWidth);
  doc.text(wrapped, startX, yPos);
  yPos += wrapped.length * 4 + 15;
  
  // Section title
  doc.setFontSize(FONTS.h2.size);
  doc.setFont('helvetica', FONTS.h2.style);
  doc.text('Risk Tier Classifications', startX, yPos);
  yPos += 12;
  
  // Tier boxes
  TIER_DEFINITIONS.forEach((tier) => {
    const boxHeight = 38;
    yPos = addNewPageIfNeeded(doc, yPos, boxHeight + 5);
    
    // Box with colored border
    setFillColorHex(doc, COLORS.white);
    setDrawColorHex(doc, tier.color);
    doc.setLineWidth(0.5);
    doc.roundedRect(startX, yPos, contentWidth, boxHeight, 2, 2, 'FD');
    
    let boxY = yPos + 8;
    
    // Tier header: number + title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    setTextColorHex(doc, tier.color);
    doc.text(`Tier ${tier.number}`, startX + 10, boxY);
    
    doc.setFontSize(14);
    doc.text(tier.title, startX + 38, boxY);
    
    boxY += 10;
    
    // Description
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    setTextColorHex(doc, COLORS.black);
    const descWrapped = doc.splitTextToSize(tier.description, contentWidth - 20);
    doc.text(descWrapped, startX + 10, boxY);
    boxY += descWrapped.length * 4 + 3;
    
    // Implication
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    setTextColorHex(doc, COLORS.mediumGray);
    const implWrapped = doc.splitTextToSize(tier.implication, contentWidth - 20);
    doc.text(implWrapped, startX + 10, boxY);
    
    yPos += boxHeight + 8;
  });
  
  addPageFooter(doc);
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

