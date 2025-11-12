// PDF Styles - Exact specifications from official layout
import { StyleSheet } from '@react-pdf/renderer';

// Color Palette (From Official HTML Layout)
export const COLORS = {
  // Primary brand colors
  primaryGreen: '#38761d',      // Main titles, decorative bars
  darkGreen: '#34a853',         // Success indicators
  
  // Category colors
  blue: '#0b5394',              // Primary text emphasis
  lightBlue: '#1155cc',         // Links
  paleBlue: '#dae6fa',          // Table backgrounds
  
  // Traffic light colors
  red: '#ea4335',               // Critical/Low scores
  orange: '#ffae15',            // Medium scores
  green: '#34a853',             // High scores
  
  // Text colors
  black: '#000000',             // Body text
  darkGray: '#434343',          // H3 headings
  mediumGray: '#666666',        // H4/H5 headings
  lightGray: '#cccccc',         // Borders
  
  // Background
  white: '#ffffff',
};

// Typography Specifications
export const FONTS = {
  body: {
    fontFamily: 'Helvetica',    // Arial fallback
    fontSize: 11,
    lineHeight: 1.15,
  },
  h1: {
    fontSize: 19,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primaryGreen,
  },
  h2: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.black,
  },
  h3: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.darkGray,
  },
  h4: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.mediumGray,
  },
  tableHeader: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  score: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
};

// Layout Measurements (A4)
export const LAYOUT = {
  page: {
    width: 595.28,    // A4 width in points
    height: 841.89,   // A4 height in points
  },
  margins: {
    top: 72,         // 1 inch
    bottom: 72,
    left: 72,
    right: 72,
  },
  decorativeBars: {
    greenBarHeight: 6.59,    // Top decorative bar
    gradientBarHeight: 24,   // Title section bar
  },
};

// Spacing Scale (8px base)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Common Styles
export const styles = StyleSheet.create({
  page: {
    paddingTop: LAYOUT.margins.top,
    paddingBottom: LAYOUT.margins.bottom,
    paddingLeft: LAYOUT.margins.left,
    paddingRight: LAYOUT.margins.right,
    fontFamily: FONTS.body.fontFamily,
    fontSize: FONTS.body.fontSize,
    lineHeight: FONTS.body.lineHeight,
    color: COLORS.black,
  },
  
  // Headings
  h1: {
    ...FONTS.h1,
    marginTop: 30,
    marginBottom: 12,
  },
  h2: {
    ...FONTS.h2,
    marginTop: 28,
    marginBottom: 6,
  },
  h3: {
    ...FONTS.h3,
    marginTop: 26,
    marginBottom: 4,
  },
  h4: {
    ...FONTS.h4,
  },
  
  // Text
  paragraph: {
    marginBottom: 10,
    textAlign: 'justify',
  },
  
  // Lists
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bulletSymbol: {
    width: 15,
  },
  bulletText: {
    flex: 1,
  },
  
  // Tables
  table: {
    width: '100%',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    minHeight: 25,
  },
  tableHeader: {
    backgroundColor: COLORS.paleBlue,
    ...FONTS.tableHeader,
  },
  tableCell: {
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.lightGray,
  },
  tableCellLeft: {
    width: '40%',
  },
  tableCellRight: {
    width: '60%',
  },
  
  // Decorative elements
  decorativeBar: {
    width: '100%',
    height: LAYOUT.decorativeBars.greenBarHeight,
    backgroundColor: COLORS.primaryGreen,
  },
  decorativeLine: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 10,
  },
  
  // Scores
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  scoreLabel: {
    flex: 1,
  },
  scoreValue: {
    ...FONTS.score,
    width: 50,
    textAlign: 'right',
  },
  
  // Traffic lights
  trafficLightContainer: {
    width: 35,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Question cards
  questionCard: {
    marginBottom: 20,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: LAYOUT.margins.left,
    right: LAYOUT.margins.right,
    textAlign: 'center',
    fontSize: 9,
    color: COLORS.mediumGray,
  },
  
  // Header
  header: {
    position: 'absolute',
    top: 30,
    left: LAYOUT.margins.left,
    right: LAYOUT.margins.right,
    fontSize: 9,
    color: COLORS.mediumGray,
  },
});

// Helper function to get traffic light color based on score
export function getTrafficLightColor(score: number): 'red' | 'orange' | 'green' {
  if (score <= 3) return 'red';
  if (score <= 6) return 'orange';
  return 'green';
}

// Helper function to get color value from traffic light color
export function getColorForTrafficLight(color: 'red' | 'orange' | 'green'): string {
  return COLORS[color];
}

// Helper function to get priority label
export function getPriorityLabel(priority: 1 | 2 | 3 | 4): string {
  return `P${priority}`;
}

// Helper function to get priority color
export function getPriorityColor(priority: 1 | 2 | 3 | 4): string {
  if (priority === 1) return COLORS.red;
  if (priority === 2) return COLORS.orange;
  return COLORS.darkGreen;
}

// Helper function to format decimal consistently
export function formatScore(score: number): string {
  return score.toFixed(1);
}

