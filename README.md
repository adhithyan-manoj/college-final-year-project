# SchemeConnect — AI-Powered Government Scheme & Scholarship Discovery Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![Backend](https://img.shields.io/badge/Backend-Python%20FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript%20%2B%20Vite-61DAFB?logo=react)](https://vitejs.dev)

A full-stack, production-grade public service discovery platform built as a **BCA Final Year Project**. **SchemeConnect** empowers Indian citizens, students, farmers, job seekers, and entrepreneurs to discover legitimate central and state government schemes, educational scholarships, and financial assistance with **deterministic rule-based eligibility evaluation** and **grounded explainable AI**.

---

## 🌟 Core System Highlights

1. **Authentic Official Dataset Integration:**
   - Pre-loaded with **251 official government scheme and scholarship records** (`india_official_government_schemes_200plus.csv` / `.json`).
   - 32 normalized attributes per scheme covering implementing authorities, financial benefits, deadlines, eligibility requirements, and official portal links.
   - Preserves unknown values strictly as `NULL` (no fake eligibility limits or synthetic deadlines).

2. **Deterministic Recommendation & Eligibility Engine:**
   - **Relevance Ranking (0–100%):** Measures topic, sector, beneficiary, and geographic alignment with user search interests.
   - **Deterministic Eligibility Evaluation:** Evaluates verified statutory requirements into four clear statuses:
     - 🛡️ **Eligible based on verified criteria:** All mandatory verified rules satisfied.
     - ⚠️ **Potential match (Needs verification):** Scheme is relevant, but official detailed requirements need verification.
     - ℹ️ **More information needed:** Verified conditions exist, but user profile input is missing.
     - ❌ **Not eligible based on verified criteria:** Verified mandatory condition is not satisfied.

3. **Dynamic Step-by-Step Questionnaire:**
   - Progressive disclosure: Dynamically asks branch questions based on user selections (e.g. course & year for students; farming type for agriculture; business stage for MSME).
   - Sensitive questions (social category, PwD, minority status) are strictly optional and clearly explained.

4. **Explainable AI with Grounded Citations:**
   - Cites authentic government domains (`.gov.in`, `.nic.in`, NSP, DBT Bharat).
   - Explains *Why recommended*, *Which profile details matched*, *Which rules are verified*, and *What to do next*.
   - Dual-language support: **English** and **Malayalam (മലയാളം)**.
   - Robust offline fallback mode if LLM API is unavailable.

5. **Self-Managed Application Checklist & Comparison:**
   - Side-by-side comparison matrix for up to 3 schemes.
   - Personal application preparation tracker (Interested, Reviewing Requirements, Preparing Documents, Ready to Apply, Applied Externally, Completed).

6. **Role-Protected Admin Verification Portal:**
   - Review workflow: `Draft` ➔ `Under Review` ➔ `Verified` ➔ `Published`.
   - Inaccuracy & expired link reports review inbox.
   - Repeatable CSV/JSON dataset re-import with duplicate detection and error logs.

---

## 🏗️ Architecture & Technology Stack

```
SchemeConnect/
├── backend/                  # Python FastAPI REST API Backend
│   ├── app/
│   │   ├── models/           # Pydantic Schemas (Profile, Scheme, Recommendations, Admin)
│   │   ├── services/         # Recommendation Engine, Eligibility Checker, Dynamic Questionnaire, AI
│   │   ├── routers/          # API Route Controllers (Schemes, Profile, Recommendations, Admin, AI)
│   │   ├── config.py         # App Settings & Environment Configuration
│   │   ├── database.py       # Supabase PostgreSQL Client
│   │   └── main.py           # FastAPI Application Entrypoint & CORS
│   ├── tests/                # Automated Pytest Suite (Import, Matching, Eligibility, API)
│   ├── requirements.txt      # Backend Python Dependencies
│   └── run.py                # Server Runner
│
├── frontend/                 # React 18 + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/       # SchemeCard, Navbar, Footer, EligibilityBadge, Modals
│   │   ├── pages/            # Landing, Questionnaire, Results, Detail, Compare, Saved, Chat, Admin
│   │   ├── services/         # Axios API Client
│   │   └── types/            # TypeScript Interfaces
│   ├── package.json          # Frontend Dependencies (Tailwind CSS, Lucide, Framer Motion)
│   └── vite.config.ts        # Vite Bundler Configuration
│
├── supabase/
│   ├── schema.sql            # PostgreSQL DDL, Indexes, RLS Policies & Triggers
│   └── seed.sql              # Seed SQL Statements for 251 Records
│
├── india_official_government_schemes_200plus.csv     # 251 Records CSV Dataset
└── india_official_government_schemes_200plus (2).json # 251 Records JSON Dataset
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Git

### 1. Backend Setup
```bash
# Navigate to the project root
cd "d:\college final year project"

# Install backend dependencies
pip install -r backend/requirements.txt

# Run the automated test suite
python -m pytest -v

# Start the FastAPI server
python backend/run.py
```
> The API will be available at **`http://127.0.0.1:8000`** (Swagger docs at **`http://127.0.0.1:8000/docs`**).

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```
> The web application will launch at **`http://localhost:5173`**.

---

## 🧪 Automated Testing

Run the comprehensive Pytest suite:
```bash
python -m pytest -v
```

**Test Coverage:**
- `test_import.py`: Completeness of 251 records, duplicate rejection, and strict preservation of unknown fields as `NULL`.
- `test_recommendation.py`: Verified central vs. state filtering (Kerala resident demo receives Central + Kerala programs, excluding other state programs).
- `test_eligibility.py`: Deterministic evaluation across all 4 verified statuses and missing information detection.
- `test_api.py`: Endpoint health, dynamic question progression, and offline grounded AI synthesis in English & Malayalam.

---

## 📋 Sample User Verification Walkthrough

**Profile:**
- **Age:** 20
- **State:** Kerala
- **Education:** Undergraduate (BCA / Computer Science)
- **Annual Family Income:** ₹1,50,000
- **Occupation:** Student
- **Assistance Needed:** Scholarships & Education funding

**Expected Behavior:**
1. System queries PostgreSQL database and retrieves education-related central programs and Kerala-specific initiatives.
2. State-level programs for other states (e.g. Tamil Nadu, UP) are strictly filtered out.
3. Relevant schemes (e.g. NSP Central Sector Scholarship, Kerala Post-Matric schemes) receive high relevance scores.
4. Because the official dataset contains unverified detailed conditions, schemes are transparently labeled **"Potential Match — detailed eligibility requirements need verification"**, protecting students from false assurances.
5. Official portal links (`scholarships.gov.in`, `dbtbharat.gov.in`) are provided for direct application.

---

## 🔒 Security & Public Data Ethics

- **Zero PII Storage:** No Aadhaar numbers, bank account numbers, or login credentials are required for scheme discovery.
- **Direct Portal Redirection:** Applications are submitted exclusively on authentic `.gov.in` and `.nic.in` domains.
- **Row Level Security (RLS):** Supabase database policies enforce public access for published schemes while protecting user checklists.
- **Grounded AI:** AI answers are grounded strictly in database records to prevent hallucination of deadlines or benefit amounts.

---

## 📜 License
Developed for academic capstone presentation and public welfare under the [MIT License](LICENSE).
