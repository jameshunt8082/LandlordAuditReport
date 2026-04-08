# PDF Report Agent Notes

This document summarizes how the PDF report is generated in this codebase and records the important findings and changes made during the current PDF refinement work. It is intended as handoff context for future AI/code agents.

## Current PDF Generation Stack

The live PDF generation path uses:

- `jsPDF`
- `jspdf-autotable`

It does **not** use Puppeteer, Playwright, Chromium, `react-pdf`, or `pdfkit` in the current report pipeline.

Primary reference:

- [lib/pdf-client/README.md](/Users/nelsoncosta/dev/LandlordAuditReport/lib/pdf-client/README.md)

## Live Entry Points

There are two report generation endpoints:

- Public self-service route:
  [app/api/audits/[token]/report/route.ts](/Users/nelsoncosta/dev/LandlordAuditReport/app/api/audits/[token]/report/route.ts)
- Authenticated/admin route:
  [app/api/reports/[auditId]/route.ts](/Users/nelsoncosta/dev/LandlordAuditReport/app/api/reports/[auditId]/route.ts)

The self-service report viewer page is:

- [app/audit/[token]/report/page.tsx](/Users/nelsoncosta/dev/LandlordAuditReport/app/audit/[token]/report/page.tsx)

Both API routes do the same core work:

1. Load the audit record.
2. Load `form_responses`.
3. Load questions for the audit tier from the DB via `getQuestionsForTier()`.
4. Fall back to static questions in `lib/questions.ts` if needed.
5. Calculate scores.
6. Transform raw data into `ReportData`.
7. Render the PDF with `generateCompletePDF()`.
8. Return the PDF bytes in the HTTP response.

## Main Data Flow

The effective runtime flow is:

`audits + form_responses + tier questions -> calculateAuditScores() -> transformAuditToReportData() -> generateCompletePDF() -> PDF buffer`

Core files:

- [lib/questions-db.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/questions-db.ts)
- [lib/scoring.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/scoring.ts)
- [lib/pdf/formatters.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/pdf/formatters.ts)
- [lib/pdf-client/generator.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/pdf-client/generator.ts)

## Important Discovery About Question Data

The PDF text and labels are driven primarily by question metadata loaded from the database path, not only by the static fallback in `lib/questions.ts`.

That matters because:

- UI labels in the PDF can remain stale if the database still carries older names.
- Updating only `lib/questions.ts` is not always enough to change rendered PDF output.

Example from this session:

- Static question dictionary already used `Cleaning Products`.
- DB-backed data could still return `Product Buying`.
- The score summary and other visual sections render the subcategory name coming from the loaded question data.

To guard against this, `lib/questions-db.ts` now normalizes `Product Buying` to `Cleaning Products`.

Related files:

- [lib/questions-db.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/questions-db.ts)
- [db/seed-neon.py](/Users/nelsoncosta/dev/LandlordAuditReport/db/seed-neon.py)

## ReportData Shape

`transformAuditToReportData()` prepares a PDF-friendly view model with:

- header fields like property address and landlord name
- overall score and risk tier
- category scores
- subcategory average scores
- grouped recommendations
- question responses split into `red`, `orange`, and `green`
- suggested services for low-scoring areas

Important detail:

- comments shown in the PDF come from `form_responses.comment`
- `score_examples` from question metadata are used to produce better recommendation text when available

## Current Live Page Composition

The live generator currently renders these pages in order:

1. Cover page
2. Page 2 section with `Introduction` and `Audit Scope`
3. `Score Summary`
4. `Recommended Actions`
5. `Detailed Results`

Source:

- [lib/pdf-client/generator.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/pdf-client/generator.ts)

Important note:

- Several older pages still exist in `lib/pdf-client/pages/`, but many are commented out in the generator and are not part of the current report.
- The README is slightly stale because it still references the old `introduction.ts` page, while the live layout now folds that concept into the current page-2 implementation.

## Current Page Responsibilities

### Cover Page

File:

- [lib/pdf-client/pages/coverPage.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/pdf-client/pages/coverPage.ts)

Responsibilities:

- custom visual cover layout
- property/client/date summary
- overall score display
- compliance-status summary
- traffic-light legend banners

### Introduction / Audit Scope Page

File:

- [lib/pdf-client/pages/auditScope.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/pdf-client/pages/auditScope.ts)

Current structure:

- main H1: `Introduction`
- two justified introductory paragraphs
- H2: `Audit Scope`
- a short explanatory line
- the three audit-area bullet points

This page previously started directly with `Audit Scope`. It was changed to include a proper introductory section first.

### Score Summary

File:

- [lib/pdf-client/pages/evidenceSummary.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/pdf-client/pages/evidenceSummary.ts)

Responsibilities:

- grouped by the 3 major categories
- one table per category
- rows sorted by traffic-light color order: red, orange, green
- visual status indicator rendered with the traffic-light component

This is the section where the stale `Product Buying` label surfaced before the DB normalization fix.

### Recommended Actions

File:

- [lib/pdf-client/pages/recommendations.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/pdf-client/pages/recommendations.ts)

Responsibilities:

- green H1 and green category subheadings
- justified introductory paragraphs
- one table per category
- only red/orange issues are shown
- recommendation text is derived from `score_examples.report_action` first, then service recommendations, then generic fallback text

### Detailed Results

File:

- [lib/pdf-client/pages/detailedResults.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/pdf-client/pages/detailedResults.ts)

Responsibilities:

- green H1
- justified intro paragraph
- full question/answer/comment listing
- now uses `jspdf-autotable` for a UI closer to `Recommended Actions`

Important change:

- This section used to use a custom manually drawn table layout.
- It was refactored to use `autoTable` so the visual style is more consistent with `Recommended Actions`.

## Typography and Paragraph Justification

A small shared helper was added:

- [lib/pdf-client/utils.ts](/Users/nelsoncosta/dev/LandlordAuditReport/lib/pdf-client/utils.ts)

Helper:

- `drawJustifiedText()`

This is now used in the live report for paragraph-style body text, including:

- page-2 introduction paragraphs
- the `Recommended Actions` intro text
- the `Detailed Results` intro text

If future agents add more paragraph blocks to active pages, use `drawJustifiedText()` instead of raw `doc.text(splitTextToSize(...))` where justified body copy is desired.

## Color Standardization Decisions

During this session, heading colors were standardized so the live report uses the same green heading treatment more consistently.

Applied to:

- `Introduction`
- `Audit Scope`
- `Recommended Actions`
- `Recommended Actions` category headings
- `Detailed Results`

If new headings are added to active pages, prefer the same green heading color already used across these sections unless design direction changes deliberately.

## Local PDF Testing Paths

### Mock Preview Route

Files:

- [app/api/pdf-preview/route.ts](/Users/nelsoncosta/dev/LandlordAuditReport/app/api/pdf-preview/route.ts)
- [app/pdf-preview/page.tsx](/Users/nelsoncosta/dev/LandlordAuditReport/app/pdf-preview/page.tsx)

Purpose:

- generate a preview PDF from mock data
- render it in-browser during local development

Useful route:

- `/pdf-preview`

### Real-Data Test Script

Files:

- [scripts/generate-test-pdf.tsx](/Users/nelsoncosta/dev/LandlordAuditReport/scripts/generate-test-pdf.tsx)
- [package.json](/Users/nelsoncosta/dev/LandlordAuditReport/package.json)

Command:

```bash
npm run pdf:test
```

Purpose:

- find a submitted audit in the DB
- load its real responses/questions
- generate `test-report.pdf`

## Session Change Summary

The following changes were made in this PDF iteration:

1. Fixed stale subcategory label rendering by normalizing DB-backed `Product Buying` to `Cleaning Products`.
2. Updated old seed data so future seeded question metadata also uses `Cleaning Products`.
3. Changed page 2 to use `Introduction` as the main heading.
4. Added two introductory paragraphs before the audit-scope section.
5. Kept `Audit Scope` as a smaller heading beneath the introduction.
6. Standardized heading colors to the report green for active sections.
7. Updated `Recommended Actions` heading/subheading styling.
8. Refactored `Detailed Results` to use `autoTable` so it visually aligns better with `Recommended Actions`.
9. Added justified paragraph rendering for active body-text sections.
10. Removed bullet formatting from the two main `Introduction` paragraphs so they render as plain justified text.

## Relevant Commits From This Session

- `dcac89b` `fix(pdf): rename product buying section to cleaning products`
- `1e084b1` `feat(pdf): align report section layouts and typography`

## Guidance For Future Agents

When changing the PDF:

- inspect `lib/pdf-client/generator.ts` first to confirm which pages are actually live
- do not assume old page modules are active just because they exist
- check whether a label comes from DB-backed questions before editing static question dictionaries
- prefer making visual changes in active page files only
- preserve the green heading treatment unless intentionally redesigning
- prefer `drawJustifiedText()` for paragraph-style body text in active report pages
- keep table-driven sections visually consistent with `jspdf-autotable`
- if a preview looks unchanged, confirm whether the issue is in mock preview data, real DB data, or the active page generator
