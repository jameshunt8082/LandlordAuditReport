// Landlord Audit Questions
// Based on docs/development-prompt.md
// Updated with comprehensive question text, motivation/learning points, and score-based report actions

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
    text: "Do you have current copies of ALL of the following for this property: Landlord's Gas Safety Certificate, Landlord's Electrical Safety Certificate (EICR), and Energy Performance Certificate (EPC)?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    comment: "This covers all mandatory safety and compliance certificates including Gas Safety Certificate (annually), Electrical Installation Condition Report (EICR - every 5 years), Portable Appliance Testing (PAT) for landlord-supplied appliances, and Energy Performance Certificate (EPC) with minimum E rating. All certificates must be current, readily accessible, and have a clear system for tracking renewal dates.",
    motivation_learning_point: "These certificates are not administrative formalities — they are legal preconditions to lawful letting and, in some cases, to regaining possession. In England, failure to obtain or properly serve certain compliance documents can invalidate a Section 21 notice and significantly weaken your position in disputes. If you cannot prove compliance, you are exposed.",
    options: [
      { value: 10, label: "I hold current copies of all required certificates (Gas Safety, EICR, EPC) and have clear evidence they were properly served to the tenant." },
      { value: 5, label: "I hold some certificates, but one or more may be expired, missing, or I do not have clear proof they were properly served." },
      { value: 1, label: "I do not hold all required certificates or I am unsure of their status." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "I do not hold all required certificates or I am unsure of their status.",
        report_action: "Immediately obtain valid and in-date Gas Safety, Electrical Safety (EICR), and EPC certificates. Failure to hold and properly serve these documents can invalidate possession proceedings and expose you to fines.\n\nOur premium audit service ensures your documentation is legally defensible, correctly served, and securely recorded — protecting your ability to regain possession when required.",
      },
      {
        score_level: "medium",
        reason_text: "I hold some certificates, but one or more may be expired, missing, or I do not have clear proof they were properly served.",
        report_action: "Conduct an immediate compliance review to confirm all certificates are current and properly evidenced as served. Partial compliance is not legal protection.\n\nOur premium audit service identifies procedural gaps before they are exploited in court or enforcement action.",
      },
      {
        score_level: "high",
        reason_text: "I hold current copies of all required certificates (Gas Safety, EICR, EPC) and have clear evidence they were properly served to the tenant.",
        report_action: "Maintain strict renewal monitoring and retain clear evidence that all certificates have been properly served. You are currently in a strong evidential position.\n\nFor continued protection, our premium audit service provides structured oversight to ensure you remain compliant and legally defensible as regulations evolve.",
      },
    ],
  },
  {
    id: "1.2",
    category: CATEGORIES.DOCUMENTATION,
    section: "Certificates",
    text: "Do you track renewal dates for these certificates?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    comment: "Covers statutory safety and energy certification requirements necessary for lawful letting and possession protection.",
    motivation_learning_point: "Compliance is continuous, not a one-time event. Allowing certificates to expire, even briefly, can create legal exposure, invalidate possession proceedings, and expose you to enforcement action. A single lapse can undermine an otherwise strong legal position.",
    options: [
      { value: 10, label: "I actively track renewal dates using a structured system with reminders set in advance of expiry." },
      { value: 5, label: "I am aware of renewal dates but rely on memory, ad-hoc reminders, or reactive action." },
      { value: 1, label: "I do not formally track renewal dates and risk certificates expiring without notice." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "I do not formally track renewal dates and risk certificates expiring without notice.",
        report_action: "Implement a formal compliance tracking system immediately. Set structured reminders well in advance of expiry dates and maintain written evidence of renewal scheduling.\n\nOur premium audit service can establish a structured compliance calendar and monitoring system that prevents costly lapses and protects your ability to enforce your rights as a landlord.",
      },
      {
        score_level: "medium",
        reason_text: "I am aware of renewal dates but rely on memory, ad-hoc reminders, or reactive action.",
        report_action: "Move from informal tracking to a documented, systemised renewal process. Introduce advance reminders and maintain evidence that renewals are scheduled before expiry.\n\nOur premium audit service helps convert informal processes into defensible systems that withstand legal scrutiny.",
      },
      {
        score_level: "high",
        reason_text: "I actively track renewal dates using a structured system with reminders set in advance of expiry.",
        report_action: "Continue maintaining structured renewal monitoring and documented scheduling. Regularly review your system to ensure no certificate approaches expiry unnoticed.\n\nFor ongoing oversight and regulatory updates, our premium audit service provides structured monitoring to keep you protected.",
      },
    ],
  },
  {
    id: "1.3",
    category: CATEGORIES.DOCUMENTATION,
    section: "Certificates",
    text: "Do you give all your new tenants a copy of the latest 'How To Rent' leaflet?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    comment: "Evaluates procedural strength, evidential protection, and legal defensibility.",
    motivation_learning_point: "Failure to provide the correct 'How To Rent' guide can invalidate Section 21 proceedings. Proof of service is critical.",
    options: [
      { value: 10, label: "Provided latest version with proof of service." },
      { value: 5, label: "Provided but no proof retained." },
      { value: 1, label: "Not provided or unsure." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "Not provided or unsure.",
        report_action: "Serve the latest 'How To Rent' guide immediately and retain proof.\n\nOur premium audit service ensures tenancy documentation withstands procedural challenges.",
      },
      {
        score_level: "medium",
        reason_text: "Provided but no proof retained.",
        report_action: "Audit version control and service records.\n\nWe identify service gaps before they invalidate possession.",
      },
      {
        score_level: "high",
        reason_text: "Provided latest version with proof of service.",
        report_action: "Maintain version monitoring and service evidence.\n\nOngoing oversight protects against regulatory change.",
      },
    ],
  },
  {
    id: "2.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Tenant Manuals & Documents",
    text: "Do you provide tenants with a property manual that includes emergency numbers and troubleshooting guide that shows tenants what to do in the event of problems such as loss of heating, water, internet etc.?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This evaluates the clarity and comprehensiveness of information provided to tenants at tenancy start, including the government How to Rent guide, detailed property manual covering safety procedures, emergency contacts, maintenance reporting instructions, and shared space rules.",
    motivation_learning_point: "Clear written guidance reduces disputes and liability claims.",
    options: [
      { value: 10, label: "Comprehensive written property manual issued." },
      { value: 5, label: "Basic or informal guidance." },
      { value: 1, label: "No manual." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No manual.",
        report_action: "Issue a structured property manual immediately.\n\nOur premium audit service builds manuals that protect landlords from avoidable disputes.",
      },
      {
        score_level: "medium",
        reason_text: "Basic or informal guidance.",
        report_action: "Formalise informal guidance into written format.\n\nWe convert informal advice into defensible documentation.",
      },
      {
        score_level: "high",
        reason_text: "Comprehensive written property manual issued.",
        report_action: "Maintain and update the manual regularly.\n\nOngoing oversight keeps documentation aligned.",
      },
    ],
  },
  {
    id: "2.3",
    category: CATEGORIES.DOCUMENTATION,
    section: "Tenant Manuals & Documents",
    text: "Do you get all your new tenants to sign a Property Inventory and Condition Report?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "Evaluates procedural strength, evidential protection, and legal defensibility.",
    motivation_learning_point: "In deposit disputes and damage claims, the burden of proof sits with the landlord. Without a detailed, signed, and dated inventory supported by photographic evidence, you will struggle to prove the original condition of the property. An unsigned or vague inventory can render legitimate claims unenforceable.",
    options: [
      { value: 10, label: "Detailed signed photographic inventory." },
      { value: 5, label: "Inventory lacks detail or signature." },
      { value: 1, label: "No signed inventory." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No signed inventory.",
        report_action: "Immediately implement a detailed, room-by-room photographic inventory process for every tenancy and ensure it is signed and dated by the tenant at check-in.\n\nOur premium audit service builds dispute-ready inventory systems designed to withstand adjudicator and court scrutiny, protecting your financial position from avoidable losses.",
      },
      {
        score_level: "medium",
        reason_text: "Inventory lacks detail or signature.",
        report_action: "Upgrade your inventory documentation to include clearer descriptions, time-stamped photographs, tenant acknowledgment, and consistent formatting.\n\nWe help transform basic inventories into legally defensible evidence frameworks that strengthen your leverage in disputes.",
      },
      {
        score_level: "high",
        reason_text: "Detailed signed photographic inventory.",
        report_action: "Continue maintaining high-standard photographic inventories and actively reference them during routine property inspections. Use inspections to compare current condition against the original inventory so issues are identified and documented early.\n\nOur premium audit service integrates inventory documentation with inspection protocols, ensuring ongoing evidential protection.",
      },
    ],
  },
  {
    id: "3.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Council Required Documents",
    text: "Have you formally reviewed and confirmed that this property complies with all applicable local HMO licensing and management regulations in your area?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    comment: "This assesses whether the property has the correct HMO licence for its size and location (mandatory, additional, or selective licensing). It includes adherence to all specific conditions attached to the licence, such as minimum room sizes, provision of amenities, and any additional documents required by the local council.",
    motivation_learning_point: "HMO non-compliance can result in fines, rent repayment orders, or prosecution.",
    options: [
      { value: 10, label: "Fully checked and compliant with local HMO rules." },
      { value: 5, label: "Aware but not fully verified." },
      { value: 1, label: "Not checked." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "Not checked.",
        report_action: "Confirm licensing requirements immediately.\n\nOur premium audit service reviews local authority compliance gaps.",
      },
      {
        score_level: "medium",
        reason_text: "Aware but not fully verified.",
        report_action: "Conduct structured local authority compliance review.\n\nWe align your property with evolving enforcement standards.",
      },
      {
        score_level: "high",
        reason_text: "Fully checked and compliant with local HMO rules.",
        report_action: "Monitor regulatory updates regularly.\n\nOngoing oversight protects against change risk.",
      },
    ],
  },
  {
    id: "4.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Tenant Responsibilities",
    text: "Do you have documented cleaning rotas and tenant responsibilities for shared areas?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This covers the documentation and communication of tenant responsibilities for maintaining shared areas and following house procedures. This includes clear rotas for cleaning, waste management, and other shared responsibilities that are documented and regularly updated.",
    motivation_learning_point: "Shared space disputes escalate quickly and often trigger complaints to the local authority. Without documented allocation of responsibility, enforcement risk and blame frequently shift to the landlord.",
    options: [
      { value: 10, label: "Formal written cleaning rota clearly allocating responsibilities, acknowledged by tenants." },
      { value: 5, label: "Informal or partially written rota without clear acknowledgment." },
      { value: 1, label: "No structured or documented cleaning rota." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No structured or documented cleaning rota.",
        report_action: "Establish a written, enforceable cleaning rota immediately and require tenant acknowledgment.\n\nOur premium audit service designs structured accountability systems that prevent complaint escalation and protect landlords from enforcement action.",
      },
      {
        score_level: "medium",
        reason_text: "Informal or partially written rota without clear acknowledgment.",
        report_action: "Formalise any existing informal arrangements into a documented rota with clear responsibility allocation.\n\nWe convert verbal systems into defensible documentation that strengthens your enforcement position.",
      },
      {
        score_level: "high",
        reason_text: "Formal written cleaning rota clearly allocating responsibilities, acknowledged by tenants.",
        report_action: "Maintain structured cleaning rotas and review responsibilities as tenants change.\n\nOngoing oversight ensures shared areas remain compliant and dispute-resistant.",
      },
    ],
  },
  {
    id: "5.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Tenant Critical Information",
    text: "Are fire escape routes clearly marked and emergency contact numbers prominently displayed?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    comment: "This assesses the provision and accessibility of critical safety information to tenants, including clearly marked fire escape routes, prominently displayed emergency contact numbers, and evidence that tenants have received and understood this vital safety information.",
    motivation_learning_point: "Inadequate fire signage increases liability exposure and can result in enforcement action or insurance complications after an incident.",
    options: [
      { value: 10, label: "Clearly marked fire escape routes with prominently displayed emergency contact details." },
      { value: 5, label: "Basic signage but inconsistent visibility or placement." },
      { value: 1, label: "No clear signage or emergency contact display." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No clear signage or emergency contact display.",
        report_action: "Install compliant signage and display emergency contact information immediately.\n\nOur premium audit service ensures fire safety presentation meets inspection and enforcement expectations.",
      },
      {
        score_level: "medium",
        reason_text: "Basic signage but inconsistent visibility or placement.",
        report_action: "Review positioning and clarity of existing signage.\n\nWe identify weaknesses before inspectors or insurers do.",
      },
      {
        score_level: "high",
        reason_text: "Clearly marked fire escape routes with prominently displayed emergency contact details.",
        report_action: "Continue periodic checks of signage visibility and condition.\n\nOngoing oversight maintains inspection readiness.",
      },
    ],
  },
  {
    id: "6.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Fire Safety Documentation",
    text: "Do you have a current Fire Risk Assessment and records of regular alarm testing?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    comment: "This covers comprehensive fire safety documentation including current Fire Risk Assessment (FRA), records of regular alarm testing, fire equipment maintenance logs, and ensuring all landlord-supplied furniture meets fire safety standards.",
    motivation_learning_point: "A missing or outdated Fire Risk Assessment can lead to prosecution, unlimited fines, or prohibition notices.",
    options: [
      { value: 10, label: "Current Fire Risk Assessment with documented alarm testing records." },
      { value: 5, label: "FRA exists but outdated or testing logs inconsistent." },
      { value: 1, label: "No current FRA or documented alarm testing." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No current FRA or documented alarm testing.",
        report_action: "Commission an updated Fire Risk Assessment immediately and implement formal testing logs.\n\nOur premium audit service ensures fire documentation withstands enforcement scrutiny.",
      },
      {
        score_level: "medium",
        reason_text: "FRA exists but outdated or testing logs inconsistent.",
        report_action: "Review FRA validity and formalise alarm testing documentation.\n\nWe convert partial compliance into defensible systems.",
      },
      {
        score_level: "high",
        reason_text: "Current Fire Risk Assessment with documented alarm testing records.",
        report_action: "Maintain scheduled reviews and documented safety testing.\n\nStructured monitoring prevents regulatory exposure.",
      },
    ],
  },
  {
    id: "7.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Landlord Alert/Reminder System",
    text: "What system do you use to track critical compliance deadlines and certificate renewals?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This evaluates the robustness of the system used to track and manage critical compliance deadlines, providing timely alerts for certificate renewals, inspection dates, and other time-sensitive obligations to avoid non-compliance and potential fines.",
    motivation_learning_point: "Missed compliance deadlines can invalidate certificates, expose you to enforcement action, and undermine possession rights.",
    options: [
      { value: 10, label: "Formal compliance tracking system with advance reminders and documented monitoring." },
      { value: 5, label: "Basic calendar reminders but no structured tracking." },
      { value: 1, label: "No formal deadline tracking system." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No formal deadline tracking system.",
        report_action: "Adopt a formal compliance tracking system immediately.\n\nOur premium audit service installs structured monitoring frameworks that prevent costly lapses.",
      },
      {
        score_level: "medium",
        reason_text: "Basic calendar reminders but no structured tracking.",
        report_action: "Upgrade informal reminders to a documented tracking system.\n\nWe strengthen your compliance infrastructure.",
      },
      {
        score_level: "high",
        reason_text: "Formal compliance tracking system with advance reminders and documented monitoring.",
        report_action: "Maintain disciplined monitoring and review cycles.\n\nOngoing oversight reduces procedural risk.",
      },
    ],
  },
  {
    id: "8.1",
    category: CATEGORIES.DOCUMENTATION,
    section: "Tenant Information",
    text: "How do you store tenant personal information and ensure GDPR compliance?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This assesses the secure storage and management of tenants personal information in compliance with GDPR, including contact details, next of kin, copies of identification documents, and Right to Rent checks, ensuring confidentiality and legitimate use only.",
    motivation_learning_point: "Improper handling of tenant data can result in ICO penalties, fines, and reputational damage.",
    options: [
      { value: 10, label: "Secure, access-controlled storage with documented GDPR policy." },
      { value: 5, label: "Basic storage but no formal GDPR framework." },
      { value: 1, label: "Informal storage with no compliance controls." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "Informal storage with no compliance controls.",
        report_action: "Implement secure storage protocols and documented GDPR policies immediately.\n\nOur premium audit service ensures your data protection framework meets regulatory standards.",
      },
      {
        score_level: "medium",
        reason_text: "Basic storage but no formal GDPR framework.",
        report_action: "Formalise existing storage practices with documented controls.\n\nWe convert informal systems into compliant structures.",
      },
      {
        score_level: "high",
        reason_text: "Secure, access-controlled storage with documented GDPR policy.",
        report_action: "Maintain ongoing GDPR compliance reviews.\n\nStructured oversight protects against regulatory penalties.",
      },
    ],
  },

  // CATEGORY 2: LANDLORD-TENANT COMMUNICATION
  {
    id: "9.1",
    category: CATEGORIES.COMMUNICATION,
    section: "Day-to-day Communication System",
    text: "What is your primary method for routine communication with tenants?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This assesses the primary method for routine communication with tenants, whether through WhatsApp groups, email, or property management apps. The system should be accessible to all tenants, actively monitored, and used for general announcements and non-urgent queries.",
    motivation_learning_point: "In disputes, undocumented communication is effectively non-existent. Relying on verbal discussions creates evidential gaps that tenants can exploit. Primary communication should be written and retained, and secondary channels such as WhatsApp should also be archived. All email and WhatsApp communications must be stored and retrievable to maintain defensibility.",
    options: [
      { value: 10, label: "Primary communication channel is written and fully retained." },
      { value: 5, label: "Mixed written and verbal communication." },
      { value: 1, label: "Primarily verbal with no records retained." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "Primarily verbal with no records retained.",
        report_action: "Immediately standardise all key tenant communication to written channels and implement an archiving system for email and WhatsApp correspondence.\n\nOur premium audit service structures communication retention systems that protect landlords from evidential disputes and allegation-based claims.",
      },
      {
        score_level: "medium",
        reason_text: "Mixed written and verbal communication.",
        report_action: "Reduce reliance on verbal communication and introduce consistent archiving of written correspondence, including messaging platforms.\n\nWe help formalise communication systems to eliminate evidential gaps that can be exploited.",
      },
      {
        score_level: "high",
        reason_text: "Primary communication channel is written and fully retained.",
        report_action: "Maintain disciplined written communication practices and ensure all email and WhatsApp correspondence is securely retained and backed up.\n\nOur premium audit service provides structured oversight to ensure your communication systems remain legally defensible.",
      },
    ],
  },
  {
    id: "10.1",
    category: CATEGORIES.COMMUNICATION,
    section: "Behaviour Reporting Procedure/System",
    text: "How do you handle sensitive issues between tenants while respecting privacy?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This assesses the sensitivity and appropriateness of procedures for handling delicate tenant issues, including how the landlord manages communication around housemate disputes, personal conflicts, and other sensitive matters while respecting tenant privacy and dignity.",
    motivation_learning_point: "Poorly managed disputes can escalate into harassment claims or enforcement scrutiny.",
    options: [
      { value: 10, label: "Structured written dispute-handling procedure with documentation." },
      { value: 5, label: "Informal mediation with limited documentation." },
      { value: 1, label: "Reactive and undocumented handling." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "Reactive and undocumented handling.",
        report_action: "Formalise written procedures for handling inter-tenant disputes immediately.\n\nOur premium audit service creates structured conflict-management frameworks.",
      },
      {
        score_level: "medium",
        reason_text: "Informal mediation with limited documentation.",
        report_action: "Document and standardise current mediation practices.\n\nWe strengthen neutrality and evidential protection.",
      },
      {
        score_level: "high",
        reason_text: "Structured written dispute-handling procedure with documentation.",
        report_action: "Maintain structured dispute documentation.\n\nOngoing oversight reduces escalation risk.",
      },
    ],
  },
  {
    id: "10.2",
    category: CATEGORIES.COMMUNICATION,
    section: "Behaviour Reporting Procedure/System",
    text: "Do you encourage tenants to record problems when they happen with evidence?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This evaluates whether the landlord encourages and facilitates tenants to report and record problems as they occur, including providing systems for photographic evidence, timestamps, and detailed incident descriptions for effective problem resolution.",
    motivation_learning_point: "Early documented evidence prevents exaggerated retrospective claims.",
    options: [
      { value: 10, label: "Tenants formally instructed to submit documented evidence of issues." },
      { value: 5, label: "Encouraged informally." },
      { value: 1, label: "No structured evidence reporting process." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No structured evidence reporting process.",
        report_action: "Introduce formal documented issue reporting immediately.\n\nOur premium audit service structures evidence capture systems that protect landlords from inflated claims.",
      },
      {
        score_level: "medium",
        reason_text: "Encouraged informally.",
        report_action: "Standardise how tenants submit evidence.\n\nWe formalise documentation channels for stronger defence.",
      },
      {
        score_level: "high",
        reason_text: "Tenants formally instructed to submit documented evidence of issues.",
        report_action: "Maintain structured evidence retention systems.\n\nOngoing oversight protects factual integrity.",
      },
    ],
  },
  {
    id: "11.1",
    category: CATEGORIES.COMMUNICATION,
    section: "Cleanliness",
    text: "How do you communicate cleanliness expectations and standards to tenants?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This evaluates how effectively the landlord communicates cleanliness expectations and standards for shared areas, including providing clear guidelines, visual examples, and regular reinforcement of cleaning requirements.",
    motivation_learning_point: "In HMOs, cleanliness enforcement is rarely straightforward. Shared responsibility creates ambiguity, and tenants may avoid raising complaints to prevent being seen as targeting housemates. Without clear written standards, inspection records, and documented follow-up, landlords struggle to enforce standards fairly and consistently. Local authorities may treat persistent hygiene failures as a management breach rather than purely a tenant issue.",
    options: [
      { value: 10, label: "Written cleanliness standards issued at tenancy start and acknowledged by tenants." },
      { value: 5, label: "Verbal or informal written guidance only." },
      { value: 1, label: "No clearly communicated standards." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No clearly communicated standards.",
        report_action: "Formalise cleanliness standards immediately, introduce scheduled inspections of shared areas, and document all follow-up steps to demonstrate consistent and neutral enforcement.\n\nOur premium audit service builds structured HMO management frameworks that allow you to enforce standards confidently without appearing to target individual tenants.",
      },
      {
        score_level: "medium",
        reason_text: "Verbal or informal written guidance only.",
        report_action: "Strengthen your existing approach by introducing inspection logs and documented follow-up procedures.\n\nWe convert informal cleanliness expectations into defensible management systems that withstand local authority scrutiny.",
      },
      {
        score_level: "high",
        reason_text: "Written cleanliness standards issued at tenancy start and acknowledged by tenants.",
        report_action: "Maintain written standards and integrate cleanliness checks into routine inspections, recording findings and follow-up actions each time.\n\nOur premium audit service integrates inspection scheduling and documentation systems to protect you while managing complex shared-house dynamics.",
      },
    ],
  },
  {
    id: "12.1",
    category: CATEGORIES.COMMUNICATION,
    section: "Product Buying",
    text: "Who is responsible for purchasing cleaning products and household supplies?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This covers the clear communication of policies regarding who purchases cleaning products, household supplies, and maintenance items, including cost allocation, quality standards, and procedures for requesting or reimbursing purchases.",
    motivation_learning_point: "In HMOs, cleanliness standards are only sustainable if there is a clear and agreed system for purchasing and replenishing cleaning products. Ambiguity around who buys supplies often leads to deterioration in shared areas and disputes between tenants. Landlords should define the system in writing, agree it at tenancy start, and specify a minimum list of required products (e.g. surface cleaner, disinfectant, washing-up liquid, bin bags, bathroom cleaner, mop and bucket). Without a defined structure, quality standards quickly decline and enforcement becomes difficult.",
    options: [
      { value: 10, label: "Cleaning supply responsibility clearly defined in tenancy documentation." },
      { value: 5, label: "Informally agreed but not documented." },
      { value: 1, label: "No defined responsibility." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No defined responsibility.",
        report_action: "Immediately implement a written cleaning-supply system. Decide whether tenants contribute to a shared fund, rotate purchasing responsibility, or reimburse through a structured method, and define a minimum required product list.\n\nOur premium audit service builds enforceable shared-house management systems that protect landlords from hygiene complaints and management failure allegations.",
      },
      {
        score_level: "medium",
        reason_text: "Informally agreed but not documented.",
        report_action: "Formalise your current arrangement by documenting how products are purchased, how costs are shared, and what minimum standards must be maintained.\n\nWe convert informal house agreements into defensible management frameworks that withstand scrutiny.",
      },
      {
        score_level: "high",
        reason_text: "Cleaning supply responsibility clearly defined in tenancy documentation.",
        report_action: "Maintain your documented purchasing system and review it during inspections to ensure minimum product standards are being met.\n\nOur premium audit service integrates supply management into inspection protocols, ensuring standards remain enforceable and visible.",
      },
    ],
  },
  {
    id: "13.1",
    category: CATEGORIES.COMMUNICATION,
    section: "Rotas",
    text: "How do you manage cleaning rotas and bin collection schedules?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This assesses the effectiveness of communication regarding various rotas including cleaning schedules, bin collection responsibilities, and maintenance access, ensuring all tenants understand their responsibilities and timing.",
    motivation_learning_point: "In HMOs, poorly managed cleaning rotas and bin schedules are a common trigger for neighbour complaints and local authority scrutiny. Without a structured rota supported by reminder emails and documented follow-up, responsibilities quickly become blurred. Automated or scheduled reminder emails reinforce accountability and provide evidential proof that tenants were informed of their duties.",
    options: [
      { value: 10, label: "Written rota and bin schedule acknowledged by tenants." },
      { value: 5, label: "Informal system without documentation." },
      { value: 1, label: "No structured management system." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No structured management system.",
        report_action: "Immediately formalise your cleaning rota and bin schedule, and introduce automated or scheduled reminder emails to tenants. Retain copies of all communications as evidence of enforcement.\n\nOur premium audit service builds structured accountability and reminder systems that protect landlords from hygiene complaints and enforcement risk.",
      },
      {
        score_level: "medium",
        reason_text: "Informal system without documentation.",
        report_action: "Strengthen your existing rota by adding scheduled reminder emails and retaining records of tenant acknowledgment.\n\nWe convert informal rota systems into defensible management frameworks supported by communication evidence.",
      },
      {
        score_level: "high",
        reason_text: "Written rota and bin schedule acknowledged by tenants.",
        report_action: "Maintain your structured rota and ensure reminder emails are sent and archived consistently. Integrate rota checks into routine inspections and document compliance.\n\nOur premium audit service integrates rota monitoring and communication logging to maintain long-term defensibility.",
      },
    ],
  },

  // CATEGORY 3: EVIDENCE GATHERING SYSTEMS AND PROCEDURES
  {
    id: "14.1",
    category: CATEGORIES.EVIDENCE,
    section: "Room Inspections Log",
    text: "How often do you inspect individual tenant rooms and what records do you keep?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This evaluates the system for conducting and recording regular inspections of individual tenant rooms, including proper notice, detailed findings documentation, photographic evidence, and follow-up action tracking.",
    motivation_learning_point: "Room inspections are an essential management control tool, but they must be handled professionally and lawfully. In most cases, inspections are carried out every six months with proper written notice provided in advance. Tenants may refuse access or feel targeted if communication is poorly handled. Without documented notice, clear purpose, and retained inspection records, landlords can struggle to demonstrate proactive management or address deterioration early.",
    options: [
      { value: 10, label: "Scheduled room inspections with detailed written and photographic records." },
      { value: 5, label: "Inspections occur but limited documentation." },
      { value: 1, label: "Rare or undocumented inspections." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "Rare or undocumented inspections.",
        report_action: "Immediately formalise a six-monthly room inspection process with written notice templates and clear professional communication. Record all access requests, tenant responses, and inspection findings to demonstrate lawful and reasonable management.\n\nOur premium audit service develops inspection protocols and communication templates that protect landlords while maintaining professional tenant relationships.",
      },
      {
        score_level: "medium",
        reason_text: "Inspections occur but limited documentation.",
        report_action: "Strengthen your current inspection approach by standardising notice procedures and improving record retention. Ensure all inspections are clearly communicated and professionally documented.\n\nWe help convert informal inspection practices into structured, defensible management systems.",
      },
      {
        score_level: "high",
        reason_text: "Scheduled room inspections with detailed written and photographic records.",
        report_action: "Continue conducting scheduled inspections with proper written notice and retain detailed records of findings and follow-up actions. Review inspection outcomes to identify emerging issues early.\n\nOur premium audit service integrates inspection scheduling, notice templates, and documentation systems to maintain long-term defensibility while respecting tenant rights.",
      },
    ],
  },
  {
    id: "15.1",
    category: CATEGORIES.EVIDENCE,
    section: "Room Inventory",
    text: "Do you create detailed inventory reports at check-in and check-out with photographic evidence?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.5,
    comment: "This covers the comprehensive documentation of room condition and contents at the start and end of tenancies, including detailed inventory reports with photographic evidence, tenant agreement, and proper storage for dispute resolution.",
    motivation_learning_point: "Without strong inventory evidence, deposit deductions are difficult to defend.",
    options: [
      { value: 10, label: "Detailed photographic inventories at check-in and check-out, signed and dated." },
      { value: 5, label: "Inventory exists but lacks sufficient detail or photos." },
      { value: 1, label: "No formal inventory procedure." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No formal inventory procedure.",
        report_action: "Adopt detailed photographic inventories immediately.\n\nOur premium audit service builds structured evidence systems that protect your deposit rights.",
      },
      {
        score_level: "medium",
        reason_text: "Inventory exists but lacks sufficient detail or photos.",
        report_action: "Enhance detail and photographic coverage in current inventories.\n\nWe strengthen your evidential leverage.",
      },
      {
        score_level: "high",
        reason_text: "Detailed photographic inventories at check-in and check-out, signed and dated.",
        report_action: "Maintain high-standard inventory documentation.\n\nStructured oversight keeps your position protected.",
      },
    ],
  },
  {
    id: "16.1",
    category: CATEGORIES.EVIDENCE,
    section: "Tenant's Property Repair Logging System",
    text: "How do tenants report maintenance issues and how do you track them?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This evaluates the system for tenants to report maintenance issues, including ease of reporting, tracking capabilities, response time monitoring, and communication of progress to tenants.",
    motivation_learning_point: "Maintenance reporting must be structured, logged, and actively managed. Tenants frequently fail to report minor issues, which can later escalate into larger disrepair claims. A defensible system should capture all tenant-reported issues, document inspections (both internal and external), and record any proactive repairs identified by the landlord. Recording the cost of works undertaken also demonstrates active investment and responsible property management.",
    options: [
      { value: 10, label: "Structured written reporting system with tracked maintenance log." },
      { value: 5, label: "Reports accepted but no consistent tracking." },
      { value: 1, label: "Informal verbal reporting only." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "Informal verbal reporting only.",
        report_action: "Immediately introduce a structured maintenance log capturing all tenant reports and proactive inspection findings, including internal and external checks. Record dates, actions taken, and costs incurred to evidence your investment in the property.\n\nOur premium audit service builds complete maintenance tracking frameworks that protect landlords from disrepair allegations and evidential challenges.",
      },
      {
        score_level: "medium",
        reason_text: "Reports accepted but no consistent tracking.",
        report_action: "Strengthen your current system by standardising repair logs, recording inspection findings, and tracking expenditure on works carried out.\n\nWe convert reactive maintenance handling into a defensible management system with clear cost transparency.",
      },
      {
        score_level: "high",
        reason_text: "Structured written reporting system with tracked maintenance log.",
        report_action: "Continue maintaining detailed maintenance logs, integrating proactive inspections, and recording repair costs. Use inspection findings to identify emerging issues before they escalate.\n\nOur premium audit service integrates inspection, repair tracking, and cost documentation systems to maintain long-term defensibility.",
      },
    ],
  },
  {
    id: "16.2",
    category: CATEGORIES.EVIDENCE,
    section: "Property Maintenance Log",
    text: "Do you maintain detailed records of maintenance work from start to completion?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This assesses the detailed tracking of maintenance work from initial report through to completion, including progress updates, contractor information, costs, and final completion verification.",
    motivation_learning_point: "Maintenance documentation must cover the full lifecycle of a repair — from initial report through to final completion. Some repairs take time due to contractor availability, specialist works, or parts needing to be ordered. Without detailed records of visits, communications, delays, reordered parts, and interim updates, tenants may later allege neglect or unreasonable delay. A clear audit trail demonstrates active management, even when resolution is not immediate.",
    options: [
      { value: 10, label: "Full lifecycle documentation of maintenance from report to completion." },
      { value: 5, label: "Partial documentation." },
      { value: 1, label: "Minimal or no maintenance records." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "Minimal or no maintenance records.",
        report_action: "Immediately introduce a full repair lifecycle tracking system. Record all visits, communications, delays, reordered materials, and updates provided to tenants. Even where works take time, clear documentation demonstrates ongoing management.\n\nOur premium audit service builds complete repair audit trails that protect landlords from allegations of neglect or unreasonable delay.",
      },
      {
        score_level: "medium",
        reason_text: "Partial documentation.",
        report_action: "Strengthen your current documentation by recording interim steps in the repair process, including contractor attendance, material delays, and tenant updates.\n\nWe convert basic repair records into defensible lifecycle management systems.",
      },
      {
        score_level: "high",
        reason_text: "Full lifecycle documentation of maintenance from report to completion.",
        report_action: "Continue maintaining detailed repair lifecycle documentation and ensure tenants are updated when works are delayed or parts must be reordered. Use your records to evidence reasonable and ongoing management of the issue.\n\nOur premium audit service integrates repair tracking, contractor documentation, and communication logs to maintain long-term legal defensibility.",
      },
    ],
  },
  {
    id: "17.1",
    category: CATEGORIES.EVIDENCE,
    section: "Shared Spaces Inspection Log",
    text: "How often do you inspect shared spaces like kitchens and bathrooms?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This covers regular inspection and documentation of shared spaces including kitchens, bathrooms, and living areas, monitoring hygiene standards, identifying maintenance needs, and tracking resolution of issues.",
    motivation_learning_point: "Shared spaces such as kitchens and bathrooms present a higher management risk in HMOs due to heavy usage, hygiene sensitivity, and overlapping tenant responsibility. Unlike individual room inspections, shared areas require more frequent visual monitoring and proportionate follow-up. Failure to monitor these areas can lead to rapid deterioration, pest issues, fire risks (e.g. grease build-up), and environmental health intervention. Documented inspection frequency and follow-up actions demonstrate active management control.",
    options: [
      { value: 10, label: "Scheduled shared-area inspections with written and photographic records." },
      { value: 5, label: "Inspections occur but limited documentation." },
      { value: 1, label: "Rare or reactive inspections." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "Rare or reactive inspections.",
        report_action: "Implement a clearly defined shared-space inspection schedule (which may be more frequent than room inspections), record hygiene, safety, and maintenance observations, and document any corrective actions taken.\n\nOur premium audit service builds structured shared-area management systems that demonstrate active control and reduce HMO enforcement risk.",
      },
      {
        score_level: "medium",
        reason_text: "Inspections occur but limited documentation.",
        report_action: "Strengthen your oversight by defining inspection intervals and introducing written condition summaries after each visit.\n\nWe help transform casual checks into structured monitoring systems with evidential value.",
      },
      {
        score_level: "high",
        reason_text: "Scheduled shared-area inspections with written and photographic records.",
        report_action: "Maintain consistent shared-area inspections and ensure findings are logged, with follow-up actions tracked to completion. Use patterns in inspection findings to identify recurring issues and adjust management approach.\n\nOur premium audit service integrates shared-space oversight into your wider compliance and risk-control framework.",
      },
    ],
  },
  {
    id: "18.1",
    category: CATEGORIES.EVIDENCE,
    section: "External Property Inspection Log",
    text: "How often do you inspect the exterior of the property and grounds?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This assesses regular inspection of property exterior including guttering, pathways, fencing, gardens, and other external areas, identifying safety hazards and planning preventive maintenance.",
    motivation_learning_point: "Exterior maintenance is a preventative risk-control function, not just a cosmetic issue. Failing to monitor roofs, gutters, drainage, brickwork, fencing, and external seals can lead to water ingress, structural deterioration, and emergency repairs during winter when contractors are less available and costs are higher. Proactive summer inspections allow landlords to address vulnerabilities before adverse weather conditions escalate minor issues into major tenant disruption.",
    options: [
      { value: 10, label: "Regular documented exterior inspections." },
      { value: 5, label: "Occasional checks without formal records." },
      { value: 1, label: "Rare or no exterior inspections." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "Rare or no exterior inspections.",
        report_action: "Introduce a documented seasonal exterior inspection programme, prioritising preventative checks during summer months. Address roofing, guttering, drainage, brickwork, and external seals before winter exposure.\n\nOur premium audit service builds preventative maintenance frameworks that reduce emergency repair costs and protect landlord reputation.",
      },
      {
        score_level: "medium",
        reason_text: "Occasional checks without formal records.",
        report_action: "Strengthen your approach by formalising exterior inspection timing and recording findings, with clear action plans for issues identified before adverse weather periods.\n\nWe help transition from reactive repair handling to structured seasonal risk management.",
      },
      {
        score_level: "high",
        reason_text: "Regular documented exterior inspections.",
        report_action: "Maintain a preventative exterior inspection programme and retain records of seasonal reviews and remedial actions taken. Use historical inspection data to anticipate recurring issues.\n\nOur premium audit service integrates seasonal planning and documentation systems to minimise emergency disruption and protect tenant relationships.",
      },
    ],
  },
  {
    id: "19.1",
    category: CATEGORIES.EVIDENCE,
    section: "Tenant Behaviour Log",
    text: "How do you record and manage tenant behavior issues and complaints?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This evaluates the confidential system for recording and managing tenant behavior issues, disputes, and conflicts, demonstrating fair and consistent approach while maintaining appropriate confidentiality.",
    motivation_learning_point: "Managing tenant behaviour and complaints in HMOs is highly sensitive. Housemates often avoid raising issues formally to prevent conflict or retaliation. Without a structured and confidential reporting channel, problems may remain hidden until they escalate. Providing tenants with a confidential method of communication — where concerns can be logged without immediate disclosure of identity — allows patterns of behaviour to be identified while protecting tenant relationships. Even anonymous complaints should be formally recorded to build a defensible history.",
    options: [
      { value: 10, label: "Formal written behaviour and complaint log with documented actions." },
      { value: 5, label: "Informal notes without structured logging." },
      { value: 1, label: "No consistent documentation." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No consistent documentation.",
        report_action: "Introduce a structured and confidential reporting channel immediately. Log all behaviour concerns, even where identities cannot be disclosed, and build a documented timeline of incidents and management responses.\n\nOur premium audit service develops defensible behaviour-management systems that protect landlords while respecting tenant confidentiality.",
      },
      {
        score_level: "medium",
        reason_text: "Informal notes without structured logging.",
        report_action: "Strengthen your complaint handling by formalising logging procedures and offering a confidential communication pathway. Record patterns and management actions consistently.\n\nWe convert informal complaint handling into structured, evidential management systems.",
      },
      {
        score_level: "high",
        reason_text: "Formal written behaviour and complaint log with documented actions.",
        report_action: "Maintain disciplined complaint logging, ensure confidentiality where appropriate, and review incident histories to identify recurring patterns. Use documented records to support proportionate intervention if required.\n\nOur premium audit service integrates confidential reporting structures with defensible documentation frameworks.",
      },
    ],
  },
  {
    id: "20.1",
    category: CATEGORIES.EVIDENCE,
    section: "Fire and Accident Log & Safety Action List",
    text: "Do you maintain logs of fire safety checks and any accidents that occur?",
    critical: true,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 2.0,
    comment: "This covers comprehensive logging of all fire safety checks, accident incidents, and preventive actions taken, including weekly alarm tests, equipment maintenance, and follow-up safety improvements.",
    motivation_learning_point: "Fire safety logging is not administrative paperwork — it is life-safety evidence. In the event of a fire, serious injury, or fatality, investigators will examine whether you can prove regular checks, alarm testing, equipment maintenance, and recorded incident responses. Failure to evidence active safety management can result in prosecution, unlimited fines, and in severe cases, custodial sentences. A properly maintained fire safety and incident log demonstrates that you exercised due diligence and reasonable care.",
    options: [
      { value: 10, label: "Comprehensive fire safety and accident log with dates and actions taken." },
      { value: 5, label: "Some records kept but inconsistent." },
      { value: 1, label: "No structured logging system." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No structured logging system.",
        report_action: "Immediately introduce a formal fire safety and incident reporting register. Record every alarm test, safety check, near-miss, or fire-related incident, including actions taken and dates resolved.\n\nOur premium audit service builds legally defensible fire safety documentation systems designed to withstand enforcement and criminal investigation scrutiny.",
      },
      {
        score_level: "medium",
        reason_text: "Some records kept but inconsistent.",
        report_action: "Strengthen your fire documentation by ensuring every test, inspection, and incident is logged with follow-up confirmation. Remove gaps or inconsistencies in your records.\n\nWe convert informal fire safety practices into structured due-diligence frameworks.",
      },
      {
        score_level: "high",
        reason_text: "Comprehensive fire safety and accident log with dates and actions taken.",
        report_action: "Maintain disciplined and up-to-date fire safety logs and regularly review them to identify patterns or recurring risks. Ensure all corrective actions are recorded and closed off properly.\n\nOur premium audit service integrates fire safety tracking with broader compliance oversight to protect you from severe enforcement exposure.",
      },
    ],
  },
  {
    id: "21.1",
    category: CATEGORIES.EVIDENCE,
    section: "Condensation Prevention Procedures",
    text: "What guidance do you provide to tenants about preventing condensation and damp?",
    critical: false,
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"],
    weight: 1.0,
    comment: "This evaluates proactive measures for managing condensation and damp, including comprehensive tenant guidance, monitoring of ventilation systems, humidity control measures, and documentation of prevention efforts.",
    motivation_learning_point: "Condensation and mould management is one of the most contentious and high-risk areas in residential letting. Disputes frequently arise over whether damp is structural or lifestyle-related. Without written guidance, inspection notes, photographic evidence, and a historical room-by-room record, landlords may struggle to defend against allegations of disrepair. Maintaining a documented history of advice given, ventilation guidance, cleaning expectations, and inspection findings is critical — particularly where tenant behaviour may be contributing to condensation.",
    options: [
      { value: 10, label: "Written condensation prevention guidance issued and acknowledged." },
      { value: 5, label: "Verbal or informal advice only." },
      { value: 1, label: "No structured guidance provided." },
    ],
    score_examples: [
      {
        score_level: "low",
        reason_text: "No structured guidance provided.",
        report_action: "Immediately introduce a formal condensation management framework. Provide written ventilation and cleaning guidance, inspect affected areas, record dated photographs, and document all tenant communications. Maintain a historical file for each room where issues arise.\n\nOur premium audit service builds defensible condensation management systems that protect landlords from exaggerated or unfounded mould claims.",
      },
      {
        score_level: "medium",
        reason_text: "Verbal or informal advice only.",
        report_action: "Strengthen your current approach by formalising inspection records and maintaining a chronological history of reported issues and advice given.\n\nWe convert reactive damp responses into structured evidential protection systems.",
      },
      {
        score_level: "high",
        reason_text: "Written condensation prevention guidance issued and acknowledged.",
        report_action: "Continue maintaining detailed historical records for each room, including inspection photographs, ventilation guidance, tenant communications, and follow-up outcomes. Review recurring patterns and document corrective actions.\n\nOur premium audit service integrates mould management documentation into your broader compliance and risk-control framework.",
      },
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
