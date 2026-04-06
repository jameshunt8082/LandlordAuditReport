# PDF Generation System

Server-side PDF report generation using **jsPDF** + **jspdf-autotable**.

## Architecture

```
lib/pdf-client/
├── generator.ts          # Main orchestrator - calls all page generators
├── styles.ts             # Color palette, fonts, spacing constants
├── utils.ts              # Text wrapping, positioning, date formatting
├── mockData.ts           # Test data for development
├── components/           # Reusable UI components
│   ├── header.ts         # Page headers with green line + page number
│   ├── footer.ts         # Copyright footer
│   ├── trafficLight.ts   # Colored circle indicators (red/orange/green)
│   └── tables.ts         # Table style configurations
└── pages/                # Individual page generators
    ├── coverPage.ts       # Cover page with title, client info, date
    ├── introduction.ts    # Traffic light legend + Overall Score box
    ├── auditScope.ts      # 3 audit areas (Documentation, Communication, Evidence)
    ├── evidenceSummary.ts  # Score Summary - traffic light tables by category
    ├── recommendations.ts # Red/orange items with reasons + suggested actions
    └── detailedResults.ts # All questions with answers and comments
```

## Data Flow

```
DB (audits + responses + questions)
  → calculateAuditScores()         (lib/scoring.ts)
  → transformAuditToReportData()   (lib/pdf/formatters.ts)
  → generateCompletePDF()          (lib/pdf-client/generator.ts)
  → jsPDF buffer → HTTP response
```

## API Routes

- `GET /api/reports/[auditId]` — Authenticated (admin) report generation
- `GET /api/audits/[token]/report` — Public token-based report generation

Both call `generateCompletePDF(reportData)` from this module.

## Testing

```bash
npx tsx scripts/generate-test-pdf.tsx
```

Generates a test PDF from real database data and saves to `test-report.pdf`.
