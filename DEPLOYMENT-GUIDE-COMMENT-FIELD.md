# Deployment Guide: Comment Field Implementation

This guide walks you through deploying the new "Comment" field feature to your Vercel-hosted application.

## Overview

The Comment field has been added to the question creation/editing forms. This field allows clients to see helpful guidance when answering questions in the audit.

**Changes Made:**
- ✅ Database schema updated (`comment` column added)
- ✅ API routes updated (POST and PATCH endpoints)
- ✅ UI forms updated (New Question and Edit Question pages)
- ✅ Form validation (Zod schemas) updated

---

## Prerequisites

- Vercel account with access to your project
- Vercel Postgres database already set up
- Git repository connected to Vercel

---

## Step 1: Update Local Database (Optional - For Local Testing)

If you're running the database locally or want to test before deploying:

```sql
ALTER TABLE question_templates 
ADD COLUMN IF NOT EXISTS comment TEXT;
```

**How to run:**
- If using Vercel Postgres locally, run via psql or your SQL client
- If not testing locally, skip to Step 2

---

## Step 2: Commit Your Changes to Git

1. **Check what files were changed:**
   ```bash
   git status
   ```

2. **Review the changes:**
   ```bash
   git diff
   ```

3. **Stage the modified files:**
   ```bash
   git add app/api/admin/questions/route.ts
   git add app/api/admin/questions/[id]/route.ts
   git add app/dashboard/questions/new/page.tsx
   git add app/dashboard/questions/[id]/page.tsx
   git add db/schema-questions.sql
   git add db/add-comment-column.sql
   ```

4. **Commit the changes:**
   ```bash
   git commit -m "Add Comment field to question forms

   - Added comment column to database schema
   - Updated API routes (POST and PATCH) to handle comment field
   - Added Comment field UI to new and edit question forms
   - Field appears above Motivation/Learning Point with Info tooltip"
   ```

5. **Push to your repository:**
   ```bash
   git push origin main
   ```
   (Replace `main` with your branch name if different)

---

## Step 3: Update Vercel Postgres Database

### Option A: Using Vercel Dashboard (Recommended for Beginners)

1. **Log in to Vercel**
   - Go to https://vercel.com
   - Sign in to your account

2. **Navigate to your project**
   - Click on your project name (e.g., "landlord-audit")

3. **Go to Storage tab**
   - Click on the **"Storage"** tab in the top menu

4. **Select your Postgres database**
   - Click on your database name

5. **Open the Query tab**
   - Click on the **"Query"** or **"Data"** tab
   - Look for a SQL query interface

6. **Run the migration SQL:**
   ```sql
   ALTER TABLE question_templates 
   ADD COLUMN IF NOT EXISTS comment TEXT;
   ```

7. **Execute the query**
   - Click "Run Query" or "Execute"
   - You should see a success message: `ALTER TABLE`

8. **Verify the column was added:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'question_templates' 
   ORDER BY ordinal_position;
   ```
   - Look for `comment | text` in the results

### Option B: Using Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Link your project:**
   ```bash
   vercel link
   ```

4. **Get database connection string:**
   ```bash
   vercel env pull .env.production
   ```

5. **Connect to database using psql:**
   ```bash
   # Use the POSTGRES_URL from .env.production
   psql "<your-connection-string-here>"
   ```

6. **Run the migration:**
   ```sql
   ALTER TABLE question_templates 
   ADD COLUMN IF NOT EXISTS comment TEXT;
   ```

7. **Exit psql:**
   ```
   \q
   ```

---

## Step 4: Verify Vercel Deployment

Vercel automatically deploys when you push to your repository.

1. **Check deployment status:**
   - Go to https://vercel.com/your-username/your-project
   - You should see a new deployment in progress
   - Wait for the status to show **"Ready"** (usually 2-5 minutes)

2. **View deployment logs:**
   - Click on the deployment
   - Check the "Build Logs" tab for any errors
   - Look for: `✓ Compiled successfully`

---

## Step 5: Test the New Feature

### Test on Production:

1. **Navigate to your live site:**
   - Go to your production URL (e.g., `https://your-app.vercel.app`)

2. **Log in to the dashboard:**
   - Use your auditor credentials

3. **Test creating a new question:**
   - Go to: `/dashboard/questions`
   - Click **"Add New Question"**
   - You should see the **"Comment"** field above "Motivation / Learning Point"
   - Hover over the Info icon to see the tooltip
   - Fill in the form including the Comment field
   - Click **"Create Question"**

4. **Test editing an existing question:**
   - Go to: `/dashboard/questions`
   - Click on any question to edit
   - You should see the **"Comment"** field with any existing data (or empty)
   - Modify the comment
   - Click **"Save Changes"**

5. **Verify data persistence:**
   - Edit the same question again
   - Confirm the Comment field retained your changes

---

## Step 6: Verify Database (Optional)

To confirm the data is being stored correctly:

1. **Go to Vercel Storage tab** (as in Step 3)

2. **Run a test query:**
   ```sql
   SELECT id, question_number, question_text, comment 
   FROM question_templates 
   WHERE comment IS NOT NULL 
   LIMIT 5;
   ```

3. **Check results:**
   - You should see questions with their comment values

---

## Troubleshooting

### Issue: "Column 'comment' does not exist"

**Solution:**
- The database migration didn't run
- Go back to **Step 3** and run the ALTER TABLE command
- Make sure you're connected to the correct database (production vs. preview)

### Issue: "Field is not showing in the form"

**Solution:**
1. **Hard refresh your browser:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Check deployment logs:**
   - Ensure the build completed successfully
   - Look for any TypeScript or build errors

3. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run build
   ```

### Issue: "Changes not deploying to Vercel"

**Solution:**
1. **Verify git push succeeded:**
   ```bash
   git log --oneline -1
   ```
   - Confirm your commit is there

2. **Check Vercel dashboard:**
   - Look for the deployment
   - If not there, trigger manually: `vercel --prod`

3. **Check branch settings:**
   - Vercel may be watching a different branch
   - Go to Project Settings → Git → Production Branch

### Issue: "Form validation errors"

**Solution:**
- The Comment field is **optional**, so it shouldn't block form submission
- Check browser console for JavaScript errors (F12 → Console tab)
- If you see validation errors, clear your browser cache

---

## Rollback Instructions (If Needed)

If something goes wrong and you need to revert:

### Rollback Code:

1. **Revert the git commit:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Wait for Vercel to redeploy**
   - This will restore the previous version

### Rollback Database (if needed):

```sql
ALTER TABLE question_templates 
DROP COLUMN IF EXISTS comment;
```

**⚠️ Warning:** This will delete all comment data. Only do this if absolutely necessary.

---

## Summary Checklist

- [ ] Committed changes to git repository
- [ ] Pushed to main/production branch
- [ ] Ran database migration on Vercel Postgres
- [ ] Verified migration succeeded (column exists)
- [ ] Waited for Vercel deployment to complete
- [ ] Tested creating new question with Comment field
- [ ] Tested editing existing question
- [ ] Verified data persistence in database

---

## Support

If you encounter issues not covered in this guide:

1. **Check Vercel deployment logs** for build errors
2. **Check browser console** (F12) for runtime errors
3. **Verify database connection** in `.env.local` (locally) or Vercel Environment Variables
4. **Review the terminal output** when running `npm run dev` locally

---

## Files Modified

For reference, here are all the files that were changed:

```
db/schema-questions.sql                      (Schema definition)
db/add-comment-column.sql                    (Migration script)
app/api/admin/questions/route.ts             (POST endpoint)
app/api/admin/questions/[id]/route.ts        (PATCH endpoint)
app/dashboard/questions/new/page.tsx         (New question form)
app/dashboard/questions/[id]/page.tsx        (Edit question form)
```

---

## Next Steps

After successful deployment:

1. **Monitor for errors:**
   - Check Vercel logs for the first few days
   - Watch for any runtime errors

2. **Update documentation:**
   - Inform your team about the new Comment field
   - Update user guides if needed

3. **Consider adding tests:**
   - Add tests for the Comment field functionality
   - Ensure future changes don't break this feature

---

**Deployment Date:** November 25, 2025  
**Feature:** Comment Field Implementation  
**Version:** 1.0.0


