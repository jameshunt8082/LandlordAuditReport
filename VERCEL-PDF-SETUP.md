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

## 🔧 CRITICAL: Vercel Environment Variable (REQUIRED)

**The Chromium binaries are NOT included by default. You MUST add this:**

**Dashboard → Settings → Environment Variables**

### Required Variable:

- **Name:** `CHROMIUM_REMOTE_EXEC_PATH`
- **Value:** `https://github.com/Sparticuz/chromium/releases/download/v141.0.0/chromium-v141.0.0-pack.tar.br`
- **Apply to:** Production, Preview, Development

**Why:** This tells @sparticuz/chromium to download the Chromium binary from GitHub releases instead of looking for it locally in `/var/task/node_modules/@sparticuz/chromium/bin`.

### Optional Variable (for Node.js 22.x):

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

