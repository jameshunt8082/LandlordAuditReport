// Database Types

export type UserRole = 'auditor' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
}

export type AuditStatus = 'pending' | 'submitted' | 'completed';
export type RiskAuditTier = 'tier_0' | 'tier_1' | 'tier_2' | 'tier_3' | 'tier_4';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ServiceType = 'online' | 'onsite';

export interface Audit {
  id: number;
  auditor_id: number | null; // Nullable for self-service audits
  token: string;
  status: AuditStatus;
  client_name: string;
  landlord_email: string | null;
  property_address: string;
  risk_audit_tier: RiskAuditTier;
  conducted_by: string;
  created_at: Date;
  submitted_at: Date | null;
  // Payment tracking fields
  payment_intent_id?: string | null;
  payment_status?: PaymentStatus | null;
  payment_amount?: number | null; // Amount in pence/cents
  service_type?: ServiceType | null;
}

export type AnswerValue = 1 | 5 | 10;

export interface FormResponse {
  id: number;
  audit_id: number;
  question_id: string;
  answer_value: AnswerValue;
  comment?: string; // Optional comment from landlord when answering
  created_at: Date;
}

export interface Score {
  id: number;
  audit_id: number;
  scores_category: string;
  score: number;
  created_at: Date;
}

export interface Note {
  id: number;
  audit_id: number;
  auditor_id: number;
  question_id: string;
  content: string;
  created_at: Date;
}

// Extended types with relations
export interface AuditWithDetails extends Audit {
  auditor?: User;
  form_responses?: FormResponse[];
  scores?: Score[];
  notes?: Note[];
}

// Request/Response types
export interface CreateAuditRequest {
  client_name: string;
  landlord_email: string;
  property_address: string;
  risk_audit_tier: RiskAuditTier;
  conducted_by: string;
}

export interface SubmitFormRequest {
  responses: {
    question_id: string;
    answer_value: AnswerValue;
  }[];
}

