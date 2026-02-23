// PDF Generation using Puppeteer (Vercel compatible)
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// Remote Chromium binary URL for Vercel serverless (x64 architecture)
const CHROMIUM_REMOTE_URL = 'https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.x64.tar';

/**
 * Generate PDF from HTML using Puppeteer
 * Works reliably in Vercel serverless environment
 */
export async function generatePDFFromHTML(html: string): Promise<Buffer> {
  const startTime = Date.now();
  console.log('[Puppeteer] Launching browser...');
  
  const isVercel = !!process.env.VERCEL;
  console.log('[Puppeteer] Environment:', { isVercel, NODE_ENV: process.env.NODE_ENV });
  
  let browser;
  
  try {
    // On Vercel, the local bin directory doesn't exist.
    // Pass the remote URL to executablePath() so it downloads at runtime.
    let executablePath: string;
    
    if (isVercel) {
      console.log('[Puppeteer] Vercel detected - using remote Chromium binary...');
      executablePath = await chromium.executablePath(CHROMIUM_REMOTE_URL);
    } else {
      console.log('[Puppeteer] Local environment - using local Chromium...');
      executablePath = await chromium.executablePath();
    }
    
    console.log('[Puppeteer] Chromium path:', executablePath);
    
    // Launch browser with Chromium optimized for serverless
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1920, height: 1080 },
      executablePath,
      headless: true,
    });
    
    console.log(`[Puppeteer] Browser launched in ${Date.now() - startTime}ms`);
    
    const page = await browser.newPage();
    
    // Set content
    console.log('[Puppeteer] Setting HTML content...');
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    console.log('[Puppeteer] Generating PDF...');
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });
    
    await browser.close();
    
    const totalTime = Date.now() - startTime;
    const sizeKB = Math.round(pdf.length / 1024);
    console.log(`[Puppeteer] PDF generated in ${totalTime}ms (${sizeKB} KB)`);
    
    return Buffer.from(pdf);
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('[Puppeteer] Error generating PDF:', error);
    throw error;
  }
}

