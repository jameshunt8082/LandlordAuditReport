const sharp = require('sharp');
const fs = require('fs');

async function run() {
  try {
    const pngBuffer = fs.readFileSync('public/traffic-light.png');
    
    // Resize slightly for optimization
    const optimizedBuffer = await sharp(pngBuffer)
      .resize(256, 256, { fit: 'contain' })
      .png()
      .toBuffer();
    
    const base64 = optimizedBuffer.toString('base64');
    
    const exportCode = `\nexport const TRAFFIC_LIGHT_BASE64 = 'data:image/png;base64,${base64}';\n`;
    fs.appendFileSync('./lib/pdf-client/components/logoBase64.ts', exportCode);
    console.log('Successfully generated and appended TRAFFIC_LIGHT_BASE64');
  } catch (err) {
    console.error('Error generating icon:', err);
  }
}

run();
