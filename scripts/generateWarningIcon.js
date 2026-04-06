const sharp = require('sharp');
const fs = require('fs');

async function run() {
  try {
    // Read the SVG
    let svgContent = fs.readFileSync('public/triangle-warning.svg', 'utf8');
    
    // Inject fill color matching the original red flag requirement
    // The path doesn't have a fill attribute, so we add one to the svg tag.
    svgContent = svgContent.replace('<svg', '<svg fill="#990000"');
    
    const pngBuffer = await sharp(Buffer.from(svgContent))
      // Output to matching square sizing for safe aspect ratios
      .resize(500, 500, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    const base64 = pngBuffer.toString('base64');
    
    // Append to logoBase64.ts
    const exportCode = `\nexport const WARNING_TRIANGLE_BASE64 = 'data:image/png;base64,${base64}';\n`;
    fs.appendFileSync('./lib/pdf-client/components/logoBase64.ts', exportCode);
    console.log('Successfully generated and appended WARNING_TRIANGLE_BASE64');
  } catch (err) {
    console.error('Error generating icon:', err);
  }
}

run();
