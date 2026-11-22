-- SchemeConnect PostgreSQL Database Schema
-- Supabase Migration / Init

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Schemes table
CREATE TABLE IF NOT EXISTS public.schemes (
    scheme_id TEXT PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    record_type TEXT,
    government_level TEXT,
    state_or_ut TEXT,
    sector TEXT,
    implementing_authority TEXT,
    intended_beneficiaries TEXT,
    scheme_purpose TEXT,
    benefit_summary TEXT,
    benefit_amount_inr NUMERIC,
    minimum_age INTEGER,
    maximum_age INTEGER,
    maximum_annual_family_income_inr NUMERIC,
    education_requirement TEXT,
    social_category_requirement TEXT,
    residency_requirement TEXT,
    other_eligibility_conditions TEXT,
    required_documents TEXT,
    application_mode TEXT,
    official_application_url TEXT,
    opening_date TEXT,
    application_deadline TEXT,
    academic_or_financial_year TEXT,
    application_status TEXT,
    source_url TEXT,
    source_organisation TEXT,
    source_accessed_on TEXT,
    listing_evidence TEXT,
    eligibility_rule_verification TEXT,
    review_priority TEXT,
    research_notes TEXT,
    workflow_status TEXT DEFAULT 'published' CHECK (workflow_status IN ('draft', 'under_review', 'verified', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Scheme Eligibility Rules (Machine readable rules)
CREATE TABLE IF NOT EXISTS public.scheme_eligibility_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id TEXT NOT NULL REFERENCES public.schemes(scheme_id) ON DELETE CASCADE,
    criterion_type TEXT NOT NULL CHECK (criterion_type IN ('age_min', 'age_max', 'income_max', 'education', 'employment', 'state', 'social_category', 'gender', 'disability', 'other')),
    operator TEXT NOT NULL CHECK (operator IN ('gte', 'lte', 'eq', 'neq', 'in', 'contains')),
    criterion_value TEXT NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_source_url TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Scheme Documents Table
CREATE TABLE IF NOT EXISTS public.scheme_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id TEXT NOT NULL REFERENCES public.schemes(scheme_id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_type TEXT,
    is_mandatory BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Scheme Sources Table
CREATE TABLE IF NOT EXISTS public.scheme_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id TEXT NOT NULL REFERENCES public.schemes(scheme_id) ON DELETE CASCADE,
    organisation TEXT,
    url TEXT NOT NULL,
    accessed_on TEXT,
    verification_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Scheme Verification History
CREATE TABLE IF NOT EXISTS public.scheme_verification_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id TEXT NOT NULL REFERENCES public.schemes(scheme_id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT DEFAULT 'admin',
    reason TEXT,
    source_evidence_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Optional auth link
    age INTEGER,
    state TEXT,
    district TEXT,
    residence_type TEXT,
    education_level TEXT,
    employment_status TEXT,
    current_course TEXT,
    year_of_study TEXT,
    annual_income_inr NUMERIC,
    income_category TEXT,
    assistance_categories TEXT[],
    social_category TEXT,
    is_differently_abled BOOLEAN DEFAULT FALSE,
    minority_community TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Saved Schemes
CREATE TABLE IF NOT EXISTS public.saved_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    scheme_id TEXT NOT NULL REFERENCES public.schemes(scheme_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, scheme_id)
);

-- 8. Application Checklists
CREATE TABLE IF NOT EXISTS public.application_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    scheme_id TEXT NOT NULL REFERENCES public.schemes(scheme_id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'interested' CHECK (status IN ('interested', 'reviewing_requirements', 'preparing_documents', 'ready_to_apply', 'applied_externally', 'completed')),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, scheme_id)
);

-- 9. Scheme Reports (User feedback/corrections)
CREATE TABLE IF NOT EXISTS public.scheme_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_id TEXT NOT NULL REFERENCES public.schemes(scheme_id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    description TEXT NOT NULL,
    contact_email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high performance query matching
CREATE INDEX IF NOT EXISTS idx_schemes_state ON public.schemes(state_or_ut);
CREATE INDEX IF NOT EXISTS idx_schemes_gov_level ON public.schemes(government_level);
CREATE INDEX IF NOT EXISTS idx_schemes_sector ON public.schemes(sector);
CREATE INDEX IF NOT EXISTS idx_schemes_record_type ON public.schemes(record_type);
CREATE INDEX IF NOT EXISTS idx_schemes_workflow_status ON public.schemes(workflow_status);
CREATE INDEX IF NOT EXISTS idx_schemes_review_priority ON public.schemes(review_priority);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_schemes_fts ON public.schemes USING gin(to_tsvector('english', coalesce(scheme_name, '') || ' ' || coalesce(scheme_purpose, '') || ' ' || coalesce(benefit_summary, '') || ' ' || coalesce(sector, '') || ' ' || coalesce(intended_beneficiaries, '')));

-- Row Level Security (RLS) Enablement
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_reports ENABLE ROW LEVEL SECURITY;

-- Read policies: Published schemes are publicly readable
CREATE POLICY "Public read published schemes" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "Public read scheme rules" ON public.scheme_eligibility_rules FOR SELECT USING (true);
CREATE POLICY "Public read scheme documents" ON public.scheme_documents FOR SELECT USING (true);
CREATE POLICY "Public read scheme sources" ON public.scheme_sources FOR SELECT USING (true);

-- Allow all operations for anon client for project simplicity (can be customized per user)
CREATE POLICY "Allow public insert user profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public saved schemes" ON public.saved_schemes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public checklists" ON public.application_checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public scheme reports" ON public.scheme_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin scheme modifications" ON public.schemes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin scheme rules modifications" ON public.scheme_eligibility_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow admin verification history" ON public.scheme_verification_history FOR ALL USING (true) WITH CHECK (true);
