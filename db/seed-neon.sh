#!/bin/bash
# Seed questions to Neon DB via SQL-over-HTTP API
# This bypasses the broken node_modules issue

NEON_URL="https://ep-icy-violet-abk4m75a-pooler.eu-west-2.aws.neon.tech/sql"
CONN_STR="${POSTGRES_URL}"

if [ -z "$CONN_STR" ]; then
  echo "ERROR: POSTGRES_URL environment variable is not set."
  exit 1
fi
  local sql="$1"
  curl -s "$NEON_URL" \
    -H "Neon-Connection-String: $CONN_STR" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$sql\"}"
}

echo "=== Starting DB seed ==="

# First, cleanup test/junk questions
echo ""
echo "--- Cleaning up test questions ---"
run_sql "DELETE FROM question_templates WHERE question_number = '21.2' AND question_text LIKE '%Test question%'"
echo ""
run_sql "DELETE FROM question_templates WHERE question_number = '8.2' AND question_text LIKE '%test question%'"
echo ""
run_sql "DELETE FROM question_templates WHERE question_number = '1.8'"
echo ""

echo ""
echo "--- Count after cleanup ---"
run_sql "SELECT COUNT(*) as cnt FROM question_templates"
echo ""

# Now update each question
echo ""
echo "=== Updating Q1.1 ==="
run_sql "UPDATE question_templates SET question_text = 'Do you have current copies of ALL of the following for this property: Landlord''s Gas Safety Certificate, Landlord''s Electrical Safety Certificate (EICR), and Energy Performance Certificate (EPC)?', comment = 'This covers all mandatory safety and compliance certificates including Gas Safety Certificate (annually), Electrical Installation Condition Report (EICR - every 5 years), Portable Appliance Testing (PAT) for landlord-supplied appliances, and Energy Performance Certificate (EPC) with minimum E rating. All certificates must be current, readily accessible, and have a clear system for tracking renewal dates.', motivation_learning_point = 'These certificates are not administrative formalities — they are legal preconditions to lawful letting and, in some cases, to regaining possession. In England, failure to obtain or properly serve certain compliance documents can invalidate a Section 21 notice and significantly weaken your position in disputes. If you cannot prove compliance, you are exposed.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '1.1' AND category = 'Documentation'"
echo ""

echo "=== Updating Q1.2 ==="
run_sql "UPDATE question_templates SET question_text = 'Do you track renewal dates for these certificates?', comment = 'Covers statutory safety and energy certification requirements necessary for lawful letting and possession protection.', motivation_learning_point = 'Compliance is continuous, not a one-time event. Allowing certificates to expire, even briefly, can create legal exposure, invalidate possession proceedings, and expose you to enforcement action. A single lapse can undermine an otherwise strong legal position.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '1.2' AND category = 'Documentation'"
echo ""

echo "=== Updating Q1.3 ==="
run_sql "UPDATE question_templates SET question_text = 'Do you give all your new tenants a copy of the latest ''How To Rent'' leaflet?', comment = 'Evaluates procedural strength, evidential protection, and legal defensibility.', motivation_learning_point = 'Failure to provide the correct ''How To Rent'' guide can invalidate Section 21 proceedings. Proof of service is critical.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '1.3' AND category = 'Documentation'"
echo ""

echo "=== Updating Q2.1 ==="
run_sql "UPDATE question_templates SET question_text = 'Do you provide tenants with a property manual that includes emergency numbers and troubleshooting guide that shows tenants what to do in the event of problems such as loss of heating, water, internet etc.?', comment = 'This evaluates the clarity and comprehensiveness of information provided to tenants at tenancy start, including the government How to Rent guide, detailed property manual covering safety procedures, emergency contacts, maintenance reporting instructions, and shared space rules.', motivation_learning_point = 'Clear written guidance reduces disputes and liability claims.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '2.1' AND category = 'Documentation'"
echo ""

echo "=== Inserting Q2.3 (if not exists) ==="
run_sql "INSERT INTO question_templates (category, sub_category, question_number, question_text, question_type, applicable_tiers, weight, is_critical, comment, motivation_learning_point, is_active) VALUES ('Documentation', 'Tenant Manuals & Documents', '2.3', 'Do you get all your new tenants to sign a Property Inventory and Condition Report?', 'multiple_choice', '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', 1.0, FALSE, 'Evaluates procedural strength, evidential protection, and legal defensibility.', 'In deposit disputes and damage claims, the burden of proof sits with the landlord. Without a detailed, signed, and dated inventory supported by photographic evidence, you will struggle to prove the original condition of the property. An unsigned or vague inventory can render legitimate claims unenforceable.', TRUE) ON CONFLICT (category, question_number) DO UPDATE SET question_text = EXCLUDED.question_text, comment = EXCLUDED.comment, motivation_learning_point = EXCLUDED.motivation_learning_point, applicable_tiers = EXCLUDED.applicable_tiers, updated_at = NOW()"
echo ""

echo "=== Updating Q3.1 ==="
run_sql "UPDATE question_templates SET question_text = 'Have you formally reviewed and confirmed that this property complies with all applicable local HMO licensing and management regulations in your area?', comment = 'This assesses whether the property has the correct HMO licence for its size and location (mandatory, additional, or selective licensing).', motivation_learning_point = 'HMO non-compliance can result in fines, rent repayment orders, or prosecution.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '3.1' AND category = 'Documentation'"
echo ""

echo "=== Updating Q4.1 ==="
run_sql "UPDATE question_templates SET question_text = 'Do you have documented cleaning rotas and tenant responsibilities for shared areas?', comment = 'This covers the documentation and communication of tenant responsibilities for maintaining shared areas and following house procedures.', motivation_learning_point = 'Shared space disputes escalate quickly and often trigger complaints to the local authority.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '4.1' AND category = 'Documentation'"
echo ""

echo "=== Updating Q5.1 ==="
run_sql "UPDATE question_templates SET question_text = 'Are fire escape routes clearly marked and emergency contact numbers prominently displayed?', comment = 'This assesses the provision and accessibility of critical safety information to tenants.', motivation_learning_point = 'Inadequate fire signage increases liability exposure and can result in enforcement action or insurance complications after an incident.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '5.1' AND category = 'Documentation'"
echo ""

echo "=== Updating Q6.1 ==="
run_sql "UPDATE question_templates SET question_text = 'Do you have a current Fire Risk Assessment and records of regular alarm testing?', comment = 'This covers comprehensive fire safety documentation including current Fire Risk Assessment (FRA), records of regular alarm testing.', motivation_learning_point = 'A missing or outdated Fire Risk Assessment can lead to prosecution, unlimited fines, or prohibition notices.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '6.1' AND category = 'Documentation'"
echo ""

echo "=== Updating Q7.1 ==="
run_sql "UPDATE question_templates SET question_text = 'What system do you use to track critical compliance deadlines and certificate renewals?', comment = 'This evaluates the robustness of the system used to track and manage critical compliance deadlines.', motivation_learning_point = 'Missed compliance deadlines can invalidate certificates, expose you to enforcement action, and undermine possession rights.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '7.1' AND category = 'Documentation'"
echo ""

echo "=== Updating Q8.1 ==="
run_sql "UPDATE question_templates SET question_text = 'How do you store tenant personal information and ensure GDPR compliance?', comment = 'This assesses the secure storage and management of tenants personal information in compliance with GDPR.', motivation_learning_point = 'Improper handling of tenant data can result in ICO penalties, fines, and reputational damage.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '8.1' AND category = 'Documentation'"
echo ""

echo "=== Updating Q9.1 ==="
run_sql "UPDATE question_templates SET question_text = 'What is your primary method for routine communication with tenants?', comment = 'This assesses the primary method for routine communication with tenants.', motivation_learning_point = 'In disputes, undocumented communication is effectively non-existent.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '9.1' AND category = 'Landlord-Tenant Communication'"
echo ""

echo "=== Updating Q10.1 ==="
run_sql "UPDATE question_templates SET question_text = 'How do you handle sensitive issues between tenants while respecting privacy?', comment = 'This assesses the sensitivity and appropriateness of procedures for handling delicate tenant issues.', motivation_learning_point = 'Poorly managed disputes can escalate into harassment claims or enforcement scrutiny.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '10.1' AND category = 'Landlord-Tenant Communication'"
echo ""

echo "=== Updating Q10.2 ==="
run_sql "UPDATE question_templates SET question_text = 'Do you encourage tenants to record problems when they happen with evidence?', comment = 'This evaluates whether the landlord encourages and facilitates tenants to report and record problems.', motivation_learning_point = 'Early documented evidence prevents exaggerated retrospective claims.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '10.2' AND category = 'Landlord-Tenant Communication'"
echo ""

echo "=== Updating Q11.1 ==="
run_sql "UPDATE question_templates SET question_text = 'How do you communicate cleanliness expectations and standards to tenants?', comment = 'This evaluates how effectively the landlord communicates cleanliness expectations.', motivation_learning_point = 'Without clear written standards, inspection records, and documented follow-up, landlords struggle to enforce standards fairly and consistently.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '11.1' AND category = 'Landlord-Tenant Communication'"
echo ""

echo "=== Updating Q12.1 ==="
run_sql "UPDATE question_templates SET question_text = 'Who is responsible for purchasing cleaning products and household supplies?', comment = 'This covers the clear communication of policies regarding who purchases cleaning products.', motivation_learning_point = 'Ambiguity around who buys supplies often leads to deterioration in shared areas and disputes between tenants.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '12.1' AND category = 'Landlord-Tenant Communication'"
echo ""

echo "=== Updating Q13.1 ==="
run_sql "UPDATE question_templates SET question_text = 'How do you manage cleaning rotas and bin collection schedules?', comment = 'This assesses the effectiveness of communication regarding various rotas.', motivation_learning_point = 'Poorly managed cleaning rotas and bin schedules are a common trigger for neighbour complaints and local authority scrutiny.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '13.1' AND category = 'Landlord-Tenant Communication'"
echo ""

echo "=== Updating Q14.1 ==="
run_sql "UPDATE question_templates SET question_text = 'How often do you inspect individual tenant rooms and what records do you keep?', comment = 'This evaluates the system for conducting and recording regular inspections.', motivation_learning_point = 'Room inspections are an essential management control tool, but they must be handled professionally and lawfully.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '14.1' AND category = 'Evidence Gathering Systems and Procedures'"
echo ""

echo "=== Updating Q15.1 ==="
run_sql "UPDATE question_templates SET question_text = 'Do you create detailed inventory reports at check-in and check-out with photographic evidence?', comment = 'Comprehensive documentation of room condition and contents.', motivation_learning_point = 'Without strong inventory evidence, deposit deductions are difficult to defend.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '15.1' AND category = 'Evidence Gathering Systems and Procedures'"
echo ""

echo "=== Updating Q16.1 ==="
run_sql "UPDATE question_templates SET sub_category = 'Tenant''s Property Repair Logging System', question_text = 'How do tenants report maintenance issues and how do you track them?', comment = 'Evaluates the system for tenants to report maintenance issues.', motivation_learning_point = 'Maintenance reporting must be structured, logged, and actively managed.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '16.1' AND category = 'Evidence Gathering Systems and Procedures'"
echo ""

echo "=== Updating Q16.2 ==="
run_sql "UPDATE question_templates SET question_text = 'Do you maintain detailed records of maintenance work from start to completion?', comment = 'Detailed tracking of maintenance work from initial report through to completion.', motivation_learning_point = 'Maintenance documentation must cover the full lifecycle of a repair.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '16.2' AND category = 'Evidence Gathering Systems and Procedures'"
echo ""

echo "=== Updating Q17.1 ==="
run_sql "UPDATE question_templates SET question_text = 'How often do you inspect shared spaces like kitchens and bathrooms?', comment = 'Regular inspection and documentation of shared spaces.', motivation_learning_point = 'Shared spaces present a higher management risk in HMOs.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '17.1' AND category = 'Evidence Gathering Systems and Procedures'"
echo ""

echo "=== Updating Q18.1 ==="
run_sql "UPDATE question_templates SET question_text = 'How often do you inspect the exterior of the property and grounds?', comment = 'Regular inspection of property exterior.', motivation_learning_point = 'Exterior maintenance is a preventative risk-control function, not just a cosmetic issue.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '18.1' AND category = 'Evidence Gathering Systems and Procedures'"
echo ""

echo "=== Updating Q19.1 ==="
run_sql "UPDATE question_templates SET question_text = 'How do you record and manage tenant behavior issues and complaints?', comment = 'Evaluates the confidential system for recording and managing tenant behavior issues.', motivation_learning_point = 'Managing tenant behaviour and complaints in HMOs is highly sensitive.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '19.1' AND category = 'Evidence Gathering Systems and Procedures'"
echo ""

echo "=== Updating Q20.1 ==="
run_sql "UPDATE question_templates SET question_text = 'Do you maintain logs of fire safety checks and any accidents that occur?', comment = 'Comprehensive logging of all fire safety checks, accident incidents, and preventive actions.', motivation_learning_point = 'Fire safety logging is not administrative paperwork — it is life-safety evidence.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '20.1' AND category = 'Evidence Gathering Systems and Procedures'"
echo ""

echo "=== Updating Q21.1 ==="
run_sql "UPDATE question_templates SET question_text = 'What guidance do you provide to tenants about preventing condensation and damp?', comment = 'Proactive measures for managing condensation and damp.', motivation_learning_point = 'Condensation and mould management is one of the most contentious and high-risk areas in residential letting.', applicable_tiers = '[\"tier_0\",\"tier_1\",\"tier_2\",\"tier_3\",\"tier_4\"]', updated_at = NOW() WHERE question_number = '21.1' AND category = 'Evidence Gathering Systems and Procedures'"
echo ""

echo ""
echo "=== Final count ==="
run_sql "SELECT COUNT(*) as cnt FROM question_templates WHERE is_active = TRUE"
echo ""

echo ""
echo "=== All questions after update ==="
run_sql "SELECT question_number, sub_category, LEFT(question_text, 80) as txt FROM question_templates WHERE is_active = TRUE ORDER BY question_number"
echo ""

echo "=== DONE ==="
