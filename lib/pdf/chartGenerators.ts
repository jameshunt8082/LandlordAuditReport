// Chart Generation for PDF Reports
// Uses recharts to generate PNG images for embedding in PDFs

import { ReportData } from './formatters';
import { COLORS } from './styles';

/**
 * Generate 5 Pillars Chart for cover page
 * Returns base64 PNG data URL
 */
export async function generatePillarsChart(data: ReportData): Promise<string> {
  // For now, return a placeholder
  // This will be implemented with server-side rendering using canvas
  // The chart should show 5 vertical bars representing:
  // 1. Documentation score
  // 2. Communication score
  // 3. Evidence Gathering score
  // 4. Overall score
  // 5. Risk tier (scaled)
  
  // Size: 334×419px
  // Color: Primary green (#38761d)
  
  // TODO: Implement with recharts + canvas rendering
  // For MVP, we'll use a simple SVG representation
  
  return createSimplePillarsChartSVG(data);
}

/**
 * Generate Subcategory Scores horizontal bar chart
 * Returns base64 PNG data URL
 */
export async function generateSubcategoryChart(data: ReportData): Promise<string> {
  // For now, return a placeholder
  // This will be implemented with server-side rendering using canvas
  // Horizontal bar chart with all subcategories
  // Color-coded by score (red/orange/green)
  // Size: 600×650px
  
  // TODO: Implement with recharts + canvas rendering
  // For MVP, we'll use a simple SVG representation
  
  return createSimpleSubcategoryChartSVG(data);
}

/**
 * Create simple SVG for pillars chart (MVP version)
 */
function createSimplePillarsChartSVG(data: ReportData): string {
  const width = 334;
  const height = 419;
  const barWidth = 50;
  const maxHeight = 300;
  const spacing = (width - (5 * barWidth)) / 6;
  
  // Calculate bar heights (proportional to score)
  const docHeight = (data.categoryScores.documentation.score / 10) * maxHeight;
  const commHeight = (data.categoryScores.communication.score / 10) * maxHeight;
  const evidenceHeight = (data.categoryScores.evidenceGathering.score / 10) * maxHeight;
  const overallHeight = (data.overallScore / 10) * maxHeight;
  const tierHeight = (parseInt(data.riskTier.split('_')[1]) + 1) * (maxHeight / 5);
  
  const bars = [
    { x: spacing, height: docHeight, label: 'Doc', score: data.categoryScores.documentation.score },
    { x: spacing * 2 + barWidth, height: commHeight, label: 'Comm', score: data.categoryScores.communication.score },
    { x: spacing * 3 + barWidth * 2, height: evidenceHeight, label: 'Evid', score: data.categoryScores.evidenceGathering.score },
    { x: spacing * 4 + barWidth * 3, height: overallHeight, label: 'Overall', score: data.overallScore },
    { x: spacing * 5 + barWidth * 4, height: tierHeight, label: 'Tier', score: parseInt(data.riskTier.split('_')[1]) },
  ];
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      ${bars.map(bar => `
        <rect 
          x="${bar.x}" 
          y="${height - 70 - bar.height}" 
          width="${barWidth}" 
          height="${bar.height}" 
          fill="${COLORS.primaryGreen}"
          rx="4"
        />
        <text 
          x="${bar.x + barWidth / 2}" 
          y="${height - 70 - bar.height - 10}" 
          text-anchor="middle" 
          font-size="14" 
          font-weight="bold"
          fill="${COLORS.primaryGreen}"
        >${bar.score.toFixed(1)}</text>
        <text 
          x="${bar.x + barWidth / 2}" 
          y="${height - 45}" 
          text-anchor="middle" 
          font-size="12"
          fill="${COLORS.black}"
        >${bar.label}</text>
      `).join('')}
      <line x1="0" y1="${height - 70}" x2="${width}" y2="${height - 70}" stroke="${COLORS.lightGray}" stroke-width="2"/>
    </svg>
  `;
  
  // Convert SVG to base64 data URL
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Create simple SVG for subcategory chart (MVP version)
 */
function createSimpleSubcategoryChartSVG(data: ReportData): string {
  const width = 600;
  const barHeight = 30;
  const spacing = 10;
  const labelWidth = 250;
  const maxBarWidth = width - labelWidth - 100;
  
  const subcats = data.subcategoryScores;
  const height = Math.max(subcats.length * (barHeight + spacing) + 100, 650);
  
  // Get color for score
  const getColor = (score: number): string => {
    if (score <= 3) return COLORS.red;
    if (score <= 6) return COLORS.orange;
    return COLORS.green;
  };
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="white"/>
      
      <!-- Title -->
      <text x="20" y="40" font-size="18" font-weight="bold" fill="${COLORS.primaryGreen}">
        Subcategory Scores
      </text>
      
      <!-- Bars -->
      ${subcats.map((subcat, index) => {
        const y = 80 + index * (barHeight + spacing);
        const barWidth = (subcat.score / 10) * maxBarWidth;
        const color = getColor(subcat.score);
        
        return `
          <!-- Label -->
          <text x="20" y="${y + barHeight / 2 + 5}" font-size="11" fill="${COLORS.black}">
            ${subcat.name.substring(0, 30)}${subcat.name.length > 30 ? '...' : ''}
          </text>
          
          <!-- Bar -->
          <rect 
            x="${labelWidth}" 
            y="${y}" 
            width="${barWidth}" 
            height="${barHeight}" 
            fill="${color}"
            rx="3"
          />
          
          <!-- Score -->
          <text 
            x="${labelWidth + barWidth + 10}" 
            y="${y + barHeight / 2 + 5}" 
            font-size="12" 
            font-weight="bold"
            fill="${color}"
          >
            ${subcat.score.toFixed(1)}
          </text>
        `;
      }).join('')}
    </svg>
  `;
  
  // Convert SVG to base64 data URL
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Helper: Get color based on score
 */
export function getScoreColor(score: number): string {
  if (score <= 3) return COLORS.red;
  if (score <= 6) return COLORS.orange;
  return COLORS.green;
}

