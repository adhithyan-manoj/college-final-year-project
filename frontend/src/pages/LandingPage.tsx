import React, { useState } from 'react';
import { 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  GraduationCap, 
  Sparkles, 
  Award, 
  Building2, 
  CheckCircle, 
  Briefcase,
  Users,
  Compass,
  FileCheck2
} from 'lucide-react';
import { UserProfile } from '../types';

interface LandingPageProps {
  onStartQuestionnaire: () => void;
  onSelectSampleProfile: (profile: UserProfile) => void;
  onSearchSchemes: (query: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartQuestionnaire,
  onSelectSampleProfile,
  onSearchSchemes
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sampleKeralaStudent: UserProfile = {
    age: 20,
    state: "Kerala",
    education_level: "undergraduate",
    employment_status: "student",
    current_course: "BCA / Computer Science",
    year_of_study: "Final Year",
    annual_income_inr: 150000,
    income_category: "1.5L_3L",
    assistance_categories: ["scholarships", "education funding"],
    social_category: "obc",
    is_differently_abled: false
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSchemes(searchQuery.trim());
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-blue-50/60 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Official Portal Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-6 shadow-xs border border-blue-200/60">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Official Government Welfare & Scholarship Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Find Every Government Scheme & Scholarship You Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900">Eligible For</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover 250+ central and state government welfare programs, educational grants, and skill allowances with transparent, verified eligibility checks and zero fake chatbots.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartQuestionnaire}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 group hover:scale-[1.02]"
            >
              <span>Find Schemes for Me</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onSelectSampleProfile(sampleKeralaStudent)}
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-xs transition-all flex items-center justify-center space-x-2 hover:border-slate-400"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Try Demo: 20yo Kerala Student</span>
            </button>
          </div>

          {/* Quick Search Bar */}
          <div className="mt-10 max-w-xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by scheme name, sector (e.g. NSP, OBC, Kerala, Farmers)..."
                className="w-full pl-12 pr-28 py-3.5 bg-white text-sm rounded-xl border border-slate-300 shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Key metrics counter */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-700 block">251</span>
              <span className="text-xs font-medium text-slate-600">Official Schemes</span>
            </div>
            <div className="bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-700 block">41</span>
              <span className="text-xs font-medium text-slate-600">Diverse Sectors</span>
            </div>
            <div className="bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 block">Central & State</span>
              <span className="text-xs font-medium text-slate-600">Targeted Scope</span>
            </div>
            <div className="bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 block">100% Grounded</span>
              <span className="text-xs font-medium text-slate-600">Verifiable Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How SchemeConnect Works</h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Engineering real eligibility analysis without synthetic hallucinations or fabricated deadlines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">1. Dynamic Questionnaire</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Answer only questions tailored to your profile. If you are a student, we ask about your degree; if you're an entrepreneur, we ask about your venture.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">2. Deterministic Eligibility Rules</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We separate relevance ranking from legal eligibility. Unverified criteria are flagged honestly as "Potential Matches" rather than false eligibility claims.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">3. Official Direct Portals</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every card links directly to authentic government portals (NSP, DBT, State Portals). No proxy applications, hidden fees, or data selling.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
