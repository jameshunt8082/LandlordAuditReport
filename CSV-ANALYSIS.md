# CSV Data Analysis - Landlord Audit Questions

**Date:** November 14, 2025  
**File:** `data.csv`  
**Purpose:** Integrate extended question data into database for PDF report generation

---

## 📋 Executive Summary

The CSV contains **26 questions** with **extensive metadata** that is NOT currently in our database. Most importantly, it includes:

1. **Contextual explanations** for each score range (red/orange/green)
2. **Report actions** tailored to each score
3. **Motivation/learning points** for auditors
4. **Full descriptions** and **overlooked compliance points**

These fields are **essential** for generating the professional "Recommended Actions" section that James requested.

---

## 🔍 CSV Structure Analysis

### Header Rows (Rows 1-16)
The CSV has **metadata rows** before the actual data:
- Row 2: Column categories (Report, Questionnaire, etc.)
- Row 9-10: **Database field names** (the canonical reference)
- Row 11-16: Usage flags (questionnaire, report, calculations, etc.)

### Data Rows (Row 17+)
**26 questions** covering 3 main categories:
1. **Documentation** (11 questions: 1.1-8.1)
2. **Landlord-Tenant Communication** (5 questions: 9.1-13.1)
3. **Evidence Gathering Systems and Procedures** (10 questions: 14.1-21.1)

---

## 📊 Column Mapping

### Columns Currently in DB ✅
| CSV Column | Field Name | Description | In DB? |
|------------|------------|-------------|--------|
| C | `cat` | Main Category | ✅ Yes |
| D | `sub_cat_ref` | Sub Category No | ✅ Yes |
| E | `sub_cat_name` | Sub Category Name | ✅ Yes |
| O | `question_no` | Question number (e.g., "1.1") | ✅ Yes |
| P | `survey_question` | Question text | ✅ Yes |
| Q | `answer_options` | Answer choices | ✅ Yes |
| T | `weight_factor` | Question importance (1-2) | ✅ Yes |

### Columns NOT in DB ❌ (NEED TO ADD)
| CSV Column | Field Name | Description | Usage |
|------------|------------|-------------|-------|
| J | `often_overlooked` | Commonly missed compliance points | Report |
| L | `sub_notes` | Specific requirements detail | Report |
| M | `full_description` | Comprehensive area description | Report |
| **U** | **`motivation`** | **Educational context for auditors** | **Report** |
| **V** | **`red_score_example`** | **Critical risk scenario (scores 1-4)** | **Report** ⭐ |
| **W** | **`orange_score_example`** | **Partial compliance (scores 5-8)** | **Report** ⭐ |
| **X** | **`green_score_example`** | **Best practice (scores 9-10)** | **Report** ⭐ |
| **Y** | **`report_action`** | **Recommended actions by score** | **Report** ⭐ |

⭐ = **Critical for "Recommended Actions" page**

---

## 🎯 Key Findings

### 1. The Missing Pieces for "Recommended Actions"

James wants **column U** and **column X** in the report. But looking at the CSV:

**Column U (motivation):**
```
"If you don't have them, you can't legally evict a tenant"
"It's critically important to track renewal dates as if there is a gap a tenant can use this fact to stop an eviction."
```
→ This is **educational context**, not the main action text.

**Column X (green_score_example):**
```
"All certificates are current and stored digitally. Proactive alert system is in place for renewals."
```
→ This is the **best practice scenario**, not actions.

**Column Y (report_action):** ⭐ **THIS is what we actually need!**
```
"Red: Immediately book all required safety inspections and obtain valid certificates. 
Orange: Digitize all current certificates and set up reliable reminder system. 
Green: Continue maintaining excellent digital record-keeping."
```

### 2. James' Request Interpretation

When James said:
- **"Column U"** → He likely meant column **V** (`red_score_example`) for context
- **"Column X"** → He likely meant column **Y** (`report_action`) for actions

**Why the confusion?**
- Columns in spreadsheet UI don't always match CSV column letters
- The actual field names are `red_score_example` (V), `orange_score_example` (W), `green_score_example` (X), and `report_action` (Y)

---

## 📝 Proposed Database Schema Changes

### Option 1: Add All Missing Columns (Recommended)

```sql
-- Add new columns to questions table
ALTER TABLE questions 
ADD COLUMN often_overlooked TEXT,
ADD COLUMN sub_notes TEXT,
ADD COLUMN full_description TEXT,
ADD COLUMN motivation TEXT,
ADD COLUMN red_score_example TEXT,
ADD COLUMN orange_score_example TEXT,
ADD COLUMN green_score_example TEXT,
ADD COLUMN report_action TEXT;
```

**Pros:**
- Future-proof for additional report sections
- Preserves all valuable data from CSV
- Enables rich, context-aware recommendations

**Cons:**
- Larger database schema
- More data to maintain

### Option 2: Add Only Critical Columns (Minimal)

```sql
-- Add only report-critical columns
ALTER TABLE questions 
ADD COLUMN red_score_example TEXT,
ADD COLUMN orange_score_example TEXT,
ADD COLUMN report_action TEXT;
```

**Pros:**
- Minimal schema change
- Only what's needed for current report

**Cons:**
- May need to add more columns later
- Loses valuable metadata

---

## 🔧 Implementation Plan

### Phase 1: Database Migration

**1.1 Create Migration Script**
```typescript
// db/add-report-columns.ts
import { sql } from '@vercel/postgres';

export async function addReportColumns() {
  await sql`
    ALTER TABLE questions 
    ADD COLUMN IF NOT EXISTS often_overlooked TEXT,
    ADD COLUMN IF NOT EXISTS sub_notes TEXT,
    ADD COLUMN IF NOT EXISTS full_description TEXT,
    ADD COLUMN IF NOT EXISTS motivation TEXT,
    ADD COLUMN IF NOT EXISTS red_score_example TEXT,
    ADD COLUMN IF NOT EXISTS orange_score_example TEXT,
    ADD COLUMN IF NOT EXISTS green_score_example TEXT,
    ADD COLUMN IF NOT EXISTS report_action TEXT;
  `;
}
```

**1.2 Create CSV Import Script**
```typescript
// db/import-csv-data.ts
import { parse } from 'csv-parse/sync';
import { sql } from '@vercel/postgres';

export async function importCSVData() {
  // Read data.csv
  // Skip first 16 header rows
  // For each question row:
  //   - Parse CSV columns
  //   - UPDATE questions table WHERE question_number = row.question_no
  //   - SET new columns from CSV data
}
```

### Phase 2: Update Type Definitions

```typescript
// types/database.ts
export interface Question {
  // Existing fields...
  question_number: string;
  question_text: string;
  category: string;
  subcategory: string;
  weight: number;
  options: QuestionOption[];
  
  // NEW fields from CSV
  often_overlooked?: string;
  sub_notes?: string;
  full_description?: string;
  motivation?: string;
  red_score_example?: string;
  orange_score_example?: string;
  green_score_example?: string;
  report_action?: string;
}
```

### Phase 3: Update API Endpoints

```typescript
// app/api/audits/review/[id]/route.ts
// Already returns questions - just needs to include new fields
// No code changes needed if using SELECT *
```

### Phase 4: Update PDF Generation

**4.1 Update `recommendations.ts`**
```typescript
// Current placeholder logic:
function generateSuggestion(subcat: SubcategoryScore, data: ReportData): string {
  if (subcat.color === 'red') {
    return `Critical improvement needed...`;
  }
  // ...
}

// NEW logic using CSV data:
function generateSuggestion(subcat: SubcategoryScore, data: ReportData): string {
  // Find questions in this subcategory
  const questions = data.questionResponses[subcat.color].filter(
    q => q.subcategory === subcat.name
  );
  
  // Use report_action from question data
  if (questions.length > 0) {
    return parseReportAction(questions[0].report_action, subcat.color);
  }
  
  return fallbackSuggestion(subcat);
}

function parseReportAction(reportAction: string, color: 'red' | 'orange' | 'green'): string {
  // Parse: "Red: Do X. Orange: Do Y. Green: Do Z."
  const match = reportAction.match(new RegExp(`${color}:\\s*([^.]+)`, 'i'));
  return match ? match[1].trim() : reportAction;
}
```

**4.2 Update "Suggestions for Improvement" Page**

Use `red_score_example` for **context/reason** (left column):
```typescript
const tableBody = category.subcats.map(subcat => {
  // Find the question to get examples
  const question = findQuestionForSubcat(subcat, data);
  
  // Left column: WHY this is an issue (context)
  const context = subcat.color === 'red' 
    ? question?.red_score_example 
    : question?.orange_score_example;
  
  // Right column: WHAT to do (action)
  const action = question?.report_action 
    ? parseReportAction(question.report_action, subcat.color)
    : fallbackAction(subcat);
  
  return [
    `${subcat.name}\nScore: ${subcat.score.toFixed(2)}\n${context}`,
    `• ${action}`
  ];
});
```

---

## 🚀 How to Use in Report

### "Recommended Actions" Page Structure

```
Recommended Actions
Suggestions for Improvement

[Intro text about red/orange scores]

Documentation
┌─────────────────────────────────┬──────────────────────────────────┐
│ Subcategory                     │ Suggestions for Improvement      │
├─────────────────────────────────┼──────────────────────────────────┤
│ Certificates                    │ • Immediately book all required  │
│ Score: 2.94                     │   safety inspections and obtain  │
│                                 │   valid certificates             │
│ Context: Any single certificate │                                  │
│ is missing or out of date. No  │                                  │
│ renewal tracking system in      │                                  │
│ place.                          │                                  │
└─────────────────────────────────┴──────────────────────────────────┘
```

### Data Flow

```
CSV (data.csv)
    ↓
Import Script (db/import-csv-data.ts)
    ↓
Database (questions table with new columns)
    ↓
API (/api/audits/review/[id])
    ↓
Report Data (transformAuditToReportData)
    ↓
PDF Generator (recommendations.ts)
    ↓
Final PDF with rich, context-aware recommendations
```

---

## ⚠️ Important Notes

### 1. Question Matching
The CSV uses `question_no` (e.g., "1.1", "2.1") to match questions. Our database uses `question_number`. **These must align perfectly.**

### 2. Data Consistency
Some questions in CSV may not exist in DB, or vice versa. Import script should:
- ✅ Update existing questions
- ⚠️ Log warnings for missing questions
- ❌ Skip questions not in DB

### 3. Text Formatting
`report_action` contains **all three colors** in one field:
```
"Red: Do X. Orange: Do Y. Green: Do Z."
```
We need to **parse this** based on the actual score color.

### 4. CSV Encoding
The CSV may have special characters, newlines in cells, etc. Use proper CSV parser (like `csv-parse`).

---

## 📦 Deliverables

1. **Migration script** to add new columns to `questions` table
2. **Import script** to populate new columns from CSV
3. **Updated TypeScript types** for Question interface
4. **Enhanced PDF generation** using new rich data
5. **Testing** to verify all 26 questions have complete data

---

## ✅ Recommendation

**Proceed with Option 1** (Add all missing columns) because:
1. Future-proofs the system
2. Preserves valuable educational content
3. Enables richer reporting features later
4. Minimal performance impact (text columns are cheap)

**Next Steps:**
1. Get confirmation from James on column interpretation
2. Create and run migration script
3. Create and run import script
4. Update PDF generation logic
5. Test with real audit data

---

## 🎯 Success Criteria

✅ All 26 questions have `report_action` populated  
✅ All 26 questions have `red_score_example` and `orange_score_example`  
✅ "Recommended Actions" page shows rich, contextual suggestions  
✅ No hardcoded fallback text in production PDFs  
✅ All data properly formatted and parsed  

---

**End of Analysis**

