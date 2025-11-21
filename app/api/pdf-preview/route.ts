// PDF Preview API - For development/testing
// Generates PDF using jsPDF for real-time preview
import { NextResponse } from 'next/server';
import { generateCompletePDF } from '@/lib/pdf-client/generator';
import { createMockReportData } from '@/lib/pdf-client/mockData';

/**
 * GET /api/pdf-preview
 * Generate PDF preview with mock data for development
 */
export async function GET() {
  try {
    console.log('[PDF Preview] Generating preview PDF...');
    
    // Generate mock report data
    const mockData = createMockReportData();
    
    // Generate PDF using jsPDF
    const doc = await generateCompletePDF(mockData);
    
    // Convert to buffer (jsPDF output('arraybuffer') works in Node.js)
    const pdfArrayBuffer = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfArrayBuffer);
    
    console.log('[PDF Preview] ✅ PDF generated successfully');
    
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[PDF Preview] ❌ Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate preview PDF',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

