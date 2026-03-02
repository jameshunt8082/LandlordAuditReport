// Quick test: generate PDF using jsPDF with mock data (no DB needed)
import fs from 'fs';
import path from 'path';
import { generateCompletePDF } from '../lib/pdf-client/generator';
import { createMockReportData } from '../lib/pdf-client/mockData';

async function testPDF() {
  console.log('Generating test PDF with mock data (no DB)...\n');

  const startTime = Date.now();
  const mockData = createMockReportData();

  console.log(`Mock data created:`);
  console.log(`  Property: ${mockData.propertyAddress}`);
  console.log(`  Landlord: ${mockData.landlordName}`);
  console.log(`  Score: ${mockData.overallScore}`);
  console.log(`  Red: ${mockData.questionResponses.red.length}`);
  console.log(`  Orange: ${mockData.questionResponses.orange.length}`);
  console.log(`  Green: ${mockData.questionResponses.green.length}\n`);

  const doc = await generateCompletePDF(mockData);
  const pdfArrayBuffer = doc.output('arraybuffer');
  const pdfBuffer = Buffer.from(pdfArrayBuffer);

  const renderTime = Date.now() - startTime;
  const sizeKB = Math.round(pdfBuffer.length / 1024);

  const outputPath = path.join(process.cwd(), 'test-report.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log(`PDF generated in ${renderTime}ms (${sizeKB} KB)`);
  console.log(`Saved to: ${outputPath}`);

  // Open on Linux
  const { exec } = require('child_process');
  exec(`xdg-open "${outputPath}"`);

  process.exit(0);
}

testPDF().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
