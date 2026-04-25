import jsPDF from 'jspdf';
import { COLORS, setDrawColorHex, setFillColorHex, setTextColorHex } from '../styles';

export interface SeverityPanelConfig {
  bgColor: string;
  borderColor: string;
  title: string;
  description: string;
  iconType: 'warning' | 'trend' | 'shield';
}

export function drawSeverityPanel(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  config: SeverityPanelConfig,
  options?: {
    flushLeft?: boolean;
  }
): void {
  setFillColorHex(doc, config.bgColor);
  setDrawColorHex(doc, config.borderColor);
  doc.setLineWidth(0.5);

  if (options?.flushLeft) {
    doc.roundedRect(x, y, width, height, 3, 3, 'FD');
    setFillColorHex(doc, config.bgColor);
    doc.rect(x, y, 4, height, 'F');
    setDrawColorHex(doc, config.borderColor);
    doc.line(x, y, x, y + height);
    doc.line(x, y, x + 4, y);
    doc.line(x, y + height, x + 4, y + height);
  } else {
    doc.roundedRect(x, y, width, height, 3, 3, 'FD');
  }

  doc.setFontSize(12.5);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  doc.text(config.title, x + 4, y + 8);

  doc.setFontSize(10.8);
  doc.setFont('helvetica', 'bold');
  setTextColorHex(doc, COLORS.black);
  const lines = doc.splitTextToSize(config.description, width - 8);
  doc.text(lines, x + 4, y + 15);
}
