// Landlord Audit Questions
// Based on docs/development-prompt.md

export interface Question {
  id: string;
  category: string;
  section: string;
  text: string;
  critical: boolean;
  tiers: string[];
  weight: number;
  options: {
    value: 1 | 5 | 10;
    label: string;
  }[];
  motivation_learning_point?: string;
  comment?: string; // Client-facing comment shown when answering questions
  // CSV fallback columns removed - now using score_examples array
  // Scoring guidance from Edit Questions
  score_examples?: Array<{
    score_level: 'low' | 'medium' | 'high';
    reason_text: string;
    report_action?: string | null;
  }>;
}

export const CATEGORIES = {
  DOCUMENTATION: "Documentation",
  COMMUNICATION: "Landlord-Tenant Communication",
  EVIDENCE: "Evidence Gathering Systems and Procedures",
};

export const questions: Question[] = [
  // CATEGORY 1: DOCUMENTATION
  {
    id: "1.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Certificates",
    text: "Do you have all required safety certificates (Gas, Electrical, EPC, PAT) current and readily available?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    options: [
      { value: 10, label: "All certificates current, organized, and readily accessible" },
      { value: 5, label: "Most certificates current but some organization issues" },
      { value: 1, label: "Missing certificates or significantly out of date" },
    ],
  },
  {
    id: "1.2",
    category: CATEGORIES.DOCUMENTATION,
    section: "Certificates",
    text: "Are your certificates displayed or provided to tenants as legally required?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    options: [
      { value: 10, label: "All certificates properly displayed/provided with records of tenant receipt" },
      { value: 5, label: "Certificates available but not always properly communicated" },
      { value: 1, label: "No system for displaying or providing certificates to tenants" },
    ],
  },
  {
    id: "1.3",
    category: CATEGORIES.DOCUMENTATION,
    section: "Certificates",
    text: "Do you have a system to track certificate expiry dates and schedule renewals?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Automated reminder system with advance notifications" },
      { value: 5, label: "Manual tracking with occasional missed renewals" },
      { value: 1, label: "No tracking system - reactive approach only" },
    ],
  },
  {
    id: "2.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Tenant Manuals & Documents",
    text: "Do you provide a comprehensive tenant manual/welcome pack for each property?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Detailed, property-specific manual provided to all tenants with sign-off" },
      { value: 5, label: "Basic information provided but not comprehensive" },
      { value: 1, label: "No tenant manual or welcome pack provided" },
    ],
  },
  {
    id: "3.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Council Required Documents",
    text: "Do you have all required council documentation (HMO license, planning permissions)?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    options: [
      { value: 10, label: "All council requirements met with current licenses and permissions" },
      { value: 5, label: "Most requirements met but some gaps or pending renewals" },
      { value: 1, label: "Missing HMO license or operating without required permissions" },
    ],
  },
  {
    id: "4.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Tenant Responsibilities",
    text: "Are tenant responsibilities clearly documented and acknowledged in writing?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Comprehensive written responsibilities with tenant sign-off" },
      { value: 5, label: "Basic responsibilities mentioned but not formally documented" },
      { value: 1, label: "No clear documentation of tenant responsibilities" },
    ],
  },
  {
    id: "5.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Tenant Critical Information",
    text: "Do tenants have access to critical emergency information (contacts, utilities, fire procedures)?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    options: [
      { value: 10, label: "Comprehensive emergency information prominently displayed and in tenant packs" },
      { value: 5, label: "Some emergency information available but not comprehensive" },
      { value: 1, label: "No organized emergency information provided" },
    ],
  },
  {
    id: "6.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Fire Safety Documentation",
    text: "Do you have a current fire risk assessment and documented fire safety procedures?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    options: [
      { value: 10, label: "Current fire risk assessment with documented procedures and regular reviews" },
      { value: 5, label: "Fire risk assessment exists but may be outdated or incomplete" },
      { value: 1, label: "No fire risk assessment or fire safety documentation" },
    ],
  },
  {
    id: "7.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Landlord Alert/Reminder System",
    text: "Do you have a system to alert you of upcoming compliance deadlines and property tasks?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Automated system with advance alerts for all key deadlines" },
      { value: 5, label: "Manual tracking with some reminders" },
      { value: 1, label: "No systematic alert or reminder system" },
    ],
  },
  {
    id: "8.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Tenant Information",
    text: "Do you maintain comprehensive records of tenant information and emergency contacts?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Complete tenant records with emergency contacts and regular updates" },
      { value: 5, label: "Basic tenant information but gaps in emergency contacts or updates" },
      { value: 1, label: "Minimal tenant information records" },
    ],
  },

  // CATEGORY 2: LANDLORD-TENANT COMMUNICATION
  {
    id: "9.1",
    category: CATEGORIES.COMMUNICATION,
    section: "Day-to-day Communication System",
    text: "Do you have a clear, documented system for day-to-day communication with tenants?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Multiple clear channels (email, phone, portal) with documented response times" },
      { value: 5, label: "Communication happens but no formal system or response standards" },
      { value: 1, label: "Ad-hoc communication with no clear channels or expectations" },
    ],
  },
  {
    id: "10.1",
    category: CATEGORIES.COMMUNICATION,
    section: "Behaviour Reporting Procedure/System",
    text: "Is there a clear procedure for tenants to report behavioral issues or concerns?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Documented reporting procedure with clear escalation process" },
      { value: 5, label: "Informal reporting process that works but isn't documented" },
      { value: 1, label: "No clear procedure for reporting behavioral issues" },
    ],
  },
  {
    id: "10.2",
    category: CATEGORIES.COMMUNICATION,
    section: "Behaviour Reporting Procedure/System",
    text: "Do you maintain records of behavioral reports and actions taken?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Comprehensive log of all reports with documented actions and outcomes" },
      { value: 5, label: "Some record-keeping but not systematic" },
      { value: 1, label: "No formal records of behavioral issues or actions" },
    ],
  },
  {
    id: "11.1",
    category: CATEGORIES.COMMUNICATION,
    section: "Cleanliness",
    text: "Are cleanliness standards and expectations clearly communicated to all tenants?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Written cleanliness standards with regular communication and inspections" },
      { value: 5, label: "General expectations communicated but not formally documented" },
      { value: 1, label: "No clear communication of cleanliness standards" },
    ],
  },
  {
    id: "12.1",
    category: CATEGORIES.COMMUNICATION,
    section: "Product Buying",
    text: "Is there a clear system for purchasing shared household items (cleaning supplies, etc.)?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 0.5,
    options: [
      { value: 10, label: "Documented purchasing system with clear responsibilities and budget" },
      { value: 5, label: "Informal arrangement that generally works" },
      { value: 1, label: "No clear system for shared purchases" },
    ],
  },
  {
    id: "13.1",
    category: CATEGORIES.COMMUNICATION,
    section: "Rotas",
    text: "Do you have cleaning rotas or shared responsibility schedules in place?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Clear rotas with tenant agreement and regular monitoring" },
      { value: 5, label: "Rotas exist but compliance is inconsistent" },
      { value: 1, label: "No formal rotas or shared responsibility schedules" },
    ],
  },

  // CATEGORY 3: EVIDENCE GATHERING SYSTEMS AND PROCEDURES
  {
    id: "14.1",
    category: CATEGORIES.EVIDENCE,
    section: "Room Inspections Log",
    text: "Do you conduct and document regular room inspections?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    options: [
      { value: 10, label: "Regular scheduled inspections with comprehensive photographic records" },
      { value: 5, label: "Occasional inspections with basic documentation" },
      { value: 1, label: "No systematic room inspection process" },
    ],
  },
  {
    id: "15.1",
    category: CATEGORIES.EVIDENCE,
    section: "Room Inventory",
    text: "Do you maintain detailed inventories for each room with photographic evidence?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.5,
    options: [
      { value: 10, label: "Comprehensive inventory with photos, signed by tenant at move-in/out" },
      { value: 5, label: "Basic inventory but lacking detail or photographic evidence" },
      { value: 1, label: "No formal room inventory system" },
    ],
  },
  {
    id: "16.1",
    category: CATEGORIES.EVIDENCE,
    section: "Property Maintenance Log",
    text: "Do you maintain a comprehensive log of all maintenance and repairs?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Detailed log with dates, costs, contractors, and photos for all work" },
      { value: 5, label: "Basic records of major work but gaps in documentation" },
      { value: 1, label: "No systematic maintenance logging" },
    ],
  },
  {
    id: "16.2",
    category: CATEGORIES.EVIDENCE,
    section: "Property Maintenance Log",
    text: "Do you have a system for tenants to report repairs with tracking until completion?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Online system with ticket tracking, updates, and completion confirmation" },
      { value: 5, label: "Manual reporting system with some tracking" },
      { value: 1, label: "No formal repair reporting or tracking system" },
    ],
  },
  {
    id: "17.1",
    category: CATEGORIES.EVIDENCE,
    section: "Shared Spaces Inspection Log",
    text: "Do you conduct regular inspections of shared spaces with documented findings?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    options: [
      { value: 10, label: "Weekly/bi-weekly inspections with photographic records and action logs" },
      { value: 5, label: "Occasional inspections with minimal documentation" },
      { value: 1, label: "No systematic shared space inspection process" },
    ],
  },
  {
    id: "18.1",
    category: CATEGORIES.EVIDENCE,
    section: "External Property Inspection Log",
    text: "Do you conduct regular external property inspections with documented findings?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    options: [
      { value: 10, label: "Quarterly external inspections with comprehensive photographic records" },
      { value: 5, label: "Annual or ad-hoc external inspections with basic notes" },
      { value: 1, label: "No systematic external property inspection process" },
    ],
  },
  {
    id: "19.1",
    category: CATEGORIES.EVIDENCE,
    section: "Tenant Behaviour Log",
    text: "Do you maintain a log of tenant behavior issues and actions taken?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Comprehensive log with dates, witnesses, evidence, and resolution outcomes" },
      { value: 5, label: "Informal notes of major issues but not systematic" },
      { value: 1, label: "No formal tenant behavior logging system" },
    ],
  },
  {
    id: "20.1",
    category: CATEGORIES.EVIDENCE,
    section: "Fire and Accident Log & Safety Action List",
    text: "Do you maintain a fire and accident log with documented safety actions?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    options: [
      { value: 10, label: "Comprehensive log of all incidents with investigation reports and preventive actions" },
      { value: 5, label: "Basic incident recording but limited follow-up documentation" },
      { value: 1, label: "No formal fire and accident logging system" },
    ],
  },
  {
    id: "21.1",
    category: CATEGORIES.EVIDENCE,
    section: "Condensation Prevention Procedures",
    text: "Do you have documented procedures for condensation prevention and tenant education?",
    critical: false,
    tiers: ["tier_0", "tier_1"],
    weight: 1.0,
    options: [
      { value: 10, label: "Written procedures with tenant guidance, regular monitoring, and action plans" },
      { value: 5, label: "Basic advice given to tenants but not formally documented" },
      { value: 1, label: "No formal condensation prevention procedures" },
    ],
  },
];

// Helper function to get questions by tier
export function getQuestionsByTier(tier: string): Question[] {
  return questions.filter((q) => q.tiers.includes(tier));
}

// Helper function to group questions by category
export function groupQuestionsByCategory(questionsToGroup: Question[]) {
  const grouped: Record<string, Question[]> = {};
  
  questionsToGroup.forEach((question) => {
    if (!grouped[question.category]) {
      grouped[question.category] = [];
    }
    grouped[question.category].push(question);
  });
  
  return grouped;
}

