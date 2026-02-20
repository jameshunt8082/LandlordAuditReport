// PDF Styles Configuration - Exact specifications from original @react-pdf design
import jsPDF from 'jspdf';

// Color Palette (from lib/pdf/styles.ts)
export const COLORS = {
  // Primary brand colors
  primaryGreen: '#38761d',
  darkGreen: '#34a853',
  topBarColor: '#bbbeaf',  // Cover page top decorative bar
  
  // Category colors
  blue: '#0b5394',
  lightBlue: '#1155cc',
  paleBlue: '#dae6fa',
  
  // Traffic light colors
  red: '#ea4335',
  orange: '#ffae15',
  green: '#34a853',
  
  // Text colors
  black: '#000000',
  darkGray: '#434343',
  mediumGray: '#666666',
  lightGray: '#cccccc',
  
  // Background
  white: '#ffffff',
};

// Typography Specifications
export const FONTS = {
  title: { size: 24, style: 'bold' as const },
  h1: { size: 19, style: 'bold' as const },
  h2: { size: 15, style: 'bold' as const },
  h3: { size: 13, style: 'bold' as const },
  h4: { size: 11, style: 'bold' as const },
  body: { size: 11, style: 'normal' as const },
  small: { size: 10, style: 'normal' as const },
  tableHeader: { size: 12, style: 'bold' as const },
  tableCell: { size: 11, style: 'normal' as const },
};

// Layout Constants (A4 page in mm)
export const LAYOUT = {
  pageWidth: 210,
  pageHeight: 297,
  margins: {
    top: 25,
    right: 20,
    bottom: 25,
    left: 20,
  },
  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 25,
  },
  contentWidth: 170, // pageWidth - left - right margins
};

/**
 * Helper to convert hex color to RGB array for jsPDF
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

/**
 * Set text color from hex
 */
export function setTextColorHex(doc: jsPDF, hex: string): void {
  const [r, g, b] = hexToRgb(hex);
  doc.setTextColor(r, g, b);
}

/**
 * Set fill color from hex
 */
export function setFillColorHex(doc: jsPDF, hex: string): void {
  const [r, g, b] = hexToRgb(hex);
  doc.setFillColor(r, g, b);
}

/**
 * Set draw color from hex
 */
export function setDrawColorHex(doc: jsPDF, hex: string): void {
  const [r, g, b] = hexToRgb(hex);
  doc.setDrawColor(r, g, b);
}

/**
 * Get traffic light color based on score
 */
export function getTrafficLightColor(score: number): 'red' | 'orange' | 'green' {
  if (score <= 3) return 'red';
  if (score <= 6) return 'orange';
  return 'green';
}

/**
 * Get priority color for action plan
 */
export function getPriorityColor(priority: 1 | 2 | 3 | 4): string {
  switch (priority) {
    case 1: return COLORS.red;      // CRITICAL COMPLIANCE
    case 2: return '#dc2626';       // HIGH (red-600 for consistency with UI)
    case 3: return COLORS.orange;   // MEDIUM (orange for medium-term actions)
    case 4: return COLORS.mediumGray; // LOW
  }
}

/**
 * Get priority label
 */
export function getPriorityLabel(priority: 1 | 2 | 3 | 4): string {
  switch (priority) {
    case 1: return 'CRITICAL COMPLIANCE';
    case 2: return 'HIGH';
    case 3: return 'MEDIUM';
    case 4: return 'LOW';
  }
}

/**
 * Format score to 1 decimal place
 */
export function formatScore(score: number): string {
  return score.toFixed(1);
}

