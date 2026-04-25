import jsPDF from 'jspdf';
import { LAYOUT, COLORS } from '../styles';
import { drawSeverityPanel, SeverityPanelConfig } from './severityPanel';
import { drawTrafficLightGraphic } from './trafficLight';

const DEFAULT_SEGMENT_GAP = 2;
const DEFAULT_SEGMENT_HEIGHT = 26;
const DEFAULT_LIGHT_WIDTH = 20;
const DEFAULT_PANEL_WIDTH = 86;

const LEGEND_ITEMS: SeverityPanelConfig[] = [
  {
    bgColor: COLORS.bannerRedBg || '#fae9e9',
    borderColor: COLORS.bannerRedBorder || '#e0807f',
    title: 'RED (scores below 4).',
    description: 'Critical issues requiring immediate attention.',
    iconType: 'warning',
  },
  {
    bgColor: COLORS.bannerOrangeBg || '#fceedb',
    borderColor: COLORS.bannerOrangeBorder || '#e9b76e',
    title: 'ORANGE (scores below 7).',
    description: 'Areas that need improvement.',
    iconType: 'trend',
  },
  {
    bgColor: COLORS.bannerGreenBg || '#e6f4ea',
    borderColor: COLORS.bannerGreenBorder || '#7dc08e',
    title: 'GREEN (scores below 10).',
    description: 'Well managed areas demonstrating good practices.',
    iconType: 'shield',
  },
];

export function drawTrafficLegend(
  doc: jsPDF,
  startY: number,
  options?: {
    lightWidth?: number;
    segmentHeight?: number;
    segmentGap?: number;
    panelGap?: number;
    panelWidth?: number;
  }
): void {
  const { pageWidth } = LAYOUT;
  const lightWidth = options?.lightWidth ?? DEFAULT_LIGHT_WIDTH;
  const segmentHeight = options?.segmentHeight ?? DEFAULT_SEGMENT_HEIGHT;
  const segmentGap = options?.segmentGap ?? DEFAULT_SEGMENT_GAP;
  const panelGap = options?.panelGap ?? 8;
  const panelWidth = options?.panelWidth ?? DEFAULT_PANEL_WIDTH;
  const totalHeight = segmentHeight * 3 + segmentGap * 2;
  const totalWidth = lightWidth + panelGap + panelWidth;
  const startX = (pageWidth - totalWidth) / 2;
  const panelX = startX + lightWidth + panelGap;

  drawTrafficLightGraphic(doc, startX, startY, lightWidth, totalHeight, segmentGap);

  LEGEND_ITEMS.forEach((item, index) => {
    const y = startY + index * (segmentHeight + segmentGap);
    drawSeverityPanel(doc, panelX, y, panelWidth, segmentHeight, item, { flushLeft: panelGap === 0 });
  });
}
