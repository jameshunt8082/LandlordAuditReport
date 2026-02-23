// Complete HTML Report Template for Puppeteer PDF generation
// Exact port of the 11-page React-PDF ReportDocument
import { ReportData, QuestionResponseData, Recommendation, ServiceRecommendation, formatReportDate } from '@/lib/pdf/formatters';
import { RecommendedAction } from '@/lib/scoring';

// ─── Color Helpers ───

const COLORS = {
  primaryGreen: '#2e7d32',
  darkGreen: '#1b5e20',
  red: '#d32f2f',
  orange: '#e65100',
  blue: '#1565c0',
  paleBlue: '#e3f2fd',
  black: '#212121',
  darkGray: '#424242',
  mediumGray: '#757575',
  lightGray: '#e0e0e0',
  white: '#ffffff',
};

function getTrafficColor(score: number): string {
  if (score >= 7) return COLORS.darkGreen;
  if (score >= 4) return COLORS.orange;
  return COLORS.red;
}

function getTrafficLabel(score: number): string {
  if (score >= 7) return 'green';
  if (score >= 4) return 'orange';
  return 'red';
}

function formatScore(score: number): string {
  return score.toFixed(1);
}

function trafficDot(score: number, size = 14): string {
  const color = getTrafficColor(score);
  return `<span style="display:inline-block;width:${size}px;height:${size}px;border-radius:50%;background:${color};vertical-align:middle;"></span>`;
}

function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1: return 'CRITICAL';
    case 2: return 'HIGH';
    case 3: return 'MEDIUM';
    case 4: return 'LOW';
    default: return 'MEDIUM';
  }
}

function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1: return COLORS.red;
    case 2: return COLORS.orange;
    case 3: return '#f9a825';
    case 4: return COLORS.darkGreen;
    default: return COLORS.mediumGray;
  }
}

// ─── Input Interface ───

interface ComprehensiveReportInput {
  reportData: ReportData;
  reportId: string;
  reportDate: string;
  recommendedActions: RecommendedAction[];
}

// ─── Shared Styles ───

const baseStyles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.5;
    color: ${COLORS.black};
    background: white;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 18mm 20mm;
    background: white;
    page-break-after: always;
    position: relative;
  }
  .page:last-child { page-break-after: auto; }
  .page-header {
    font-size: 9pt;
    color: ${COLORS.mediumGray};
    padding-bottom: 8px;
    margin-bottom: 15px;
    border-bottom: 2px solid ${COLORS.primaryGreen};
  }
  .page-footer {
    position: absolute;
    bottom: 15mm;
    left: 20mm;
    right: 20mm;
    text-align: center;
    font-size: 8pt;
    color: ${COLORS.mediumGray};
    border-top: 1px solid ${COLORS.lightGray};
    padding-top: 8px;
  }
  h1 {
    font-size: 16pt;
    font-weight: bold;
    color: ${COLORS.black};
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid ${COLORS.primaryGreen};
  }
  h2 {
    font-size: 13pt;
    font-weight: bold;
    color: ${COLORS.black};
    margin-top: 20px;
    margin-bottom: 10px;
  }
  h3 {
    font-size: 11pt;
    font-weight: bold;
    color: ${COLORS.darkGray};
    margin-top: 15px;
    margin-bottom: 8px;
  }
  p, .paragraph {
    font-size: 10pt;
    line-height: 1.5;
    margin-bottom: 10px;
    color: ${COLORS.darkGray};
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 10pt;
  }
  th {
    background: ${COLORS.paleBlue};
    font-weight: bold;
    padding: 8px 10px;
    text-align: left;
    border-bottom: 2px solid ${COLORS.blue};
    font-size: 10pt;
  }
  td {
    padding: 8px 10px;
    border-bottom: 1px solid ${COLORS.lightGray};
    vertical-align: top;
    font-size: 10pt;
  }
  .bullet-list { margin-left: 20px; margin-top: 5px; }
  .bullet-item { margin-bottom: 4px; font-size: 10pt; line-height: 1.4; }
  @media print {
    .page { page-break-after: always; }
    .page:last-child { page-break-after: auto; }
  }
`;

const pageHeader = `<div class="page-header">Landlord Risk Audit Report</div>`;
const pageFooter = `<div class="page-footer">Landlord Safeguarding Ltd. &mdash; Confidential</div>`;

// ─── Main Generator ───

export function generateComprehensiveReportHTML(input: ComprehensiveReportInput): string {
  const { reportData, reportId, reportDate, recommendedActions } = input;
  const d = reportData;
  const tierNumber = d.riskTier.split('_')[1];
  const overallColor = getTrafficColor(d.overallScore);

  const totalQuestions = d.questionResponses.red.length + d.questionResponses.orange.length + d.questionResponses.green.length;

  // Pre-compute compliance metrics
  const compliantAreas = d.subcategoryScores.filter(s => s.score >= 7).length;
  const atRiskAreas = d.subcategoryScores.filter(s => s.score >= 4 && s.score < 7).length;
  const nonCompliantAreas = d.subcategoryScores.filter(s => s.score < 4).length;
  const totalAreas = d.subcategoryScores.length;

  // Critical findings
  const criticalFindings = d.questionResponses.red.map(q =>
    `${q.subcategory}: ${q.questionText.substring(0, 120)}${q.questionText.length > 120 ? '...' : ''}`
  );

  // Auditor opinion
  const auditorOpinion = d.overallScore >= 7.5
    ? 'This property demonstrates strong compliance practices. Continue maintaining current systems with regular reviews to ensure ongoing compliance.'
    : d.overallScore >= 4.0
    ? 'This property shows moderate compliance with several areas requiring attention. Immediate action on critical items will significantly reduce legal exposure. Implementation of recommended improvements within 30-90 days is advised.'
    : 'This property presents significant compliance risks requiring urgent remediation. Multiple critical violations expose you to immediate legal action, fines, and potential loss of letting privileges. Immediate professional intervention is strongly recommended.';

  // Action plan items
  const immediateActions = d.questionResponses.red.map(q =>
    `${q.subcategory}: ${q.questionText.substring(0, 100)}${q.questionText.length > 100 ? '...' : ''}`
  );
  const shortTermActions = d.questionResponses.orange.map(q =>
    `${q.subcategory}: ${q.questionText.substring(0, 100)}${q.questionText.length > 100 ? '...' : ''}`
  );
  const mediumTermActions: string[] = [];
  Object.values(d.recommendationsByCategory).flat().forEach(rec => {
    if (rec.score < 7) {
      mediumTermActions.push(`${rec.subcategory}: Implement recommended improvements (Score: ${formatScore(rec.score)})`);
    }
  });

  // Compliance status items
  const allQ = [...d.questionResponses.red, ...d.questionResponses.orange, ...d.questionResponses.green];
  const getCompStatus = (qNum: string): 'PASS' | 'FAIL' | 'PARTIAL' => {
    const q = allQ.find(x => x.number === qNum);
    if (!q) return 'PARTIAL';
    if (q.score >= 7) return 'PASS';
    if (q.score <= 3) return 'FAIL';
    return 'PARTIAL';
  };
  const statusColor = (s: string) => s === 'PASS' ? COLORS.darkGreen : s === 'FAIL' ? COLORS.red : COLORS.orange;

  const complianceItems = [
    { req: 'Current Gas Safety Certificate', qNum: '1.1', penalty: '£5,000+ fine per violation',
      passAction: 'Maintain annual renewals', failAction: 'Obtain valid certificate within 7 days. Criminal offense to let without.' },
    { req: 'Current EICR', qNum: '1.1', penalty: '£5,000+ fine, insurance void',
      passAction: 'Renew every 5 years (HMO) or 10 years', failAction: 'Obtain valid EICR immediately.' },
    { req: 'Current Energy Performance Certificate (EPC)', qNum: '1.1', penalty: '£5,000 fine',
      passAction: 'Valid for 10 years from issue date', failAction: 'Obtain EPC rated E or above.' },
    { req: 'Certificate Provision to Tenants', qNum: '1.2', penalty: 'Rent repayment claims',
      passAction: 'Maintain proof of delivery records', failAction: 'Provide copies within 28 days with proof of delivery.' },
    { req: 'HMO Licensing (if applicable)', qNum: '3.1', penalty: '£30,000 fine + rent repayment',
      passAction: 'Review renewal dates', failAction: 'Apply for mandatory HMO license immediately.' },
    { req: 'Fire Risk Assessment (HMO)', qNum: '1.5', penalty: 'Unlimited fines, prohibition',
      passAction: 'Review annually', failAction: 'Commission professional fire risk assessment.' },
    { req: 'Deposit Protection', qNum: '19.1', penalty: '1-3x deposit compensation',
      passAction: 'Ensure prescribed information provided', failAction: 'Protect deposits within 30 days.' },
    { req: 'Written Tenancy Agreement', qNum: '4.1', penalty: 'Cannot enforce terms',
      passAction: 'Keep signed copies secure', failAction: 'Implement written agreements.' },
  ].map(i => {
    const status = getCompStatus(i.qNum);
    return { ...i, status, action: status === 'PASS' ? i.passAction : i.failAction };
  });

  const failCount = complianceItems.filter(i => i.status === 'FAIL').length;
  const partialCount = complianceItems.filter(i => i.status === 'PARTIAL').length;
  const passCount = complianceItems.filter(i => i.status === 'PASS').length;

  // Get consequence text for critical findings
  const getConsequence = (qNum: string): string => {
    if (qNum.startsWith('1.1') || qNum.startsWith('1.2')) return 'Fines exceeding £5,000 per certificate violation. Personal liability for tenant injuries. Prosecution for non-compliance with safety regulations.';
    if (qNum.startsWith('3.1')) return 'Fines up to £30,000 per property. Rent repayment orders covering 12 months. Property prohibition preventing legal letting.';
    if (qNum.startsWith('1.5')) return 'Unlimited fines for HMO fire safety violations. Potential imprisonment if fire incident occurs. Prohibition orders preventing occupation.';
    if (qNum.startsWith('19.')) return 'Compensation claims of 1-3x deposit amount. Automatic tribunal ruling against landlord. Cannot enforce any deposit deductions.';
    if (qNum.startsWith('9.')) return 'Eviction proceedings invalidated entirely. Legal fees wasted. Must restart process from beginning with 6+ month delays.';
    return 'Tribunal claims and potential financial penalties. Enforcement action possible. Licensing authority sanctions may apply.';
  };

  // ─── BUILD HTML ───

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>${baseStyles}</style></head>
<body>

<!-- ═══════ PAGE 1: COVER PAGE ═══════ -->
<div class="page" style="padding-top:0;">
  <div style="width:100%;height:12px;background:${COLORS.primaryGreen};"></div>
  <div style="text-align:right;margin-top:20px;margin-bottom:-50px;">
    <div style="font-size:9pt;color:${COLORS.mediumGray};">Report ID: ${reportId}</div>
    <div style="font-size:9pt;color:${COLORS.mediumGray};">Report Date: ${reportDate}</div>
    <div style="font-size:10pt;font-weight:bold;color:${overallColor};">Risk Tier ${tierNumber}</div>
  </div>
  <div style="text-align:center;margin-top:120px;">
    <div style="font-size:24pt;font-weight:bold;color:${COLORS.black};margin-bottom:20px;">Landlord Risk Audit Report</div>
    <div style="width:100%;height:1px;background:${COLORS.lightGray};margin-bottom:20px;"></div>
    <div style="width:80%;margin:0 auto;background:${COLORS.primaryGreen};padding:15px;margin-bottom:20px;">
      <div style="font-size:18pt;font-weight:bold;color:white;">COMPLIANCE ASSESSMENT</div>
    </div>
    <div style="margin-top:20px;">
      <div style="font-size:14pt;font-weight:bold;margin-bottom:10px;">Report for ${d.propertyAddress}</div>
      <div style="font-size:12pt;color:${COLORS.mediumGray};">Client: ${d.landlordName}</div>
    </div>
    <div style="width:50%;height:1px;background:${COLORS.primaryGreen};margin:15px auto;"></div>
    <div style="font-size:12pt;color:${COLORS.mediumGray};margin-top:30px;">
      Conducted ${formatReportDate(d.auditStartDate)} to ${reportDate}
    </div>
    <div style="font-size:11pt;color:${COLORS.mediumGray};margin-top:8px;">
      Audited by: ${d.auditorName || 'Landlord Audit Team'}
    </div>
    <div style="font-size:14pt;font-weight:bold;color:${COLORS.darkGray};margin-top:20px;">Confidential Contents</div>
  </div>
  ${pageFooter}
</div>

<!-- ═══════ PAGE 2: EXECUTIVE SUMMARY ═══════ -->
<div class="page">
  ${pageHeader}
  <h1>Executive Summary</h1>

  <div style="margin-bottom:20px;padding-bottom:15px;border-bottom:2px solid ${COLORS.primaryGreen};">
    <table style="border:none;margin:0;"><tbody>
      <tr><td style="width:35%;color:${COLORS.mediumGray};border:none;padding:4px 0;">Report ID:</td><td style="font-weight:bold;border:none;padding:4px 0;">${reportId}</td></tr>
      <tr><td style="color:${COLORS.mediumGray};border:none;padding:4px 0;">Property:</td><td style="font-weight:bold;border:none;padding:4px 0;">${d.propertyAddress}</td></tr>
      <tr><td style="color:${COLORS.mediumGray};border:none;padding:4px 0;">Landlord:</td><td style="font-weight:bold;border:none;padding:4px 0;">${d.landlordName}</td></tr>
      <tr><td style="color:${COLORS.mediumGray};border:none;padding:4px 0;">Auditor:</td><td style="font-weight:bold;border:none;padding:4px 0;">${d.auditorName || 'Landlord Audit Team'}</td></tr>
      <tr><td style="color:${COLORS.mediumGray};border:none;padding:4px 0;">Audit Date:</td><td style="font-weight:bold;border:none;padding:4px 0;">${reportDate}</td></tr>
    </tbody></table>
  </div>

  <div style="margin:20px 0 25px;padding:20px;background:${COLORS.paleBlue};border:2px solid ${COLORS.blue};border-radius:4px;">
    <div style="margin-bottom:10px;"><span style="font-size:14pt;font-weight:bold;">Overall Compliance Score</span></div>
    <div style="display:flex;align-items:center;padding:8px 0;">
      <span style="font-size:36pt;font-weight:bold;color:${overallColor};margin-right:15px;">${formatScore(d.overallScore)}</span>
      ${trafficDot(d.overallScore, 24)}
    </div>
    <div style="margin-top:15px;font-size:12pt;line-height:1.4;">
      <strong>Risk Classification:</strong> Tier ${tierNumber} - ${
        tierNumber === '0' ? 'Minimal Risk' : tierNumber === '1' ? 'Low Risk' : tierNumber === '2' ? 'Moderate Risk' : tierNumber === '3' ? 'High Risk' : 'Severe Risk'
      }
    </div>
    <div style="margin-top:5px;font-size:12pt;">
      <strong>Compliance Status:</strong> ${compliantAreas} of ${totalAreas} areas meet standards (${nonCompliantAreas} require immediate action)
    </div>
  </div>

  <h2>Compliance Overview</h2>
  <table>
    <thead><tr>
      <th style="text-align:center;">Category</th>
      <th style="text-align:center;">Score</th>
      <th style="text-align:center;">Status</th>
    </tr></thead>
    <tbody>
      <tr>
        <td style="text-align:center;">Documentation</td>
        <td style="text-align:center;font-weight:bold;">${formatScore(d.categoryScores.documentation.score)}</td>
        <td style="text-align:center;">${trafficDot(d.categoryScores.documentation.score)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">Landlord-Tenant Communication</td>
        <td style="text-align:center;font-weight:bold;">${formatScore(d.categoryScores.communication.score)}</td>
        <td style="text-align:center;">${trafficDot(d.categoryScores.communication.score)}</td>
      </tr>
      <tr>
        <td style="text-align:center;">Evidence Gathering Systems</td>
        <td style="text-align:center;font-weight:bold;">${formatScore(d.categoryScores.evidenceGathering.score)}</td>
        <td style="text-align:center;">${trafficDot(d.categoryScores.evidenceGathering.score)}</td>
      </tr>
    </tbody>
  </table>

  ${criticalFindings.length > 0 ? `
  <div style="margin-top:20px;padding:15px;background:#fff5f5;border-left:4px solid ${COLORS.red};">
    <div style="font-size:12pt;font-weight:bold;color:${COLORS.red};margin-bottom:8px;">CRITICAL FINDINGS REQUIRING IMMEDIATE ACTION</div>
    ${criticalFindings.map(f => `<div style="font-size:10pt;margin-bottom:5px;line-height:1.4;">&#8226; ${f}</div>`).join('')}
  </div>` : ''}

  <div style="margin-top:20px;">
    <h3>Auditor's Professional Opinion</h3>
    <p style="margin-top:10px;">${auditorOpinion}</p>
  </div>

  ${pageFooter}
</div>

<!-- ═══════ PAGE 3: CRITICAL FINDINGS ═══════ -->
<div class="page">
  ${pageHeader}
  <h1>Critical Findings Summary</h1>

  ${d.questionResponses.red.length > 0 ? `
  <div style="margin-bottom:20px;padding:15px;background:#fff5f5;border:2px solid ${COLORS.red};">
    <div style="font-size:14pt;font-weight:bold;color:${COLORS.red};margin-bottom:8px;">
      URGENT: ${d.questionResponses.red.length} Critical Non-Compliance Issue${d.questionResponses.red.length > 1 ? 's' : ''} Identified
    </div>
    <p>The following findings expose you to immediate legal action, prosecution, and substantial financial
    penalties. These items require urgent remediation within 7 days. Professional legal consultation
    is strongly recommended for items involving statutory violations.</p>
  </div>

  <h2 style="color:${COLORS.red};">Items Requiring Immediate Action</h2>

  ${d.questionResponses.red.map((q, idx) => `
  <div style="margin-bottom:15px;padding:12px;background:#fff;border-left:4px solid ${COLORS.red};border:1px solid #e5e7eb;">
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">
      <span style="font-weight:bold;color:${COLORS.red};">Q${q.number}</span>
      <span style="font-size:9pt;color:${COLORS.mediumGray};">${q.category} / ${q.subcategory}</span>
    </div>
    <p style="margin-bottom:8px;"><strong>Issue:</strong> ${q.questionText}</p>
    <p style="margin-bottom:8px;"><strong>Current Status:</strong> ${q.answer}</p>
    <div style="margin-top:8px;padding:8px;background:#fef2f2;">
      <div style="font-size:9pt;font-weight:bold;color:${COLORS.red};margin-bottom:4px;">Legal Consequences:</div>
      <div style="font-size:9pt;line-height:1.3;">${getConsequence(q.number)}</div>
    </div>
  </div>`).join('')}
  ` : `
  <div style="margin-top:30px;padding:20px;background:#f0fdf4;border:2px solid ${COLORS.darkGreen};">
    <div style="font-size:13pt;font-weight:bold;color:${COLORS.darkGreen};margin-bottom:8px;">No Critical Non-Compliance Issues Identified</div>
    <p>This audit identified no critical statutory violations. You are not currently exposed to
    immediate prosecution or prohibition orders. Continue maintaining current compliance standards
    and address medium-priority items within recommended timeframes.</p>
  </div>`}

  ${pageFooter}
</div>

<!-- ═══════ PAGE 4: METHODOLOGY ═══════ -->
<div class="page">
  ${pageHeader}
  <h1>Audit Methodology</h1>

  <p>This compliance audit was conducted using a structured assessment framework designed to evaluate
  landlord practices against legal requirements and industry best practices. The methodology
  ensures comprehensive coverage of critical compliance areas while maintaining objectivity
  and consistency.</p>

  <h2>Audit Scope</h2>
  <p>This audit examined the following areas:</p>
  <div class="bullet-list">
    <div class="bullet-item">&#8226; <strong>Documentation Systems:</strong> Safety certificates, tenancy agreements, council licensing, financial records, maintenance logs, and tenant communications.</div>
    <div class="bullet-item">&#8226; <strong>Communication Protocols:</strong> Written record systems, complaint handling procedures, notice protocols, response time tracking, and tenant accessibility.</div>
    <div class="bullet-item">&#8226; <strong>Evidence Systems:</strong> Inspection processes, photographic documentation, evidence archives, maintenance records, and digital backup procedures.</div>
  </div>

  <h2>Assessment Framework</h2>
  <p>The audit utilized a ${totalQuestions}-question structured questionnaire addressing statutory
  requirements and professional standards. Questions are weighted by legal significance, with
  critical compliance items carrying higher impact on overall scoring.</p>

  <div style="margin:15px 0;padding:12px;background:#f8f9fa;border-left:3px solid ${COLORS.blue};">
    <div style="font-weight:bold;margin-bottom:5px;">Assessment Standards Referenced:</div>
    <div style="font-size:10pt;line-height:1.4;">Housing Act 2004, Health and Safety at Work Act 1974, Gas Safety Regulations,
    Electrical Safety Standards, Energy Performance of Buildings Regulations,
    Tenancy Deposit Protection Requirements, and relevant local authority licensing schemes.</div>
  </div>

  <h2>Scoring Methodology</h2>
  <p>Each question receives a score from 1-10 based on compliance level demonstrated.
  Scores are weighted by question significance and aggregated to produce subcategory,
  category, and overall scores.</p>
  <div class="bullet-list">
    <div class="bullet-item">&#8226; <strong>Critical Questions:</strong> Weighted 2.0x (legal requirements with prosecution risk)</div>
    <div class="bullet-item">&#8226; <strong>Standard Questions:</strong> Weighted 1.0x (best practices and operational procedures)</div>
  </div>

  <h2>Limitations &amp; Assumptions</h2>
  <div class="bullet-list">
    <div class="bullet-item">&#8226; This audit is based on information provided and documentation presented at the time of assessment. Changes to regulations or property circumstances may affect compliance status.</div>
    <div class="bullet-item">&#8226; Recommendations reflect general best practices. Specific legal advice should be obtained for complex situations or where enforcement action is threatened.</div>
    <div class="bullet-item">&#8226; This report does not constitute legal advice. Professional legal counsel should be consulted for interpretation of specific legal requirements.</div>
    <div class="bullet-item">&#8226; Physical site inspection scope: Documentation review only</div>
  </div>

  <h2>Auditor Credentials</h2>
  <p>This audit was conducted by ${d.auditorName || 'Landlord Audit Team'}, a qualified property compliance auditor
  with expertise in residential letting regulations, tenancy law, and property management best practices.</p>

  ${pageFooter}
</div>

<!-- ═══════ PAGE 5: RISK RATING DEFINITIONS ═══════ -->
<div class="page">
  ${pageHeader}
  <h1>Understanding Your Risk Rating</h1>

  <p>Your overall risk rating determines the level of legal exposure and potential financial liability
  you face. This rating influences insurance premiums, lending decisions, and licensing authority assessments.</p>

  <h2>Risk Tier Classifications</h2>

  <div style="margin-bottom:15px;padding:15px;border:2px solid ${COLORS.darkGreen};border-radius:4px;">
    <div style="margin-bottom:10px;"><span style="font-size:20pt;font-weight:bold;color:${COLORS.darkGreen};margin-right:12px;">Tier 0</span><span style="font-size:14pt;font-weight:bold;color:${COLORS.darkGreen};">Minimal Risk</span></div>
    <p>Exemplary compliance. All legal requirements met with robust systems in place. Minimal probability of enforcement action or tenant tribunal claims.</p>
    <div style="font-size:9pt;font-style:italic;color:${COLORS.mediumGray};margin-top:5px;">Insurance: Premium rates. Lending: Favorable terms. Licensing: Fast-track renewals.</div>
  </div>

  <div style="margin-bottom:15px;padding:15px;border:2px solid ${COLORS.darkGreen};border-radius:4px;">
    <div style="margin-bottom:10px;"><span style="font-size:20pt;font-weight:bold;color:${COLORS.darkGreen};margin-right:12px;">Tier 1</span><span style="font-size:14pt;font-weight:bold;color:${COLORS.darkGreen};">Low Risk</span></div>
    <p>Good compliance with minor improvements needed. Legal requirements met. Low probability of legal issues if current practices maintained.</p>
    <div style="font-size:9pt;font-style:italic;color:${COLORS.mediumGray};margin-top:5px;">Insurance: Standard rates. Lending: Normal terms. Licensing: Routine renewals.</div>
  </div>

  <div style="margin-bottom:15px;padding:15px;border:2px solid ${COLORS.orange};border-radius:4px;">
    <div style="margin-bottom:10px;"><span style="font-size:20pt;font-weight:bold;color:${COLORS.orange};margin-right:12px;">Tier 2</span><span style="font-size:14pt;font-weight:bold;color:${COLORS.orange};">Moderate Risk</span></div>
    <p>Compliance gaps present. Some legal requirements not fully met. Moderate probability of enforcement action if improvements not made within 90 days.</p>
    <div style="font-size:9pt;font-style:italic;color:${COLORS.mediumGray};margin-top:5px;">Insurance: Elevated premiums. Lending: Additional scrutiny. Licensing: May face renewal delays.</div>
  </div>

  <div style="margin-bottom:15px;padding:15px;border:2px solid ${COLORS.red};border-radius:4px;">
    <div style="margin-bottom:10px;"><span style="font-size:20pt;font-weight:bold;color:${COLORS.red};margin-right:12px;">Tier 3</span><span style="font-size:14pt;font-weight:bold;color:${COLORS.red};">High Risk</span></div>
    <p>Significant compliance failures. Multiple legal violations. High probability of enforcement action, tribunal claims, and financial penalties.</p>
    <div style="font-size:9pt;font-style:italic;color:${COLORS.mediumGray};margin-top:5px;">Insurance: May be refused or heavily loaded. Lending: Difficult. Licensing: Renewal likely refused.</div>
  </div>

  <div style="margin-bottom:15px;padding:15px;border:2px solid ${COLORS.red};border-radius:4px;">
    <div style="margin-bottom:10px;"><span style="font-size:20pt;font-weight:bold;color:${COLORS.red};margin-right:12px;">Tier 4</span><span style="font-size:14pt;font-weight:bold;color:${COLORS.red};">Severe Risk</span></div>
    <p>Critical compliance failures. Immediate legal exposure to prosecution, prohibition orders, and substantial financial penalties. Property may be unlettable until full remediation.</p>
    <div style="font-size:9pt;font-style:italic;color:${COLORS.mediumGray};margin-top:5px;">Insurance: Refused. Lending: Refused. Licensing: Will be refused. Property prohibition orders possible.</div>
  </div>

  <h2 style="margin-top:25px;">Score Interpretation</h2>
  <div style="margin-top:10px;">
    <div style="display:flex;align-items:center;margin-bottom:10px;padding:8px 10px;">${trafficDot(8)} <span style="width:80px;font-weight:bold;color:${COLORS.darkGreen};margin-left:10px;">7.0 - 10.0</span> <span style="margin-left:15px;">Compliant. Continue current practices with regular reviews.</span></div>
    <div style="display:flex;align-items:center;margin-bottom:10px;padding:8px 10px;">${trafficDot(5)} <span style="width:80px;font-weight:bold;color:${COLORS.orange};margin-left:10px;">4.0 - 6.9</span> <span style="margin-left:15px;">Improvements needed. Address within 30-90 days to avoid legal risk.</span></div>
    <div style="display:flex;align-items:center;margin-bottom:10px;padding:8px 10px;">${trafficDot(2)} <span style="width:80px;font-weight:bold;color:${COLORS.red};margin-left:10px;">1.0 - 3.9</span> <span style="margin-left:15px;">Critical non-compliance. Immediate action required within 7 days.</span></div>
  </div>

  ${pageFooter}
</div>

<!-- ═══════ PAGE 6: LEGAL COMPLIANCE STATUS ═══════ -->
<div class="page">
  ${pageHeader}
  <h1>Legal Compliance Status</h1>

  <p>This section assesses compliance with legal requirements. These are not recommendations
  but legal obligations. Non-compliance exposes you to prosecution, fines, and property prohibition orders.</p>

  <div style="margin:15px 0;padding:12px;background:${failCount > 0 ? '#fff5f5' : passCount === complianceItems.length ? '#f0fdf4' : '#fffbeb'};border:2px solid ${failCount > 0 ? COLORS.red : passCount === complianceItems.length ? COLORS.darkGreen : COLORS.orange};">
    <div style="font-weight:bold;margin-bottom:5px;">Compliance Summary: ${passCount} of ${complianceItems.length} Requirements Met</div>
    <div>Pass: ${passCount} | Partial: ${partialCount} | Fail: ${failCount}</div>
  </div>

  <table>
    <thead><tr>
      <th style="width:45%;">Legal Requirement</th>
      <th style="width:15%;text-align:center;">Status</th>
      <th style="width:40%;">Action Required</th>
    </tr></thead>
    <tbody>
      ${complianceItems.map(item => `
      <tr>
        <td>
          <strong>${item.req}</strong>
          <div style="font-size:8pt;color:${COLORS.red};margin-top:2px;">Penalty: ${item.penalty}</div>
        </td>
        <td style="text-align:center;font-weight:bold;color:${statusColor(item.status)};">${item.status}</td>
        <td style="font-size:9pt;">${item.action}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  ${failCount > 0 ? `
  <div style="margin-top:20px;padding:15px;border-left:4px solid ${COLORS.red};">
    <div style="font-size:12pt;font-weight:bold;color:${COLORS.red};margin-bottom:8px;">CRITICAL: ${failCount} Legal Violation${failCount > 1 ? 's' : ''}</div>
    <p>You are currently in violation of ${failCount} legal requirement${failCount > 1 ? 's' : ''}.
    This exposes you to immediate prosecution, substantial fines, and potential prohibition from letting.
    Urgent remediation within 7 days is required. Professional legal advice is strongly recommended.</p>
  </div>` : ''}

  ${pageFooter}
</div>

<!-- ═══════ PAGE 7: EVIDENCE & DOCUMENTATION REVIEW ═══════ -->
<div class="page">
  ${pageHeader}
  <h1>Evidence &amp; Documentation Review</h1>

  <p>This section summarizes the evidence examined during the audit process. The assessment was based
  on documentation provided, systems in place, and procedures demonstrated.</p>

  <h2>Evidence Examined</h2>
  <table>
    <thead><tr>
      <th style="text-align:center;">Evidence Category</th>
      <th style="text-align:center;">Status</th>
      <th style="text-align:center;">Assessment Method</th>
    </tr></thead>
    <tbody>
      ${['Safety Certificates', 'Tenancy Agreements', 'Financial Records', 'Maintenance Logs',
        'Communication Records', 'Inspection Documentation', 'Evidence Archives', 'Council Licensing']
        .map(name => `<tr>
          <td style="text-align:center;">${name}</td>
          <td style="text-align:center;color:${COLORS.darkGreen};font-weight:bold;">Reviewed</td>
          <td style="text-align:center;font-style:italic;">Documentation examined</td>
        </tr>`).join('')}
    </tbody>
  </table>

  <h2 style="margin-top:25px;">Assessment Coverage</h2>
  <p>This audit evaluated ${totalQuestions} compliance areas across three primary categories.
  Each area was assessed against legal requirements and industry best practices.
  Responses were validated for consistency and completeness.</p>

  <div style="margin-top:20px;padding:12px;background:#fffbeb;border-left:3px solid ${COLORS.orange};">
    <div style="font-weight:bold;margin-bottom:5px;">Important Note Regarding Evidence Limitations:</div>
    <div style="font-size:9pt;line-height:1.4;">This audit is based on information and documentation provided at the time of assessment.
    Findings reflect the state of compliance as presented. Undisclosed issues, incomplete documentation,
    or changes in circumstances may affect actual compliance status. This report does not constitute
    legal advice.</div>
  </div>

  <h2 style="margin-top:20px;">Quality Assurance</h2>
  <p>All responses and documentation were cross-referenced for consistency. Scoring methodology
  was applied uniformly across all assessment areas. Weighted scoring reflects legal significance
  of each compliance requirement.</p>

  ${pageFooter}
</div>

<!-- ═══════ PAGE 8: INTRODUCTION ═══════ -->
<div class="page">
  ${pageHeader}
  <h1>Introduction</h1>

  <p>This Landlord Risk Audit Report provides a comprehensive assessment of your property management
  practices and compliance status. The audit evaluates three critical areas of landlord responsibility:
  Documentation, Landlord-Tenant Communication, and Evidence Gathering Systems and Procedures.</p>

  <p>Each area has been assessed using a structured questionnaire designed to identify potential risks,
  compliance gaps, and areas for improvement. The results are presented using a traffic light system
  to help you quickly identify priority actions.</p>

  <h2>Purpose of Survey</h2>
  <p>The primary purpose of this audit is to help landlords:</p>
  <div class="bullet-list">
    <div class="bullet-item">&#8226; Identify compliance risks before they result in legal issues or fines</div>
    <div class="bullet-item">&#8226; Understand their current practices relative to best practices and legal requirements</div>
    <div class="bullet-item">&#8226; Develop a prioritized action plan for improvement</div>
    <div class="bullet-item">&#8226; Protect themselves from tenant claims and disputes</div>
  </div>

  <h2>What the Colours and Scores Mean</h2>
  <div style="margin-bottom:10px;display:flex;align-items:center;">${trafficDot(2, 18)} <span style="margin-left:10px;"><strong>Red (1-3):</strong> Actions need to be taken immediately. You can be fined or tenants have power to claim money from you. These are critical compliance issues that require urgent attention.</span></div>
  <div style="margin-bottom:10px;display:flex;align-items:center;">${trafficDot(5, 18)} <span style="margin-left:10px;"><strong>Orange (4-6):</strong> Improvements need to be planned. Tenants will be able to win if you are taken to court. These areas require attention to avoid potential legal issues.</span></div>
  <div style="margin-bottom:10px;display:flex;align-items:center;">${trafficDot(8, 18)} <span style="margin-left:10px;"><strong>Green (7-10):</strong> Doing well in this area. Maintain regular inspection and continue good practices. You are safe from compliance issues in these areas.</span></div>

  <h2>Theory</h2>
  <p>The audit is structured around three main categories, each containing multiple subcategories
  that address specific aspects of landlord compliance and best practices.</p>

  <h3>1. Documentation</h3>
  <p>Proper documentation is the foundation of compliant property management. This category assesses:</p>
  <div class="bullet-list">
    <div class="bullet-item">&#8226; Certificates (Gas, Electrical, EPC, PAT)</div>
    <div class="bullet-item">&#8226; Tenant Manuals &amp; Welcome Documents</div>
    <div class="bullet-item">&#8226; Council Required Documents (HMO licenses, planning permissions)</div>
    <div class="bullet-item">&#8226; Tenant Responsibilities Documentation</div>
    <div class="bullet-item">&#8226; Rent &amp; Financial Tracking Systems</div>
    <div class="bullet-item">&#8226; Complaint &amp; Repair Systems</div>
    <div class="bullet-item">&#8226; Tenant Agreement Compliance</div>
  </div>

  <h3>2. Landlord-Tenant Communication</h3>
  <p>Effective communication prevents disputes and demonstrates professionalism. This category evaluates:</p>
  <div class="bullet-list">
    <div class="bullet-item">&#8226; Written Records of Communications</div>
    <div class="bullet-item">&#8226; Contact &amp; Complaint Logs</div>
    <div class="bullet-item">&#8226; Notice Procedures &amp; Documentation</div>
    <div class="bullet-item">&#8226; Response Time &amp; Quality</div>
    <div class="bullet-item">&#8226; Accessibility &amp; Availability</div>
  </div>

  <h3>3. Evidence Gathering Systems and Procedures</h3>
  <p>Strong evidence systems protect landlords in disputes and demonstrate due diligence. This category assesses:</p>
  <div class="bullet-list">
    <div class="bullet-item">&#8226; Inspection Process &amp; Documentation</div>
    <div class="bullet-item">&#8226; Photographic &amp; Video Evidence</div>
    <div class="bullet-item">&#8226; Evidence Archives &amp; Storage</div>
    <div class="bullet-item">&#8226; Maintenance &amp; Repair Records</div>
    <div class="bullet-item">&#8226; Incident Documentation</div>
    <div class="bullet-item">&#8226; Tenant Communication Archives</div>
    <div class="bullet-item">&#8226; Deposit Protection Documentation</div>
  </div>

  ${pageFooter}
</div>

<!-- ═══════ PAGE 9: THE RESULTS ═══════ -->
<div class="page">
  ${pageHeader}
  <h1>The Results</h1>

  <h2>Overall Score</h2>
  <div style="display:flex;align-items:center;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid ${COLORS.lightGray};">
    <span style="flex:1;font-size:12pt;font-weight:bold;">Overall Compliance Score</span>
    <span style="font-size:16pt;font-weight:bold;color:${overallColor};margin-right:15px;width:50px;text-align:right;">${formatScore(d.overallScore)}</span>
    ${trafficDot(d.overallScore, 16)}
  </div>

  <h2>Category Scores</h2>
  <div style="display:flex;align-items:center;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid ${COLORS.lightGray};">
    <span style="flex:1;font-size:12pt;font-weight:bold;">Documentation</span>
    <span style="font-size:16pt;font-weight:bold;color:${getTrafficColor(d.categoryScores.documentation.score)};margin-right:15px;width:50px;text-align:right;">${formatScore(d.categoryScores.documentation.score)}</span>
    ${trafficDot(d.categoryScores.documentation.score, 16)}
  </div>
  <div style="display:flex;align-items:center;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid ${COLORS.lightGray};">
    <span style="flex:1;font-size:12pt;font-weight:bold;">Landlord-Tenant Communication</span>
    <span style="font-size:16pt;font-weight:bold;color:${getTrafficColor(d.categoryScores.communication.score)};margin-right:15px;width:50px;text-align:right;">${formatScore(d.categoryScores.communication.score)}</span>
    ${trafficDot(d.categoryScores.communication.score, 16)}
  </div>
  <div style="display:flex;align-items:center;margin-bottom:15px;padding-bottom:10px;border-bottom:1px solid ${COLORS.lightGray};">
    <span style="flex:1;font-size:12pt;font-weight:bold;">Evidence Gathering Systems and Procedures</span>
    <span style="font-size:16pt;font-weight:bold;color:${getTrafficColor(d.categoryScores.evidenceGathering.score)};margin-right:15px;width:50px;text-align:right;">${formatScore(d.categoryScores.evidenceGathering.score)}</span>
    ${trafficDot(d.categoryScores.evidenceGathering.score, 16)}
  </div>

  ${pageFooter}
</div>

<!-- ═══════ PAGE 10: RECOMMENDATIONS ═══════ -->
<div class="page">
  ${pageHeader}
  <h1>Recommended Actions</h1>

  <p>Based on your audit results, the following actions are recommended to improve compliance
  and reduce risk. Priority should be given to areas with lower scores (red and orange).</p>

  <h2>Suggestions for Improvement</h2>

  ${(['documentation', 'communication', 'evidenceGathering'] as const).map(cat => {
    const catName = cat === 'documentation' ? 'Documentation' : cat === 'communication' ? 'Landlord-Tenant Communication' : 'Evidence Gathering Systems and Procedures';
    const recs = d.recommendationsByCategory[cat];
    if (recs.length === 0) {
      return `<h3>${catName}</h3><div style="color:${COLORS.darkGreen};margin-bottom:15px;">All areas in this category are performing well. No specific recommendations.</div>`;
    }
    const sortedRecs = [...recs].sort((a, b) => a.priority - b.priority);
    return `<h3>${catName}</h3>
    <table>
      <thead><tr><th style="width:15%;">Priority</th><th style="width:30%;">Subcategory</th><th style="width:55%;">Required Actions</th></tr></thead>
      <tbody>
        ${sortedRecs.map(rec => `
        <tr>
          <td><span style="font-weight:bold;color:${getPriorityColor(rec.priority)};">${getPriorityLabel(rec.priority)}</span><div style="font-size:8pt;color:${COLORS.mediumGray};margin-top:2px;">${rec.impact}</div></td>
          <td><strong>${rec.subcategory}</strong><div style="color:${COLORS.mediumGray};">Score: ${formatScore(rec.score)}</div></td>
          <td>${rec.suggestions.map(s => `<div style="margin-bottom:4px;">&#8226; ${s}</div>`).join('')}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  }).join('')}

  <h2>Follow-on Products and Services</h2>
  <p>The following professional services and products are recommended to address specific
  low-scoring areas identified in your audit:</p>

  ${d.suggestedServices.length > 0 ? `
  <table>
    <thead><tr><th>Low-scoring Subcategory</th><th>Suggested Follow-on Product/Service</th></tr></thead>
    <tbody>
      ${d.suggestedServices.map(s => `<tr><td>${s.lowScoringArea}</td><td style="font-weight:bold;">${s.suggestedService}</td></tr>`).join('')}
    </tbody>
  </table>` : `<div style="color:${COLORS.darkGreen};">No specific follow-on services recommended. Your overall compliance level is satisfactory.</div>`}

  ${pageFooter}
</div>

<!-- ═══════ PAGE 11: ACTION PLAN ═══════ -->
<div class="page">
  ${pageHeader}
  <h1>Action Plan</h1>

  <p>This action plan provides a prioritized timeline for addressing findings identified in this audit.
  Actions are categorized by urgency and legal risk, with immediate actions requiring attention
  within 7 days to avoid legal exposure.</p>

  ${immediateActions.length > 0 ? `
  <div style="margin-bottom:25px;">
    <div style="background:${COLORS.paleBlue};padding:10px;margin-bottom:10px;border-top:2px solid ${COLORS.blue};">
      <span style="font-weight:bold;color:${COLORS.red};">IMMEDIATE ACTIONS (0-7 Days)</span>
    </div>
    <div style="padding-left:10px;margin-bottom:10px;font-style:italic;color:${COLORS.red};font-size:10pt;">Critical compliance issues exposing you to immediate fines or prosecution.</div>
    ${immediateActions.map(a => `<div style="display:flex;align-items:center;padding:8px 10px;border-bottom:1px solid ${COLORS.lightGray};"><span style="width:70px;font-weight:bold;color:${COLORS.red};font-size:9pt;">CRITICAL</span><span style="flex:1;margin-left:10px;font-size:10pt;">${a}</span></div>`).join('')}
  </div>` : ''}

  ${shortTermActions.length > 0 ? `
  <div style="margin-bottom:25px;">
    <div style="background:${COLORS.paleBlue};padding:10px;margin-bottom:10px;border-top:2px solid ${COLORS.blue};">
      <span style="font-weight:bold;color:${COLORS.orange};">HIGH PRIORITY (30 Days)</span>
    </div>
    <div style="padding-left:10px;margin-bottom:10px;font-style:italic;color:${COLORS.orange};font-size:10pt;">Significant gaps that increase tribunal vulnerability and legal risk.</div>
    ${shortTermActions.map(a => `<div style="display:flex;align-items:center;padding:8px 10px;border-bottom:1px solid ${COLORS.lightGray};"><span style="width:70px;font-weight:bold;color:${COLORS.orange};font-size:9pt;">HIGH</span><span style="flex:1;margin-left:10px;font-size:10pt;">${a}</span></div>`).join('')}
  </div>` : ''}

  ${mediumTermActions.length > 0 ? `
  <div style="margin-bottom:25px;">
    <div style="background:${COLORS.paleBlue};padding:10px;margin-bottom:10px;border-top:2px solid ${COLORS.blue};">
      <span style="font-weight:bold;color:${COLORS.darkGreen};">MEDIUM PRIORITY (90 Days)</span>
    </div>
    <div style="padding-left:10px;margin-bottom:10px;font-style:italic;color:${COLORS.darkGreen};font-size:10pt;">Best practice improvements to strengthen overall compliance position.</div>
    ${mediumTermActions.map(a => `<div style="display:flex;align-items:center;padding:8px 10px;border-bottom:1px solid ${COLORS.lightGray};"><span style="width:70px;font-weight:bold;color:${COLORS.darkGreen};font-size:9pt;">MEDIUM</span><span style="flex:1;margin-left:10px;font-size:10pt;">${a}</span></div>`).join('')}
  </div>` : ''}

  ${immediateActions.length === 0 && shortTermActions.length === 0 && mediumTermActions.length === 0 ? `
  <div style="margin-top:30px;padding:20px;background:#f0fdf4;border:2px solid ${COLORS.darkGreen};">
    <div style="font-size:12pt;font-weight:bold;color:${COLORS.darkGreen};">Excellent Compliance Status</div>
    <p style="margin-top:8px;">No immediate or short-term actions required. Continue maintaining current systems and
    conduct regular reviews to ensure ongoing compliance.</p>
  </div>` : ''}

  ${pageFooter}
</div>

<!-- ═══════ PAGE 12+: DETAILED RESULTS ═══════ -->
<div class="page">
  ${pageHeader}
  <h1>Detailed Results</h1>

  <p>This section provides a comprehensive breakdown of all audit questions.
  Each question includes the selected answer and any additional comments provided.</p>

  <table>
    <thead><tr>
      <th style="width:35%;">Question</th>
      <th style="width:35%;">Answer</th>
      <th style="width:30%;">Comment</th>
    </tr></thead>
    <tbody>
      ${allQ.map(q => `
      <tr style="border-left:3px solid ${getTrafficColor(q.score)};">
        <td style="font-size:9pt;">
          <strong>Q${q.number}</strong> ${q.questionText}
        </td>
        <td style="font-size:9pt;">${q.answer}</td>
        <td style="font-size:9pt;font-style:italic;">${q.comment || ''}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  ${pageFooter}
</div>

</body></html>`;
}
