# Vercel PDF Generation Setup

## ✅ What Was Fixed (Commit 5d5d866)

### 1. Next.js Configuration (`next.config.mjs`)
Added `serverExternalPackages` to tell Next.js NOT to bundle Puppeteer/Chromium:

```javascript
serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
```

**Why:** These packages need to run natively in Vercel's serverless environment, not bundled.

**Note:** In Next.js 16+, this moved from `experimental.serverComponentsExternalPackages` to `serverExternalPackages` (root level).

### 2. Puppeteer Launch Configuration (`lib/pdf/puppeteer-generator.ts`)
Using @sparticuz/chromium for executable path and args:

```javascript
browser = await puppeteer.launch({
  args: chromium.args,                       // ✅ Serverless-optimized arguments
  defaultViewport: { width: 1920, height: 1080 }, // Explicit viewport
  executablePath: await chromium.executablePath(), // ✅ Chromium binary path
  headless: true,                            // Explicit headless mode
});
```

**Why:** 
- `chromium.args` provides serverless-optimized flags
- `chromium.executablePath()` locates the Chromium binary in Vercel
- Viewport and headless are set explicitly (chromium doesn't export these properties)

---

## 🧪 Testing

After deployment `5d5d866` is live:

1. Go to: `https://landlord-audit.vercel.app/dashboard/audit/17/report`
2. Click "Download PDF"
3. Check Vercel logs for:
   - ✅ `[Puppeteer] Browser launched in Xms`
   - ✅ `[Puppeteer] ✅ PDF generated in Xms`

---

## 🔧 Optional: Vercel Environment Variable (If Still Failing)

If you still see errors related to `libnss3.so` or shared libraries, add this in Vercel Dashboard:

**Dashboard → Settings → Environment Variables**

- **Name:** `AWS_LAMBDA_JS_RUNTIME`
- **Value:** `nodejs22.x`
- **Apply to:** Production, Preview, Development

This helps resolve missing shared library errors in Node.js 22.x environments.

---

## 📚 References

- [Vercel Guide: Deploying Puppeteer with Next.js](https://vercel.com/guides/deploying-puppeteer-with-nextjs-on-vercel)
- [@sparticuz/chromium GitHub](https://github.com/Sparticuz/chromium)

---

## 🎯 Expected Outcome

Puppeteer should now successfully launch Chromium in Vercel and generate PDFs server-side.

**Previous error:**
```
The input directory "/var/task/node_modules/@sparticuz/chromium/bin" does not exist
```

**Should now:**
- Find Chromium correctly
- Launch browser
- Generate PDF
- Return 200 response

