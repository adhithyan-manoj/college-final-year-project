import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  HelpCircle, 
  Bookmark, 
  Search, 
  Filter, 
  SlidersHorizontal,
  Scale,
  RefreshCw,
  FileCheck2,
  X
} from 'lucide-react';
import { RecommendationResponse, RecommendationItem, UserProfile } from '../types';
import { SchemeCard } from '../components/SchemeCard';
import { WhyRecommendedModal } from '../components/WhyRecommendedModal';

interface ResultsPageProps {
  results: RecommendationResponse | null;
  userProfile: UserProfile | null;
  onEditProfile: () => void;
  onViewDetails: (schemeId: string) => void;
  savedSchemeIds: Set<string>;
  onToggleSave: (schemeId: string) => void;
  compareList: RecommendationItem[];
  onToggleCompare: (item: RecommendationItem) => void;
  onGoToCompare: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  results,
  userProfile,
  onEditProfile,
  onViewDetails,
  savedSchemeIds,
  onToggleSave,
  compareList,
  onToggleCompare,
  onGoToCompare
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [selectedWhyItem, setSelectedWhyItem] = useState<RecommendationItem | null>(null);

  // Extract unique sectors from recommendations
  const availableSectors = useMemo(() => {
    if (!results) return [];
    const set = new Set<string>();
    results.recommendations.forEach(r => {
      if (r.scheme.sector) set.add(r.scheme.sector);
    });
    return Array.from(set).sort();
  }, [results]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    if (!results) return [];
    return results.recommendations.filter(item => {
      // Search
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const matches = 
          (item.scheme.scheme_name || '').toLowerCase().includes(q) ||
          (item.scheme.scheme_id || '').toLowerCase().includes(q) ||
          (item.scheme.sector || '').toLowerCase().includes(q) ||
          (item.scheme.intended_beneficiaries || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Gov level
      if (levelFilter !== 'all') {
        if ((item.scheme.government_level || '').toLowerCase() !== levelFilter.toLowerCase()) {
          return false;
        }
      }
      // Status
      if (statusFilter !== 'all') {
        if (item.eligibility_status !== statusFilter) {
          return false;
        }
      }
      // Sector
      if (sectorFilter !== 'all') {
        if (item.scheme.sector !== sectorFilter) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'relevance') {
        return b.relevance_score - a.relevance_score;
      } else if (sortBy === 'name') {
        return a.scheme.scheme_name.localeCompare(b.scheme.scheme_name);
      } else if (sortBy === 'amount') {
        return (b.scheme.benefit_amount_inr || 0) - (a.scheme.benefit_amount_inr || 0);
      }
      return 0;
    });
  }, [results, searchFilter, levelFilter, statusFilter, sectorFilter, sortBy]);

  if (!results) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 mb-4">No recommendation results available yet.</p>
        <button
          onClick={onEditProfile}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
        >
          Fill Profile Questionnaire
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-900 block leading-none">
              {results.total_opportunities}
            </span>
            <span className="text-xs font-medium text-slate-500">Opportunities Found</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-emerald-700 block leading-none">
              {results.verified_eligible_count}
            </span>
            <span className="text-xs font-medium text-slate-500">Verified Eligible Matches</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-amber-700 block leading-none">
              {results.potential_match_count}
            </span>
            <span className="text-xs font-medium text-slate-500">Potential Matches (Unverified)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-indigo-700 block leading-none">
              {savedSchemeIds.size}
            </span>
            <span className="text-xs font-medium text-slate-500">Saved to Checklist</span>
          </div>
        </div>
      </div>

      {/* User Profile Summary Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/30 text-blue-200">
              Active Search Profile
            </span>
            <span className="text-xs text-blue-200">• Personalized Results</span>
          </div>
          <p className="text-sm text-slate-200">
            Showing opportunities for: <strong>{results.user_summary.age || 'Age unstated'} years old</strong>, <strong>{results.user_summary.employment}</strong> from <strong>{results.user_summary.state}</strong>. Income: <strong>{results.user_summary.income}</strong>.
          </p>
        </div>

        <button
          onClick={onEditProfile}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
        >
          Edit Profile Answers
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              placeholder="Filter by name, sector..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Government Levels</option>
              <option value="Central">Central Government</option>
              <option value="State">State Government</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Eligibility Statuses</option>
              <option value="Eligible based on verified criteria">Eligible (Verified Criteria)</option>
              <option value="Potential match">Potential Match (Needs Verification)</option>
              <option value="More information needed">More Information Needed</option>
              <option value="Not eligible based on verified criteria">Not Eligible</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              <option value="relevance">Sort by: Relevance Score</option>
              <option value="name">Sort by: Scheme Name</option>
              <option value="amount">Sort by: Benefit Amount</option>
            </select>
          </div>
        </div>

        {/* Sector tags scroll */}
        {availableSectors.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Sectors:</span>
            <button
              onClick={() => setSectorFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                sectorFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Sectors
            </button>
            {availableSectors.map(sec => (
              <button
                key={sec}
                onClick={() => setSectorFilter(sec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  sectorFilter === sec
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Compare Floating Banner */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center space-x-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold">{compareList.length} Scheme(s) Selected for Comparison</span>
          </div>
          <button
            onClick={onGoToCompare}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Compare Now
          </button>
        </div>
      )}

      {/* Schemes Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Showing {filteredItems.length} of {results.total_opportunities} Schemes
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-500 text-sm mb-2">No schemes match your selected filters.</p>
            <button
              onClick={() => {
                setSearchFilter('');
                setLevelFilter('all');
                setStatusFilter('all');
                setSectorFilter('all');
              }}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <SchemeCard
                key={item.scheme.scheme_id}
                item={item}
                onViewDetails={onViewDetails}
                onOpenWhy={setSelectedWhyItem}
                onToggleSave={onToggleSave}
                isSaved={savedSchemeIds.has(item.scheme.scheme_id)}
                onToggleCompare={onToggleCompare}
                isCompared={compareList.some(c => c.scheme.scheme_id === item.scheme.scheme_id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Why Recommended Modal */}
      <WhyRecommendedModal
        item={selectedWhyItem}
        onClose={() => setSelectedWhyItem(null)}
      />
    </div>
  );
};
