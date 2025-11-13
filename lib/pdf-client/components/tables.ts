// Reusable Table Configuration
import { UserOptions } from 'jspdf-autotable';
import { COLORS, FONTS, hexToRgb } from '../styles';

/**
 * Get default table styles matching the original design
 */
export function getDefaultTableStyles(): Partial<UserOptions> {
  return {
    theme: 'grid',
    styles: {
      fontSize: FONTS.tableCell.size,
      cellPadding: 3,
      lineColor: hexToRgb(COLORS.lightGray),
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: hexToRgb(COLORS.paleBlue),
      textColor: hexToRgb(COLORS.black),
      fontSize: FONTS.tableHeader.size,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      textColor: hexToRgb(COLORS.black),
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
  };
}

/**
 * Get compact table styles for dense information
 */
export function getCompactTableStyles(): Partial<UserOptions> {
  return {
    ...getDefaultTableStyles(),
    styles: {
      ...getDefaultTableStyles().styles,
      cellPadding: 2,
      fontSize: 10,
    },
  };
}

