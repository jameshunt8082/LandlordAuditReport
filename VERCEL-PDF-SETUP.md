# Vercel PDF Generation Setup

## ✅ What Was Fixed (Commit f2068d7)

### 1. Next.js Configuration (`next.config.mjs`)
Added `serverComponentsExternalPackages` to tell Next.js NOT to bundle Puppeteer/Chromium:

```javascript
experimental: {
  serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
}
```

**Why:** These packages need to run natively in Vercel's serverless environment, not bundled.

### 2. Puppeteer Launch Configuration (`lib/pdf/puppeteer-generator.ts`)
Changed from hardcoded values to @sparticuz/chromium optimized settings:

```javascript
browser = await puppeteer.launch({
  args: chromium.args,                    // ✅ Optimized for serverless
  defaultViewport: chromium.defaultViewport, // ✅ Optimized for serverless
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,            // ✅ Optimized for serverless
});
```

**Why:** @sparticuz/chromium provides serverless-optimized configurations.

---

## 🧪 Testing

After deployment `f2068d7` is live:

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

