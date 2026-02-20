#!/usr/bin/env python3
"""Seed/update questions in Neon DB via SQL-over-HTTP API."""
import json
import urllib.request
import os

NEON_URL = "https://ep-icy-violet-abk4m75a-pooler.eu-west-2.aws.neon.tech/sql"
CONN_STR = os.environ.get("POSTGRES_URL")

if not CONN_STR:
    print("ERROR: POSTGRES_URL environment variable is not set.")
    exit(1)

def run_sql(query, params=None):
    body = {"query": query}
    if params:
        body["params"] = params
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(NEON_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Neon-Connection-String", CONN_STR)
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx) as resp:
        return json.loads(resp.read())

# All 26 questions
QUESTIONS = [
    {
        "id": "1.1", "cat": "Documentation", "sec": "Certificates",
        "text": "Do you have current copies of ALL of the following for this property: Landlord's Gas Safety Certificate, Landlord's Electrical Safety Certificate (EICR), and Energy Performance Certificate (EPC)?",
        "critical": True, "weight": 2.0,
        "comment": "This covers all mandatory safety and compliance certificates including Gas Safety Certificate (annually), Electrical Installation Condition Report (EICR - every 5 years), Portable Appliance Testing (PAT) for landlord-supplied appliances, and Energy Performance Certificate (EPC) with minimum E rating.",
        "motivation": "These certificates are not administrative formalities — they are legal preconditions to lawful letting and, in some cases, to regaining possession.",
        "options": [
            {"value": 10, "label": "I hold current copies of all required certificates (Gas Safety, EICR, EPC) and have clear evidence they were properly served to the tenant."},
            {"value": 5, "label": "I hold some certificates, but one or more may be expired, missing, or I do not have clear proof they were properly served."},
            {"value": 1, "label": "I do not hold all required certificates or I am unsure of their status."},
        ],
        "scores": [
            {"level": "low", "reason": "I do not hold all required certificates or I am unsure of their status.", "action": "Immediately obtain valid and in-date Gas Safety, Electrical Safety (EICR), and EPC certificates."},
            {"level": "medium", "reason": "I hold some certificates, but one or more may be expired, missing, or I do not have clear proof they were properly served.", "action": "Conduct an immediate compliance review to confirm all certificates are current and properly evidenced as served."},
            {"level": "high", "reason": "I hold current copies of all required certificates.", "action": "Maintain strict renewal monitoring and retain clear evidence that all certificates have been properly served."},
        ],
    },
    {
        "id": "1.2", "cat": "Documentation", "sec": "Certificates",
        "text": "Do you track renewal dates for these certificates?",
        "critical": True, "weight": 2.0,
        "comment": "Covers statutory safety and energy certification requirements necessary for lawful letting and possession protection.",
        "motivation": "Compliance is continuous, not a one-time event. Allowing certificates to expire, even briefly, can create legal exposure.",
        "options": [
            {"value": 10, "label": "I actively track renewal dates using a structured system with reminders set in advance of expiry."},
            {"value": 5, "label": "I am aware of renewal dates but rely on memory, ad-hoc reminders, or reactive action."},
            {"value": 1, "label": "I do not formally track renewal dates and risk certificates expiring without notice."},
        ],
        "scores": [
            {"level": "low", "reason": "I do not formally track renewal dates.", "action": "Implement a formal compliance tracking system immediately."},
            {"level": "medium", "reason": "I am aware of renewal dates but rely on memory.", "action": "Move from informal tracking to a documented, systemised renewal process."},
            {"level": "high", "reason": "I actively track renewal dates using a structured system.", "action": "Continue maintaining structured renewal monitoring."},
        ],
    },
    {
        "id": "1.3", "cat": "Documentation", "sec": "Certificates",
        "text": "Do you give all your new tenants a copy of the latest 'How To Rent' leaflet?",
        "critical": True, "weight": 2.0,
        "comment": "Evaluates procedural strength, evidential protection, and legal defensibility.",
        "motivation": "Failure to provide the correct How To Rent guide can invalidate Section 21 proceedings. Proof of service is critical.",
        "options": [
            {"value": 10, "label": "Provided latest version with proof of service."},
            {"value": 5, "label": "Provided but no proof retained."},
            {"value": 1, "label": "Not provided or unsure."},
        ],
        "scores": [
            {"level": "low", "reason": "Not provided or unsure.", "action": "Serve the latest How To Rent guide immediately and retain proof."},
            {"level": "medium", "reason": "Provided but no proof retained.", "action": "Audit version control and service records."},
            {"level": "high", "reason": "Provided latest version with proof of service.", "action": "Maintain version monitoring and service evidence."},
        ],
    },
    {
        "id": "2.1", "cat": "Documentation", "sec": "Tenant Manuals & Documents",
        "text": "Do you provide tenants with a property manual that includes emergency numbers and troubleshooting guide?",
        "critical": False, "weight": 1.0,
        "comment": "Evaluates clarity and comprehensiveness of information provided to tenants at tenancy start.",
        "motivation": "Clear written guidance reduces disputes and liability claims.",
        "options": [
            {"value": 10, "label": "Comprehensive written property manual issued."},
            {"value": 5, "label": "Basic or informal guidance."},
            {"value": 1, "label": "No manual."},
        ],
        "scores": [
            {"level": "low", "reason": "No manual.", "action": "Issue a structured property manual immediately."},
            {"level": "medium", "reason": "Basic or informal guidance.", "action": "Formalise informal guidance into written format."},
            {"level": "high", "reason": "Comprehensive written property manual issued.", "action": "Maintain and update the manual regularly."},
        ],
    },
    {
        "id": "2.3", "cat": "Documentation", "sec": "Tenant Manuals & Documents",
        "text": "Do you get all your new tenants to sign a Property Inventory and Condition Report?",
        "critical": False, "weight": 1.0,
        "comment": "Evaluates procedural strength, evidential protection, and legal defensibility.",
        "motivation": "In deposit disputes and damage claims, the burden of proof sits with the landlord.",
        "options": [
            {"value": 10, "label": "Detailed signed photographic inventory."},
            {"value": 5, "label": "Inventory lacks detail or signature."},
            {"value": 1, "label": "No signed inventory."},
        ],
        "scores": [
            {"level": "low", "reason": "No signed inventory.", "action": "Immediately implement a detailed, room-by-room photographic inventory process."},
            {"level": "medium", "reason": "Inventory lacks detail or signature.", "action": "Upgrade your inventory documentation."},
            {"level": "high", "reason": "Detailed signed photographic inventory.", "action": "Continue maintaining high-standard photographic inventories."},
        ],
    },
    {
        "id": "3.1", "cat": "Documentation", "sec": "Council Required Documents",
        "text": "Have you formally reviewed and confirmed that this property complies with all applicable local HMO licensing and management regulations?",
        "critical": True, "weight": 2.0,
        "comment": "Assesses whether the property has the correct HMO licence for its size and location.",
        "motivation": "HMO non-compliance can result in fines, rent repayment orders, or prosecution.",
        "options": [
            {"value": 10, "label": "Fully checked and compliant with local HMO rules."},
            {"value": 5, "label": "Aware but not fully verified."},
            {"value": 1, "label": "Not checked."},
        ],
        "scores": [
            {"level": "low", "reason": "Not checked.", "action": "Confirm licensing requirements immediately."},
            {"level": "medium", "reason": "Aware but not fully verified.", "action": "Conduct structured local authority compliance review."},
            {"level": "high", "reason": "Fully checked and compliant.", "action": "Monitor regulatory updates regularly."},
        ],
    },
    {
        "id": "4.1", "cat": "Documentation", "sec": "Tenant Responsibilities",
        "text": "Do you have documented cleaning rotas and tenant responsibilities for shared areas?",
        "critical": False, "weight": 1.0,
        "comment": "Covers documentation and communication of tenant responsibilities for shared areas.",
        "motivation": "Shared space disputes escalate quickly and often trigger complaints to the local authority.",
        "options": [
            {"value": 10, "label": "Formal written cleaning rota clearly allocating responsibilities, acknowledged by tenants."},
            {"value": 5, "label": "Informal or partially written rota without clear acknowledgment."},
            {"value": 1, "label": "No structured or documented cleaning rota."},
        ],
        "scores": [
            {"level": "low", "reason": "No structured cleaning rota.", "action": "Establish a written, enforceable cleaning rota immediately."},
            {"level": "medium", "reason": "Informal rota without acknowledgment.", "action": "Formalise into a documented rota."},
            {"level": "high", "reason": "Formal written cleaning rota acknowledged by tenants.", "action": "Maintain structured cleaning rotas."},
        ],
    },
    {
        "id": "5.1", "cat": "Documentation", "sec": "Tenant Critical Information",
        "text": "Are fire escape routes clearly marked and emergency contact numbers prominently displayed?",
        "critical": True, "weight": 2.0,
        "comment": "Assesses provision and accessibility of critical safety information to tenants.",
        "motivation": "Inadequate fire signage increases liability exposure and can result in enforcement action.",
        "options": [
            {"value": 10, "label": "Clearly marked fire escape routes with prominently displayed emergency contact details."},
            {"value": 5, "label": "Basic signage but inconsistent visibility or placement."},
            {"value": 1, "label": "No clear signage or emergency contact display."},
        ],
        "scores": [
            {"level": "low", "reason": "No clear signage or emergency contact display.", "action": "Install compliant signage and display emergency contacts immediately."},
            {"level": "medium", "reason": "Basic signage but inconsistent.", "action": "Review positioning and clarity of existing signage."},
            {"level": "high", "reason": "Clearly marked fire escape routes.", "action": "Continue periodic checks of signage visibility."},
        ],
    },
    {
        "id": "6.1", "cat": "Documentation", "sec": "Fire Safety Documentation",
        "text": "Do you have a current Fire Risk Assessment and records of regular alarm testing?",
        "critical": True, "weight": 2.0,
        "comment": "Covers comprehensive fire safety documentation including current FRA and alarm testing records.",
        "motivation": "A missing or outdated Fire Risk Assessment can lead to prosecution, unlimited fines, or prohibition notices.",
        "options": [
            {"value": 10, "label": "Current Fire Risk Assessment with documented alarm testing records."},
            {"value": 5, "label": "FRA exists but outdated or testing logs inconsistent."},
            {"value": 1, "label": "No current FRA or documented alarm testing."},
        ],
        "scores": [
            {"level": "low", "reason": "No current FRA.", "action": "Commission an updated Fire Risk Assessment immediately."},
            {"level": "medium", "reason": "FRA outdated or testing logs inconsistent.", "action": "Review FRA validity and formalise alarm testing documentation."},
            {"level": "high", "reason": "Current FRA with documented testing.", "action": "Maintain scheduled reviews and documented safety testing."},
        ],
    },
    {
        "id": "7.1", "cat": "Documentation", "sec": "Landlord Alert/Reminder System",
        "text": "What system do you use to track critical compliance deadlines and certificate renewals?",
        "critical": False, "weight": 1.0,
        "comment": "Evaluates the robustness of the system used to track compliance deadlines.",
        "motivation": "Missed compliance deadlines can invalidate certificates and undermine possession rights.",
        "options": [
            {"value": 10, "label": "Formal compliance tracking system with advance reminders."},
            {"value": 5, "label": "Basic calendar reminders but no structured tracking."},
            {"value": 1, "label": "No formal deadline tracking system."},
        ],
        "scores": [
            {"level": "low", "reason": "No formal tracking.", "action": "Adopt a formal compliance tracking system immediately."},
            {"level": "medium", "reason": "Basic calendar reminders.", "action": "Upgrade to a documented tracking system."},
            {"level": "high", "reason": "Formal compliance tracking.", "action": "Maintain disciplined monitoring and review cycles."},
        ],
    },
    {
        "id": "8.1", "cat": "Documentation", "sec": "Tenant Information",
        "text": "How do you store tenant personal information and ensure GDPR compliance?",
        "critical": False, "weight": 1.0,
        "comment": "Assesses secure storage and management of tenant personal information.",
        "motivation": "Improper handling of tenant data can result in ICO penalties and fines.",
        "options": [
            {"value": 10, "label": "Secure, access-controlled storage with documented GDPR policy."},
            {"value": 5, "label": "Basic storage but no formal GDPR framework."},
            {"value": 1, "label": "Informal storage with no compliance controls."},
        ],
        "scores": [
            {"level": "low", "reason": "Informal storage.", "action": "Implement secure storage protocols immediately."},
            {"level": "medium", "reason": "Basic storage.", "action": "Formalise existing storage practices."},
            {"level": "high", "reason": "Secure storage with GDPR policy.", "action": "Maintain ongoing GDPR compliance reviews."},
        ],
    },
    {
        "id": "9.1", "cat": "Landlord-Tenant Communication", "sec": "Day-to-day Communication System",
        "text": "What is your primary method for routine communication with tenants?",
        "critical": False, "weight": 1.0,
        "comment": "Assesses the primary method for routine communication with tenants.",
        "motivation": "In disputes, undocumented communication is effectively non-existent.",
        "options": [
            {"value": 10, "label": "Primary communication channel is written and fully retained."},
            {"value": 5, "label": "Mixed written and verbal communication."},
            {"value": 1, "label": "Primarily verbal with no records retained."},
        ],
        "scores": [
            {"level": "low", "reason": "Primarily verbal.", "action": "Standardise all key communication to written channels."},
            {"level": "medium", "reason": "Mixed written and verbal.", "action": "Reduce reliance on verbal communication."},
            {"level": "high", "reason": "Written and fully retained.", "action": "Maintain disciplined written communication practices."},
        ],
    },
    {
        "id": "10.1", "cat": "Landlord-Tenant Communication", "sec": "Behaviour Reporting Procedure/System",
        "text": "How do you handle sensitive issues between tenants while respecting privacy?",
        "critical": False, "weight": 1.0,
        "comment": "Assesses the sensitivity and appropriateness of dispute-handling procedures.",
        "motivation": "Poorly managed disputes can escalate into harassment claims or enforcement scrutiny.",
        "options": [
            {"value": 10, "label": "Structured written dispute-handling procedure with documentation."},
            {"value": 5, "label": "Informal mediation with limited documentation."},
            {"value": 1, "label": "Reactive and undocumented handling."},
        ],
        "scores": [
            {"level": "low", "reason": "Reactive and undocumented.", "action": "Formalise written dispute-handling procedures."},
            {"level": "medium", "reason": "Informal mediation.", "action": "Document and standardise current practices."},
            {"level": "high", "reason": "Structured written procedure.", "action": "Maintain structured dispute documentation."},
        ],
    },
    {
        "id": "10.2", "cat": "Landlord-Tenant Communication", "sec": "Behaviour Reporting Procedure/System",
        "text": "Do you encourage tenants to record problems when they happen with evidence?",
        "critical": False, "weight": 1.0,
        "comment": "Evaluates whether tenants are encouraged to report and record problems.",
        "motivation": "Early documented evidence prevents exaggerated retrospective claims.",
        "options": [
            {"value": 10, "label": "Tenants formally instructed to submit documented evidence."},
            {"value": 5, "label": "Encouraged informally."},
            {"value": 1, "label": "No structured evidence reporting process."},
        ],
        "scores": [
            {"level": "low", "reason": "No structured reporting.", "action": "Introduce formal documented issue reporting."},
            {"level": "medium", "reason": "Encouraged informally.", "action": "Standardise how tenants submit evidence."},
            {"level": "high", "reason": "Formally instructed.", "action": "Maintain structured evidence retention."},
        ],
    },
    {
        "id": "11.1", "cat": "Landlord-Tenant Communication", "sec": "Cleanliness",
        "text": "How do you communicate cleanliness expectations and standards to tenants?",
        "critical": False, "weight": 1.0,
        "comment": "Evaluates how effectively cleanliness expectations are communicated.",
        "motivation": "Without clear written standards, landlords struggle to enforce standards fairly.",
        "options": [
            {"value": 10, "label": "Written cleanliness standards issued at tenancy start and acknowledged."},
            {"value": 5, "label": "Verbal or informal written guidance only."},
            {"value": 1, "label": "No clearly communicated standards."},
        ],
        "scores": [
            {"level": "low", "reason": "No communicated standards.", "action": "Formalise cleanliness standards immediately."},
            {"level": "medium", "reason": "Verbal or informal.", "action": "Introduce inspection logs and documented follow-up."},
            {"level": "high", "reason": "Written standards acknowledged.", "action": "Maintain written standards with routine inspections."},
        ],
    },
    {
        "id": "12.1", "cat": "Landlord-Tenant Communication", "sec": "Product Buying",
        "text": "Who is responsible for purchasing cleaning products and household supplies?",
        "critical": False, "weight": 1.0,
        "comment": "Covers clear communication of policies regarding who purchases cleaning products.",
        "motivation": "Ambiguity around who buys supplies leads to deterioration and disputes.",
        "options": [
            {"value": 10, "label": "Cleaning supply responsibility clearly defined in tenancy documentation."},
            {"value": 5, "label": "Informally agreed but not documented."},
            {"value": 1, "label": "No defined responsibility."},
        ],
        "scores": [
            {"level": "low", "reason": "No defined responsibility.", "action": "Implement a written cleaning-supply system."},
            {"level": "medium", "reason": "Informally agreed.", "action": "Formalise your arrangement in writing."},
            {"level": "high", "reason": "Clearly defined in documentation.", "action": "Maintain documented purchasing system."},
        ],
    },
    {
        "id": "13.1", "cat": "Landlord-Tenant Communication", "sec": "Rotas",
        "text": "How do you manage cleaning rotas and bin collection schedules?",
        "critical": False, "weight": 1.0,
        "comment": "Assesses the effectiveness of communication regarding various rotas.",
        "motivation": "Poorly managed rotas are a common trigger for neighbour complaints and authority scrutiny.",
        "options": [
            {"value": 10, "label": "Written rota and bin schedule acknowledged by tenants."},
            {"value": 5, "label": "Informal system without documentation."},
            {"value": 1, "label": "No structured management system."},
        ],
        "scores": [
            {"level": "low", "reason": "No structured system.", "action": "Formalise cleaning rota and bin schedule."},
            {"level": "medium", "reason": "Informal system.", "action": "Add documentation and scheduled reminders."},
            {"level": "high", "reason": "Written rota acknowledged.", "action": "Maintain structured rota."},
        ],
    },
    {
        "id": "14.1", "cat": "Evidence Gathering Systems and Procedures", "sec": "Room Inspections Log",
        "text": "How often do you inspect individual tenant rooms and what records do you keep?",
        "critical": False, "weight": 1.0,
        "comment": "Evaluates the system for conducting and recording regular inspections.",
        "motivation": "Room inspections must be handled professionally and lawfully.",
        "options": [
            {"value": 10, "label": "Scheduled room inspections with detailed written and photographic records."},
            {"value": 5, "label": "Inspections occur but limited documentation."},
            {"value": 1, "label": "Rare or undocumented inspections."},
        ],
        "scores": [
            {"level": "low", "reason": "Rare or undocumented.", "action": "Formalise a six-monthly room inspection process."},
            {"level": "medium", "reason": "Limited documentation.", "action": "Strengthen current inspection approach."},
            {"level": "high", "reason": "Scheduled inspections with records.", "action": "Continue scheduled inspections with proper notice."},
        ],
    },
    {
        "id": "15.1", "cat": "Evidence Gathering Systems and Procedures", "sec": "Room Inventory",
        "text": "Do you create detailed inventory reports at check-in and check-out with photographic evidence?",
        "critical": False, "weight": 1.5,
        "comment": "Comprehensive documentation of room condition and contents.",
        "motivation": "Without strong inventory evidence, deposit deductions are difficult to defend.",
        "options": [
            {"value": 10, "label": "Detailed photographic inventories at check-in and check-out, signed and dated."},
            {"value": 5, "label": "Inventory exists but lacks sufficient detail or photos."},
            {"value": 1, "label": "No formal inventory procedure."},
        ],
        "scores": [
            {"level": "low", "reason": "No formal inventory.", "action": "Adopt detailed photographic inventories immediately."},
            {"level": "medium", "reason": "Inventory lacks detail.", "action": "Enhance detail and photographic coverage."},
            {"level": "high", "reason": "Detailed photographic inventories.", "action": "Maintain high-standard inventory documentation."},
        ],
    },
    {
        "id": "16.1", "cat": "Evidence Gathering Systems and Procedures", "sec": "Tenant's Property Repair Logging System",
        "text": "How do tenants report maintenance issues and how do you track them?",
        "critical": False, "weight": 1.0,
        "comment": "Evaluates the system for tenants to report maintenance issues.",
        "motivation": "Maintenance reporting must be structured, logged, and actively managed.",
        "options": [
            {"value": 10, "label": "Structured written reporting system with tracked maintenance log."},
            {"value": 5, "label": "Reports accepted but no consistent tracking."},
            {"value": 1, "label": "Informal verbal reporting only."},
        ],
        "scores": [
            {"level": "low", "reason": "Informal verbal reporting.", "action": "Introduce a structured maintenance log."},
            {"level": "medium", "reason": "No consistent tracking.", "action": "Standardise repair logs."},
            {"level": "high", "reason": "Structured written system.", "action": "Continue maintaining detailed logs."},
        ],
    },
    {
        "id": "16.2", "cat": "Evidence Gathering Systems and Procedures", "sec": "Property Maintenance Log",
        "text": "Do you maintain detailed records of maintenance work from start to completion?",
        "critical": False, "weight": 1.0,
        "comment": "Detailed tracking of maintenance work from report through to completion.",
        "motivation": "Maintenance documentation must cover the full lifecycle of a repair.",
        "options": [
            {"value": 10, "label": "Full lifecycle documentation of maintenance from report to completion."},
            {"value": 5, "label": "Partial documentation."},
            {"value": 1, "label": "Minimal or no maintenance records."},
        ],
        "scores": [
            {"level": "low", "reason": "Minimal or no records.", "action": "Introduce full repair lifecycle tracking."},
            {"level": "medium", "reason": "Partial documentation.", "action": "Strengthen current documentation."},
            {"level": "high", "reason": "Full lifecycle documentation.", "action": "Continue detailed repair lifecycle documentation."},
        ],
    },
    {
        "id": "17.1", "cat": "Evidence Gathering Systems and Procedures", "sec": "Shared Spaces Inspection Log",
        "text": "How often do you inspect shared spaces like kitchens and bathrooms?",
        "critical": False, "weight": 1.0,
        "comment": "Regular inspection and documentation of shared spaces.",
        "motivation": "Shared spaces present a higher management risk in HMOs.",
        "options": [
            {"value": 10, "label": "Scheduled shared-area inspections with written and photographic records."},
            {"value": 5, "label": "Inspections occur but limited documentation."},
            {"value": 1, "label": "Rare or reactive inspections."},
        ],
        "scores": [
            {"level": "low", "reason": "Rare or reactive.", "action": "Implement a shared-space inspection schedule."},
            {"level": "medium", "reason": "Limited documentation.", "action": "Define inspection intervals."},
            {"level": "high", "reason": "Scheduled inspections with records.", "action": "Maintain consistent inspections."},
        ],
    },
    {
        "id": "18.1", "cat": "Evidence Gathering Systems and Procedures", "sec": "External Property Inspection Log",
        "text": "How often do you inspect the exterior of the property and grounds?",
        "critical": False, "weight": 1.0,
        "comment": "Regular inspection of property exterior.",
        "motivation": "Exterior maintenance is a preventative risk-control function.",
        "options": [
            {"value": 10, "label": "Regular documented exterior inspections."},
            {"value": 5, "label": "Occasional checks without formal records."},
            {"value": 1, "label": "Rare or no exterior inspections."},
        ],
        "scores": [
            {"level": "low", "reason": "Rare or no inspections.", "action": "Introduce a documented seasonal exterior inspection programme."},
            {"level": "medium", "reason": "Occasional checks.", "action": "Formalise exterior inspection timing."},
            {"level": "high", "reason": "Regular documented inspections.", "action": "Maintain preventative exterior inspection programme."},
        ],
    },
    {
        "id": "19.1", "cat": "Evidence Gathering Systems and Procedures", "sec": "Tenant Behaviour Log",
        "text": "How do you record and manage tenant behavior issues and complaints?",
        "critical": False, "weight": 1.0,
        "comment": "Evaluates the system for recording and managing tenant behavior issues.",
        "motivation": "Managing tenant behaviour in HMOs is highly sensitive.",
        "options": [
            {"value": 10, "label": "Formal written behaviour and complaint log with documented actions."},
            {"value": 5, "label": "Informal notes without structured logging."},
            {"value": 1, "label": "No consistent documentation."},
        ],
        "scores": [
            {"level": "low", "reason": "No consistent documentation.", "action": "Introduce a structured and confidential reporting channel."},
            {"level": "medium", "reason": "Informal notes.", "action": "Formalise logging procedures."},
            {"level": "high", "reason": "Formal written log.", "action": "Maintain disciplined complaint logging."},
        ],
    },
    {
        "id": "20.1", "cat": "Evidence Gathering Systems and Procedures", "sec": "Fire and Accident Log & Safety Action List",
        "text": "Do you maintain logs of fire safety checks and any accidents that occur?",
        "critical": True, "weight": 2.0,
        "comment": "Comprehensive logging of fire safety checks, accidents, and preventive actions.",
        "motivation": "Fire safety logging is not administrative paperwork — it is life-safety evidence.",
        "options": [
            {"value": 10, "label": "Comprehensive fire safety and accident log with dates and actions taken."},
            {"value": 5, "label": "Some records kept but inconsistent."},
            {"value": 1, "label": "No structured logging system."},
        ],
        "scores": [
            {"level": "low", "reason": "No structured logging.", "action": "Introduce a formal fire safety and incident register."},
            {"level": "medium", "reason": "Some records but inconsistent.", "action": "Ensure every test and incident is logged."},
            {"level": "high", "reason": "Comprehensive log with dates and actions.", "action": "Maintain up-to-date fire safety logs."},
        ],
    },
    {
        "id": "21.1", "cat": "Evidence Gathering Systems and Procedures", "sec": "Condensation Prevention Procedures",
        "text": "What guidance do you provide to tenants about preventing condensation and damp?",
        "critical": False, "weight": 1.0,
        "comment": "Proactive measures for managing condensation and damp.",
        "motivation": "Condensation and mould management is one of the most contentious areas in residential letting.",
        "options": [
            {"value": 10, "label": "Written condensation prevention guidance issued and acknowledged."},
            {"value": 5, "label": "Verbal or informal advice only."},
            {"value": 1, "label": "No structured guidance provided."},
        ],
        "scores": [
            {"level": "low", "reason": "No structured guidance.", "action": "Introduce a formal condensation management framework."},
            {"level": "medium", "reason": "Verbal or informal advice.", "action": "Formalise inspection records."},
            {"level": "high", "reason": "Written guidance issued and acknowledged.", "action": "Continue maintaining detailed historical records."},
        ],
    },
]

def main():
    print("=== Starting DB seed ===")

    # Step 1: Clean up stale/test questions not in our codebase
    valid_ids = {q["id"] for q in QUESTIONS}
    print(f"\nValid question IDs: {sorted(valid_ids)}")

    # Get existing questions
    res = run_sql("SELECT id, question_number, sub_category, is_active FROM question_templates ORDER BY question_number")
    existing = {r["question_number"]: r for r in res["rows"]}
    print(f"Existing DB questions: {sorted(existing.keys())}")

    # Deactivate questions no longer in our codebase
    stale = set(existing.keys()) - valid_ids
    if stale:
        print(f"\nDeactivating stale questions: {sorted(stale)}")
        for qn in stale:
            r = run_sql("UPDATE question_templates SET is_active = FALSE, updated_at = NOW() WHERE question_number = $1", [qn])
            print(f"  Deactivated {qn}: {r.get('rowCount', 0)} row(s)")

    # Step 2: Upsert each question
    print(f"\n=== Upserting {len(QUESTIONS)} questions ===")
    ok = 0
    fail = 0
    for q in QUESTIONS:
        try:
            tiers = json.dumps(["tier_0", "tier_1", "tier_2", "tier_3", "tier_4"])
            res = run_sql(
                """INSERT INTO question_templates (
                    category, sub_category, question_number, question_text, question_type,
                    applicable_tiers, weight, is_critical, comment, motivation_learning_point, is_active
                ) VALUES ($1, $2, $3, $4, 'multiple_choice', $5, $6, $7, $8, $9, TRUE)
                ON CONFLICT (category, question_number)
                DO UPDATE SET
                    sub_category = EXCLUDED.sub_category,
                    question_text = EXCLUDED.question_text,
                    applicable_tiers = EXCLUDED.applicable_tiers,
                    weight = EXCLUDED.weight,
                    is_critical = EXCLUDED.is_critical,
                    comment = EXCLUDED.comment,
                    motivation_learning_point = EXCLUDED.motivation_learning_point,
                    is_active = TRUE,
                    updated_at = NOW()
                RETURNING id""",
                [q["cat"], q["sec"], q["id"], q["text"], tiers, q["weight"], q["critical"], q["comment"], q["motivation"]]
            )
            template_id = res["rows"][0]["id"]

            # Delete old options and insert new
            run_sql("DELETE FROM question_answer_options WHERE question_template_id = $1", [template_id])
            for i, opt in enumerate(q["options"]):
                run_sql(
                    "INSERT INTO question_answer_options (question_template_id, option_text, score_value, option_order, is_example) VALUES ($1, $2, $3, $4, FALSE)",
                    [template_id, opt["label"], opt["value"], i + 1]
                )

            # Upsert score examples
            for sc in q["scores"]:
                run_sql(
                    """INSERT INTO question_score_examples (question_template_id, score_level, reason_text, report_action)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (question_template_id, score_level)
                    DO UPDATE SET reason_text = EXCLUDED.reason_text, report_action = EXCLUDED.report_action""",
                    [template_id, sc["level"], sc["reason"], sc["action"]]
                )

            print(f"  OK Q{q['id']}: {q['text'][:60]}...")
            ok += 1
        except Exception as e:
            print(f"  FAIL Q{q['id']}: {e}")
            fail += 1

    # Final verification
    print(f"\n=== Results: {ok} OK, {fail} failed ===")
    res = run_sql("SELECT COUNT(*) as cnt FROM question_templates WHERE is_active = TRUE")
    print(f"Active questions in DB: {res['rows'][0]['cnt']}")

    res = run_sql("SELECT question_number, sub_category, LEFT(question_text, 80) as txt FROM question_templates WHERE is_active = TRUE ORDER BY question_number")
    print("\n=== Final question list ===")
    for r in res["rows"]:
        print(f"  Q{r['question_number']} | {r['sub_category']} | {r['txt']}")

if __name__ == "__main__":
    main()
