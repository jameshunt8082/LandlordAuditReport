#!/usr/bin/env python3
"""Full DB verification for questionnaire overhaul."""
import json
import urllib.request
import ssl

NEON_URL = "https://ep-icy-violet-abk4m75a-pooler.eu-west-2.aws.neon.tech/sql"
CONN_STR = "postgresql://neondb_owner:npg_Bk1QcmNKV0yS@ep-icy-violet-abk4m75a-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

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

issues = []

# 1. Check question count
print("=" * 60)
print("CHECK 1: Question count")
print("=" * 60)
res = run_sql("SELECT COUNT(*) as cnt FROM question_templates WHERE is_active = TRUE")
active_count = int(res["rows"][0]["cnt"])
res2 = run_sql("SELECT COUNT(*) as cnt FROM question_templates WHERE is_active = FALSE")
inactive_count = int(res2["rows"][0]["cnt"])
print(f"  Active: {active_count}")
print(f"  Inactive: {inactive_count}")
if active_count != 26:
    issues.append(f"Expected 26 active questions, got {active_count}")
    print(f"  [FAIL] Expected 26 active")
else:
    print(f"  [OK] 26 active questions")

# 2. Check each question has required fields
print()
print("=" * 60)
print("CHECK 2: Question fields (text, comment, motivation)")
print("=" * 60)
res = run_sql("""
    SELECT question_number, sub_category, category,
           LEFT(question_text, 80) as txt,
           is_critical, weight,
           comment IS NOT NULL AND comment != '' as has_comment,
           motivation_learning_point IS NOT NULL AND motivation_learning_point != '' as has_motivation
    FROM question_templates
    WHERE is_active = TRUE
    ORDER BY
        CASE category
            WHEN 'Documentation' THEN 1
            WHEN 'Landlord-Tenant Communication' THEN 2
            WHEN 'Evidence Gathering Systems and Procedures' THEN 3
        END,
        question_number
""")
for r in res["rows"]:
    crit = "CRIT" if r["is_critical"] else "    "
    c = "Y" if r["has_comment"] else "N"
    m = "Y" if r["has_motivation"] else "N"
    flags = ""
    if not r["has_comment"]:
        flags += " [NO COMMENT]"
        issues.append(f"Q{r['question_number']} missing comment")
    if not r["has_motivation"]:
        flags += " [NO MOTIVATION]"
        issues.append(f"Q{r['question_number']} missing motivation")
    print(f"  Q{r['question_number']:5s} | {crit} | w={r['weight']} | c={c} m={m} | {r['sub_category'][:30]:30s} | {r['txt'][:60]}{flags}")

# 3. Check answer options per question
print()
print("=" * 60)
print("CHECK 3: Answer options per question (expect 3 each)")
print("=" * 60)
res = run_sql("""
    SELECT qt.question_number, COUNT(qao.id) as opt_count
    FROM question_templates qt
    LEFT JOIN question_answer_options qao ON qt.id = qao.question_template_id
    WHERE qt.is_active = TRUE
    GROUP BY qt.question_number
    ORDER BY qt.question_number
""")
for r in res["rows"]:
    cnt = int(r["opt_count"])
    flag = "" if cnt == 3 else f" [EXPECTED 3, GOT {cnt}]"
    if flag:
        issues.append(f"Q{r['question_number']} has {cnt} options (expected 3)")
    print(f"  Q{r['question_number']:5s} | {cnt} options{flag}")

# 4. Check score examples per question
print()
print("=" * 60)
print("CHECK 4: Score examples per question (expect 3: low/medium/high)")
print("=" * 60)
res = run_sql("""
    SELECT qt.question_number,
           COUNT(qse.id) as se_count,
           STRING_AGG(qse.score_level, ',' ORDER BY qse.score_level) as levels,
           COUNT(CASE WHEN qse.report_action IS NOT NULL AND qse.report_action != '' THEN 1 END) as has_action
    FROM question_templates qt
    LEFT JOIN question_score_examples qse ON qt.id = qse.question_template_id
    WHERE qt.is_active = TRUE
    GROUP BY qt.question_number
    ORDER BY qt.question_number
""")
for r in res["rows"]:
    cnt = int(r["se_count"])
    act = int(r["has_action"])
    levels = r.get("levels", "")
    flag = ""
    if cnt != 3:
        flag += f" [EXPECTED 3, GOT {cnt}]"
        issues.append(f"Q{r['question_number']} has {cnt} score examples (expected 3)")
    if levels and levels != "high,low,medium":
        flag += f" [LEVELS: {levels}]"
    if act != 3:
        flag += f" [ONLY {act}/3 HAVE report_action]"
        issues.append(f"Q{r['question_number']} only {act}/3 score examples have report_action")
    print(f"  Q{r['question_number']:5s} | {cnt} examples | {act}/3 actions | levels={levels}{flag}")

# 5. Check sub-category consistency
print()
print("=" * 60)
print("CHECK 5: Sub-categories and question distribution")
print("=" * 60)
res = run_sql("""
    SELECT category, sub_category, COUNT(*) as cnt
    FROM question_templates
    WHERE is_active = TRUE
    GROUP BY category, sub_category
    ORDER BY category, sub_category
""")
for r in res["rows"]:
    print(f"  {r['category'][:40]:40s} | {r['sub_category'][:35]:35s} | {r['cnt']} Q(s)")

# 6. Check deactivated questions
print()
print("=" * 60)
print("CHECK 6: Deactivated (stale) questions")
print("=" * 60)
res = run_sql("""
    SELECT question_number, sub_category, LEFT(question_text, 60) as txt
    FROM question_templates
    WHERE is_active = FALSE
    ORDER BY question_number
""")
if res["rows"]:
    for r in res["rows"]:
        print(f"  Q{r['question_number']:5s} | {r['sub_category']} | {r['txt']}")
else:
    print("  None (all cleaned up)")

# Summary
print()
print("=" * 60)
if issues:
    print(f"RESULT: {len(issues)} ISSUE(S) FOUND")
    for i, issue in enumerate(issues, 1):
        print(f"  {i}. {issue}")
else:
    print("RESULT: ALL CHECKS PASSED")
print("=" * 60)
