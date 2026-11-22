export interface Scheme {
  scheme_id: string;
  scheme_name: string;
  record_type?: string;
  government_level?: string;
  state_or_ut?: string;
  sector?: string;
  implementing_authority?: string;
  intended_beneficiaries?: string;
  scheme_purpose?: string;
  benefit_summary?: string;
  benefit_amount_inr?: number;
  minimum_age?: number;
  maximum_age?: number;
  maximum_annual_family_income_inr?: number;
  education_requirement?: string;
  social_category_requirement?: string;
  residency_requirement?: string;
  other_eligibility_conditions?: string;
  required_documents?: string;
  application_mode?: string;
  official_application_url?: string;
  opening_date?: string;
  application_deadline?: string;
  academic_or_financial_year?: string;
  application_status?: string;
  source_url?: string;
  source_organisation?: string;
  source_accessed_on?: string;
  listing_evidence?: string;
  eligibility_rule_verification?: string;
  review_priority?: string;
  research_notes?: string;
  workflow_status: 'draft' | 'under_review' | 'verified' | 'published' | 'archived';
}

export type EligibilityStatus = 
  | 'Eligible based on verified criteria'
  | 'Potential match'
  | 'More information needed'
  | 'Not eligible based on verified criteria';

export interface RecommendationItem {
  scheme: Scheme;
  relevance_score: number;
  eligibility_status: EligibilityStatus;
  why_recommended: string;
  matched_profile_attributes: string[];
  verified_satisfied_conditions: string[];
  verified_failed_conditions: string[];
  unverified_conditions: string[];
  missing_information: string[];
  next_steps: string;
  source_url?: string;
  official_application_url?: string;
}

export interface RecommendationResponse {
  total_opportunities: number;
  verified_eligible_count: number;
  potential_match_count: number;
  more_info_needed_count: number;
  not_eligible_count: number;
  recommendations: RecommendationItem[];
  user_summary: Record<string, any>;
}

export interface UserProfile {
  age?: number;
  state: string;
  district?: string;
  residence_type?: string;
  education_level?: string;
  employment_status?: string;
  current_course?: string;
  year_of_study?: string;
  academic_marks_percent?: number;
  annual_income_inr?: number;
  income_category?: string;
  assistance_categories: string[];
  social_category?: string;
  is_differently_abled?: boolean;
  minority_community?: string;
  institution_type?: string;
  business_stage?: string;
  farming_type?: string;
  extra_attributes?: Record<string, any>;
}

export interface QuestionOption {
  label: string;
  value: string;
  description?: string;
}

export interface QuestionItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'select' | 'multiselect' | 'number' | 'text' | 'radio';
  options?: QuestionOption[];
  required: boolean;
  category: string;
  explanation?: string;
}

export interface DynamicQuestionResponse {
  step: number;
  total_steps: number;
  questions: QuestionItem[];
  progress_percentage: number;
}

export interface SourceCitation {
  scheme_id: string;
  scheme_name: string;
  source_url?: string;
  official_application_url?: string;
  authority?: string;
}

export interface AIChatResponse {
  reply: string;
  language: string;
  citations: SourceCitation[];
  missing_information: string[];
  is_grounded: boolean;
}

export interface SavedSchemeItem {
  id: string;
  user_id: string;
  scheme_id: string;
  created_at: string;
  schemes: Scheme;
}

export interface ChecklistItem {
  id: string;
  user_id: string;
  scheme_id: string;
  status: 'interested' | 'reviewing_requirements' | 'preparing_documents' | 'ready_to_apply' | 'applied_externally' | 'completed';
  notes?: string;
  updated_at: string;
  schemes: Scheme;
}

export interface AdminStats {
  total_schemes: number;
  published_count: number;
  verified_count: number;
  under_review_count: number;
  draft_count: number;
  pending_reports_count: number;
}
