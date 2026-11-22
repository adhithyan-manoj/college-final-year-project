import React from 'react';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  ArrowUpRight, 
  Bookmark, 
  Check, 
  Scale, 
  Info, 
  ExternalLink,
  IndianRupee,
  Calendar
} from 'lucide-react';
import { RecommendationItem } from '../types';
import { EligibilityBadge } from './EligibilityBadge';

interface SchemeCardProps {
  item: RecommendationItem;
  onViewDetails: (schemeId: string) => void;
  onOpenWhy: (item: RecommendationItem) => void;
  onToggleSave: (schemeId: string) => void;
  isSaved: boolean;
  onToggleCompare: (item: RecommendationItem) => void;
  isCompared: boolean;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  item,
  onViewDetails,
  onOpenWhy,
  onToggleSave,
  isSaved,
  onToggleCompare,
  isCompared
}) => {
  const { scheme, relevance_score, eligibility_status, why_recommended } = item;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between group relative overflow-hidden">
      {/* Top Tag & Match Percentage */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
            {scheme.government_level || 'National'}
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            {scheme.sector || 'General Welfare'}
          </span>
          {scheme.state_or_ut && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 flex items-center">
              <MapPin className="w-3 h-3 mr-0.5 inline" />
              {scheme.state_or_ut}
            </span>
          )}
        </div>

        {/* Relevance Score Pill */}
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-xs shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>{relevance_score}% Match</span>
        </div>
      </div>

      {/* Scheme Name & ID */}
      <div className="mb-3">
        <span className="text-[11px] font-mono text-slate-600 block mb-0.5">{scheme.scheme_id}</span>
        <h3 
          onClick={() => onViewDetails(scheme.scheme_id)}
          className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
        >
          {scheme.scheme_name}
        </h3>
      </div>

      {/* Implementing Department */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-3">
        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="truncate">{scheme.implementing_authority || 'Ministry / Department unassigned'}</span>
      </div>

      {/* Eligibility Status Badge */}
      <div className="mb-4">
        <EligibilityBadge status={eligibility_status} />
      </div>

      {/* Why Recommended snippet */}
      <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 mb-4 border border-slate-100">
        <div className="flex items-start justify-between gap-1">
          <p className="line-clamp-2 italic">"{why_recommended}"</p>
          <button 
            onClick={() => onOpenWhy(item)} 
            className="text-blue-600 hover:text-blue-700 shrink-0 text-[11px] font-semibold underline ml-1"
          >
            Why?
          </button>
        </div>
      </div>

      {/* Verified Benefit or unverified notice */}
      <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-t border-slate-100 mb-4">
        <span className="flex items-center font-medium">
          <IndianRupee className="w-3.5 h-3.5 mr-1 text-slate-400" />
          {scheme.benefit_amount_inr ? (
            <span className="text-emerald-700 font-bold">₹{scheme.benefit_amount_inr.toLocaleString('en-IN')} (Verified)</span>
          ) : scheme.benefit_summary ? (
            <span className="text-slate-700 truncate max-w-[200px]" title={scheme.benefit_summary}>
              {scheme.benefit_summary}
            </span>
          ) : (
            <span className="text-slate-600 italic">Financial amount unverified</span>
          )}
        </span>

        {scheme.academic_or_financial_year && (
          <span className="text-[11px] text-slate-600 flex items-center">
            <Calendar className="w-3 h-3 mr-1 opacity-70" />
            {scheme.academic_or_financial_year}
          </span>
        )}
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onToggleSave(scheme.scheme_id)}
            className={`p-2 rounded-lg border text-xs font-medium transition-all ${
              isSaved 
                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={isSaved ? "Saved to your list" : "Save scheme"}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>

          <button
            onClick={() => onToggleCompare(item)}
            className={`p-2 rounded-lg border text-xs font-medium transition-all ${
              isCompared 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title={isCompared ? "Remove from Compare" : "Compare with other schemes"}
          >
            <Scale className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewDetails(scheme.scheme_id)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
          >
            Details
          </button>
        </div>

        {/* Apply Link (Strictly official URL only, no fake apply) */}
        {scheme.official_application_url ? (
          <a
            href={scheme.official_application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors shrink-0"
          >
            <span>Apply Portal</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        ) : scheme.source_url ? (
          <a
            href={scheme.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
          >
            <span>Source</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </a>
        ) : (
          <span className="text-[11px] text-slate-600 italic">No URL listed</span>
        )}
      </div>
    </div>
  );
};
