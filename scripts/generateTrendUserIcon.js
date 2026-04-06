const sharp = require('sharp');
const fs = require('fs');

async function run() {
  try {
    let svgContent = fs.readFileSync('public/arrow-trend-up.svg', 'utf8');
    svgContent = svgContent.replace('<svg', '<svg fill="#996600"');
    
    const pngBuffer = await sharp(Buffer.from(svgContent))
      .resize(500, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    const base64 = pngBuffer.toString('base64');
    
    let base64File = fs.readFileSync('./lib/pdf-client/components/logoBase64.ts', 'utf8');
    
    // Replace the previous manual TREND_ARROW_BASE64 definition entirely
    const regex = /export const TREND_ARROW_BASE64 = '.*';/;
    if (regex.test(base64File)) {
      base64File = base64File.replace(regex, `export const TREND_ARROW_BASE64 = 'data:image/png;base64,${base64}';`);
    } else {
      base64File += `\nexport const TREND_ARROW_BASE64 = 'data:image/png;base64,${base64}';\n`;
    }
    
    fs.writeFileSync('./lib/pdf-client/components/logoBase64.ts', base64File);
    console.log('Successfully embedded user trend-arrow-up Base64');
  } catch (err) {
    console.error('Error generating icon:', err);
  }
}

run();
