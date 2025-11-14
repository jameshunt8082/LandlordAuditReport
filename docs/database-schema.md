# Database Schema Documentation

## Overview

**Total Tables:** 8  
**Total Indexes:** 12+  
**Database:** PostgreSQL (Vercel Postgres)

---

## Tables

### 1. `users`
**Purpose:** Stores auditor/administrator user accounts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | **PRIMARY KEY** | Auto-incrementing user ID |
| `name` | `VARCHAR(255)` | `NOT NULL` | User's full name |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL` | User's email address |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Hashed password (bcrypt) |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Account creation timestamp |

**Indexes:**
- Primary key index on `id`
- Unique index on `email`

---

### 2. `audits`
**Purpose:** Stores audit instances created by auditors

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | **PRIMARY KEY** | Auto-incrementing audit ID |
| `auditor_id` | `INTEGER` | `NOT NULL`, **FK → `users(id)`** `ON DELETE CASCADE` | Creator of the audit |
| `token` | `VARCHAR(255)` | `UNIQUE NOT NULL` | Unique token for public access URL |
| `status` | `VARCHAR(50)` | `DEFAULT 'pending'`, `CHECK IN ('pending', 'submitted', 'completed')` | Audit workflow status |
| `client_name` | `VARCHAR(255)` | `NOT NULL` | Landlord/client name |
| `landlord_email` | `VARCHAR(255)` | `NULL` | Landlord's email (required) |
| `property_address` | `TEXT` | `NOT NULL` | Property address |
| `risk_audit_tier` | `VARCHAR(10)` | `NOT NULL`, `CHECK IN ('tier_0', 'tier_1', 'tier_2', 'tier_3', 'tier_4')` | Risk assessment tier |
| `conducted_by` | `VARCHAR(255)` | `NOT NULL` | Auditor name conducting the audit |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Audit creation timestamp |
| `submitted_at` | `TIMESTAMP` | `NULL` | When landlord submitted responses |

**Foreign Keys:**
- `auditor_id` → `users(id)` (CASCADE DELETE)

**Indexes:**
- Primary key index on `id`
- Unique index on `token`
- `idx_audits_created_at` on `created_at DESC`

---

### 3. `form_responses`
**Purpose:** Stores landlord's answers to questions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | **PRIMARY KEY** | Auto-incrementing response ID |
| `audit_id` | `INTEGER` | `NOT NULL`, **FK → `audits(id)`** `ON DELETE CASCADE` | Associated audit |
| `question_id` | `VARCHAR(50)` | `NOT NULL` | Question identifier (e.g., "1.1", "2.5") |
| `answer_value` | `INTEGER` | `NOT NULL`, `CHECK IN (1, 5, 10)` | Answer score (1=low, 5=medium, 10=high) |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Response timestamp |

**Foreign Keys:**
- `audit_id` → `audits(id)` (CASCADE DELETE)

**Unique Constraints:**
- `UNIQUE (audit_id, question_id)` - One answer per question per audit

**Indexes:**
- Primary key index on `id`
- `idx_form_responses_question_id` on `question_id`

---

### 4. `scores`
**Purpose:** Stores calculated category scores

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | **PRIMARY KEY** | Auto-incrementing score ID |
| `audit_id` | `INTEGER` | `NOT NULL`, **FK → `audits(id)`** `ON DELETE CASCADE` | Associated audit |
| `scores_category` | `VARCHAR(100)` | `NOT NULL` | Category name (Documentation, Communication, Evidence) |
| `score` | `DECIMAL(4, 2)` | `NOT NULL`, `CHECK (score >= 1.0 AND score <= 10.0)` | Calculated category score |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Score calculation timestamp |

**Foreign Keys:**
- `audit_id` → `audits(id)` (CASCADE DELETE)

**Unique Constraints:**
- `UNIQUE (audit_id, scores_category)` - One score per category per audit

**Indexes:**
- Primary key index on `id`
- `idx_scores_category` on `scores_category`

---

### 5. `notes`
**Purpose:** Stores auditor comments/notes on specific questions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | **PRIMARY KEY** | Auto-incrementing note ID |
| `audit_id` | `INTEGER` | `NOT NULL`, **FK → `audits(id)`** `ON DELETE CASCADE` | Associated audit |
| `auditor_id` | `INTEGER` | `NOT NULL`, **FK → `users(id)`** `ON DELETE CASCADE` | Note author |
| `question_id` | `VARCHAR(50)` | `NOT NULL` | Question reference (required) |
| `content` | `TEXT` | `NOT NULL` | Note content |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Note creation timestamp |

**Foreign Keys:**
- `audit_id` → `audits(id)` (CASCADE DELETE)
- `auditor_id` → `users(id)` (CASCADE DELETE)

**Indexes:**
- Primary key index on `id`

---

### 6. `question_templates`
**Purpose:** Stores question definitions managed by admins

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | **PRIMARY KEY** | Auto-incrementing question template ID |
| `category` | `VARCHAR(100)` | `NOT NULL` | Question category |
| `sub_category` | `VARCHAR(100)` | `NOT NULL` | Question subcategory |
| `question_number` | `VARCHAR(50)` | `NOT NULL` | Question identifier (e.g., "1.1") |
| `question_text` | `TEXT` | `NOT NULL` | Question text |
| `question_type` | `VARCHAR(20)` | `NOT NULL`, `CHECK IN ('yes_no', 'multiple_choice')` | Question type |
| `applicable_tiers` | `JSONB` | `NOT NULL DEFAULT '[]'` | Array of applicable tiers (e.g., ["tier_1", "tier_2"]) |
| `weight` | `DECIMAL(3, 1)` | `NOT NULL`, `CHECK (weight >= 0.5 AND weight <= 2.0)` | Question weight for scoring |
| `is_critical` | `BOOLEAN` | `DEFAULT FALSE` | Statutory requirement flag (2x weight) |
| `motivation_learning_point` | `TEXT` | `NULL` | Educational context for the question |
| `created_by_auditor_id` | `INTEGER` | `NULL`, **FK → `users(id)`** `ON DELETE SET NULL` | Creator (if created by admin) |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Question creation timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Last update timestamp |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Whether question is active/enabled |

**Foreign Keys:**
- `created_by_auditor_id` → `users(id)` (SET NULL on delete)

**Unique Constraints:**
- `UNIQUE (category, question_number)` - Unique question per category

**Indexes:**
- Primary key index on `id`
- `idx_question_templates_category` on `category`
- `idx_question_templates_active` on `is_active`
- `idx_question_templates_tiers` on `applicable_tiers` (GIN index for JSONB)
- `idx_questions_active_category` partial index on `(is_active, category) WHERE is_active = TRUE`

---

### 7. `question_answer_options`
**Purpose:** Stores answer options for questions (Yes/No or multiple choice)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | **PRIMARY KEY** | Auto-incrementing option ID |
| `question_template_id` | `INTEGER` | `NOT NULL`, **FK → `question_templates(id)`** `ON DELETE CASCADE` | Parent question |
| `option_text` | `TEXT` | `NOT NULL` | Answer option text |
| `score_value` | `INTEGER` | `NOT NULL`, `CHECK (score_value >= 1 AND score_value <= 10)` | Score for this option (1, 5, or 10) |
| `option_order` | `INTEGER` | `NOT NULL DEFAULT 0`, `CHECK (option_order > 0)` | Display order |
| `is_example` | `BOOLEAN` | `DEFAULT FALSE` | Whether this is an example (excluded from form) |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Option creation timestamp |

**Foreign Keys:**
- `question_template_id` → `question_templates(id)` (CASCADE DELETE)

**Unique Constraints:**
- `uq_question_option_text` - `UNIQUE (question_template_id, option_text)` - No duplicate options per question
- `uq_question_option_order` - `UNIQUE (question_template_id, option_order)` - Unique order per question

**Check Constraints:**
- `chk_option_order_positive` - `CHECK (option_order > 0)` - Order must be positive

**Indexes:**
- Primary key index on `id`
- `idx_question_answer_options_template` on `question_template_id`
- `idx_question_options_lookup` composite index on `(question_template_id, option_order, is_example)`

---

### 8. `question_score_examples`
**Purpose:** Stores scoring guidance and recommendations for questions (from Edit Questions UI)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | **PRIMARY KEY** | Auto-incrementing example ID |
| `question_template_id` | `INTEGER` | `NOT NULL`, **FK → `question_templates(id)`** `ON DELETE CASCADE` | Parent question |
| `score_level` | `VARCHAR(20)` | `NOT NULL`, `CHECK IN ('low', 'medium', 'high')` | Score level (maps to 1, 5, 10) |
| `reason_text` | `TEXT` | `NOT NULL` | Reason for this score level |
| `report_action` | `TEXT` | `NULL` | Recommended action for this score level |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Example creation timestamp |

**Foreign Keys:**
- `question_template_id` → `question_templates(id)` (CASCADE DELETE)

**Unique Constraints:**
- `UNIQUE (question_template_id, score_level)` - One example per score level per question

**Indexes:**
- Primary key index on `id`
- `idx_question_score_examples_template` on `question_template_id`
- `idx_score_examples_question` composite index on `(question_template_id, score_level)`

---

## Entity Relationship Diagram

```
users (1) ──────< (N) audits
  │                  │
  │                  ├──< (N) form_responses
  │                  ├──< (N) scores
  │                  └──< (N) notes
  │
  └──< (N) question_templates (created_by_auditor_id)
          │
          ├──< (N) question_answer_options
          │
          └──< (N) question_score_examples
```

---

## Relationships Summary

### Foreign Key Relationships

| From Table | To Table | Column | On Delete | Type |
|------------|----------|--------|-----------|------|
| `audits` | `users` | `auditor_id` | CASCADE | Many-to-One |
| `form_responses` | `audits` | `audit_id` | CASCADE | Many-to-One |
| `scores` | `audits` | `audit_id` | CASCADE | Many-to-One |
| `notes` | `audits` | `audit_id` | CASCADE | Many-to-One |
| `notes` | `users` | `auditor_id` | CASCADE | Many-to-One |
| `question_templates` | `users` | `created_by_auditor_id` | SET NULL | Many-to-One (optional) |
| `question_answer_options` | `question_templates` | `question_template_id` | CASCADE | Many-to-One |
| `question_score_examples` | `question_templates` | `question_template_id` | CASCADE | Many-to-One |

### Cascade Delete Behavior

- **CASCADE:** When parent is deleted, all children are deleted
  - Deleting a `user` → deletes all their `audits` → deletes all `form_responses`, `scores`, `notes` for those audits
  - Deleting an `audit` → deletes all `form_responses`, `scores`, `notes` for that audit
  - Deleting a `question_template` → deletes all `question_answer_options` and `question_score_examples`

- **SET NULL:** When parent is deleted, child reference is set to NULL
  - Deleting a `user` → sets `question_templates.created_by_auditor_id` to NULL

---

## Key Constraints

### Check Constraints

| Table | Constraint | Description |
|-------|------------|-------------|
| `audits` | `status IN ('pending', 'submitted', 'completed')` | Valid status values |
| `audits` | `risk_audit_tier IN ('tier_0', 'tier_1', 'tier_2', 'tier_3', 'tier_4')` | Valid tier values |
| `form_responses` | `answer_value IN (1, 5, 10)` | Valid answer scores |
| `scores` | `score >= 1.0 AND score <= 10.0` | Valid score range |
| `question_templates` | `question_type IN ('yes_no', 'multiple_choice')` | Valid question types |
| `question_templates` | `weight >= 0.5 AND weight <= 2.0` | Valid weight range |
| `question_answer_options` | `score_value >= 1 AND score_value <= 10` | Valid option scores |
| `question_answer_options` | `option_order > 0` | Positive order values |
| `question_score_examples` | `score_level IN ('low', 'medium', 'high')` | Valid score levels |

### Unique Constraints

| Table | Constraint | Columns |
|-------|------------|---------|
| `users` | Primary key + unique email | `id`, `email` |
| `audits` | Primary key + unique token | `id`, `token` |
| `form_responses` | Unique answer per audit/question | `(audit_id, question_id)` |
| `scores` | Unique score per audit/category | `(audit_id, scores_category)` |
| `question_templates` | Unique question per category | `(category, question_number)` |
| `question_answer_options` | Unique option text per question | `(question_template_id, option_text)` |
| `question_answer_options` | Unique order per question | `(question_template_id, option_order)` |
| `question_score_examples` | Unique example per question/score | `(question_template_id, score_level)` |

---

## Indexes Summary

| Index Name | Table | Columns | Type | Purpose |
|------------|-------|---------|------|---------|
| Primary keys | All tables | `id` | B-tree | Fast PK lookups |
| `idx_audits_created_at` | `audits` | `created_at DESC` | B-tree | Sort by date |
| `idx_form_responses_question_id` | `form_responses` | `question_id` | B-tree | Find responses by question |
| `idx_scores_category` | `scores` | `scores_category` | B-tree | Group by category |
| `idx_question_templates_category` | `question_templates` | `category` | B-tree | Filter by category |
| `idx_question_templates_active` | `question_templates` | `is_active` | B-tree | Filter active questions |
| `idx_question_templates_tiers` | `question_templates` | `applicable_tiers` | GIN | JSONB array search |
| `idx_questions_active_category` | `question_templates` | `(is_active, category)` | B-tree (partial) | Optimize active queries |
| `idx_question_answer_options_template` | `question_answer_options` | `question_template_id` | B-tree | Find options by question |
| `idx_question_options_lookup` | `question_answer_options` | `(question_template_id, option_order, is_example)` | B-tree | Fast option lookup |
| `idx_question_score_examples_template` | `question_score_examples` | `question_template_id` | B-tree | Find examples by question |
| `idx_score_examples_question` | `question_score_examples` | `(question_template_id, score_level)` | B-tree | Fast example lookup |
| `idx_notes_question_id` | `notes` | `question_id` | B-tree | Find notes by question |
| `idx_notes_audit_question` | `notes` | `(audit_id, question_id)` | B-tree | Fast note lookup by audit and question |

---

## Data Flow

### Question Management (Admin)
1. Admin creates/edits question in `question_templates`
2. Admin adds answer options in `question_answer_options`
3. Admin adds scoring guidance in `question_score_examples` with `reason_text` and `report_action` for each score level (low, medium, high)

### Audit Flow
1. Auditor creates `audit` record → generates unique `token`
2. Landlord accesses form via token → sees questions from `question_templates` (filtered by tier)
3. Landlord submits answers → stored in `form_responses`
4. System calculates scores → stored in `scores`
5. PDF generation uses `question_score_examples` with `reason_text` and `report_action` for each score level

---

## Migration History

1. **Initial Schema** (`db/schema.sql`)
   - Created: `users`, `audits`, `form_responses`, `scores`, `notes`

2. **Questions System** (`db/schema-questions.sql`)
   - Added: `question_templates`, `question_answer_options`, `question_score_examples`

3. **Report Columns** (`db/add-report-action-columns.ts`) - **REMOVED**
   - Previously added CSV fallback columns, but removed in favor of `question_score_examples` table

4. **Remove CSV Columns** (`db/migrate-remove-csv-fallback-columns.ts`)
   - Removed CSV fallback columns: `red_score_example`, `orange_score_example`, `report_action`
   - All data now comes from `question_score_examples` table

5. **Constraints** (`db/add-constraints.ts`)
   - Added unique constraints on `question_answer_options`
   - Added check constraints
   - Added performance indexes

---

## Notes

- All tables use `SERIAL` for auto-incrementing IDs
- All timestamps use `TIMESTAMP DEFAULT NOW()`
- JSONB used for `applicable_tiers` to allow array queries
- CASCADE deletes ensure referential integrity
- Partial indexes optimize common queries (active questions only)
- GIN index on JSONB enables fast array containment queries

