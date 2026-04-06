const sharp = require('sharp');
const fs = require('fs');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="#996600" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
  <polyline points="16 7 22 7 22 13"/>
</svg>
`;

async function run() {
  try {
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();
    
    const base64 = pngBuffer.toString('base64');
    
    // Append to logoBase64.ts
    const exportCode = `\nexport const TREND_ARROW_BASE64 = 'data:image/png;base64,${base64}';\n`;
    fs.appendFileSync('./lib/pdf-client/components/logoBase64.ts', exportCode);
    console.log('Successfully generated and appended TREND_ARROW_BASE64');
  } catch (err) {
    console.error('Error generating icon:', err);
  }
}

run();
