// Minimal HTML Report Template for Puppeteer PDF generation

interface MinimalReportData {
  propertyAddress: string;
  landlordName: string;
  auditorName: string;
  overallScore: number;
  riskTier: string;
  reportId: string;
  reportDate: string;
}

export function generateMinimalReportHTML(data: MinimalReportData): string {
  const tierNumber = data.riskTier.split('_')[1];
  const riskColor = data.overallScore >= 7.5 ? '#10b981' : data.overallScore >= 4 ? '#f59e0b' : '#ef4444';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #1f2937;
        }
        
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          background: white;
        }
        
        .header {
          border-bottom: 4px solid #10b981;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .title {
          font-size: 32pt;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 10px;
        }
        
        .subtitle {
          font-size: 18pt;
          color: #6b7280;
        }
        
        .metadata {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 30px 0;
          padding: 20px;
          background: #f3f4f6;
          border-radius: 8px;
        }
        
        .metadata-item {
          display: flex;
          flex-direction: column;
        }
        
        .metadata-label {
          font-size: 10pt;
          color: #6b7280;
          margin-bottom: 4px;
        }
        
        .metadata-value {
          font-size: 12pt;
          font-weight: bold;
          color: #1f2937;
        }
        
        .score-box {
          margin: 30px 0;
          padding: 30px;
          background: #dbeafe;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          text-align: center;
        }
        
        .score-label {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 15px;
        }
        
        .score-value {
          font-size: 48pt;
          font-weight: bold;
          color: ${riskColor};
          margin: 10px 0;
        }
        
        .risk-tier {
          font-size: 14pt;
          margin-top: 15px;
        }
        
        .footer {
          position: fixed;
          bottom: 15mm;
          left: 20mm;
          right: 20mm;
          text-align: center;
          font-size: 9pt;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="title">LANDLORD RISK AUDIT</div>
          <div class="subtitle">Compliance Assessment Report</div>
        </div>
        
        <div class="metadata">
          <div class="metadata-item">
            <span class="metadata-label">Report ID</span>
            <span class="metadata-value">${data.reportId}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Report Date</span>
            <span class="metadata-value">${data.reportDate}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Property</span>
            <span class="metadata-value">${data.propertyAddress}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Landlord</span>
            <span class="metadata-value">${data.landlordName}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Auditor</span>
            <span class="metadata-value">${data.auditorName}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Risk Tier</span>
            <span class="metadata-value">Tier ${tierNumber}</span>
          </div>
        </div>
        
        <div class="score-box">
          <div class="score-label">Overall Compliance Score</div>
          <div class="score-value">${data.overallScore.toFixed(1)}</div>
          <div class="risk-tier">Risk Tier ${tierNumber}</div>
        </div>
        
        <div class="footer">
          © Copyright Landlord Safeguarding Ltd.
        </div>
      </div>
    </body>
    </html>
  `;
}

