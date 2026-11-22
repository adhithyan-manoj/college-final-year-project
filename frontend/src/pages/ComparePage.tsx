import React from 'react';
import { Scale, ArrowLeft, X, ExternalLink, IndianRupee, ShieldCheck } from 'lucide-react';
import { RecommendationItem } from '../types';
import { EligibilityBadge } from '../components/EligibilityBadge';

interface ComparePageProps {
  compareList: RecommendationItem[];
  onRemoveFromCompare: (schemeId: string) => void;
  onClearCompare: () => void;
  onBack: () => void;
  onViewDetails: (schemeId: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  compareList,
  onRemoveFromCompare,
  onClearCompare,
  onBack,
  onViewDetails
}) => {
  if (compareList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Schemes Selected to Compare</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Add up to 3 schemes from your recommendations list using the scale icon on any scheme card.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
        >
          Browse Schemes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-500">
            Comparing <strong>{compareList.length}</strong> of 3 max schemes
          </span>
          <button
            onClick={onClearCompare}
            className="text-xs text-rose-600 hover:underline font-semibold"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-bold text-slate-400 uppercase tracking-wider w-48">Feature</th>
              {compareList.map(item => (
                <th key={item.scheme.scheme_id} className="p-4 min-w-[280px] max-w-[320px] align-top">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                      {item.scheme.scheme_id}
                    </span>
                    <button
                      onClick={() => onRemoveFromCompare(item.scheme.scheme_id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 
                    onClick={() => onViewDetails(item.scheme.scheme_id)}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2"
                  >
                    {item.scheme.scheme_name}
                  </h4>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="p-4 font-semibold text-slate-500 bg-slate-50/50">Relevance Match</td>
              {compareList.map(item => (
                <td key={item.scheme.scheme_id} className="p-4">
                  <span className="font-extrabold text-blue-600 text-sm">{item.relevance_score}%</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold text-slate-500 bg-slate-50/50">Eligibility Status</td>
              {compareList.map(item => (
                <td key={item.scheme.scheme_id} className="p-4">
                  <EligibilityBadge status={item.eligibility_status} showSubtitle={false} />
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold text-slate-500 bg-slate-50/50">Level & State</td>
              {compareList.map(item => (
                <td key={item.scheme.scheme_id} className="p-4 font-medium text-slate-800">
                  {item.scheme.government_level} ({item.scheme.state_or_ut || 'All India'})
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold text-slate-500 bg-slate-50/50">Sector / Category</td>
              {compareList.map(item => (
                <td key={item.scheme.scheme_id} className="p-4 text-slate-700">
                  {item.scheme.sector || 'General'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold text-slate-500 bg-slate-50/50">Financial Coverage</td>
              {compareList.map(item => (
                <td key={item.scheme.scheme_id} className="p-4">
                  {item.scheme.benefit_amount_inr ? (
                    <span className="font-bold text-emerald-700">₹{item.scheme.benefit_amount_inr.toLocaleString('en-IN')}</span>
                  ) : item.scheme.benefit_summary ? (
                    <span className="text-slate-700">{item.scheme.benefit_summary}</span>
                  ) : (
                    <span className="text-slate-400 italic">Unverified amount</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold text-slate-500 bg-slate-50/50">Eligibility Limits</td>
              {compareList.map(item => (
                <td key={item.scheme.scheme_id} className="p-4 space-y-1 text-[11px] text-slate-700">
                  <p><strong>Age:</strong> {item.scheme.minimum_age || 'Any'} - {item.scheme.maximum_age || 'Any'}</p>
                  <p><strong>Income limit:</strong> {item.scheme.maximum_annual_family_income_inr ? `₹${item.scheme.maximum_annual_family_income_inr.toLocaleString('en-IN')}` : 'Unspecified'}</p>
                  <p><strong>Education:</strong> {item.scheme.education_requirement || 'Not restricted'}</p>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-semibold text-slate-500 bg-slate-50/50">Official Link</td>
              {compareList.map(item => (
                <td key={item.scheme.scheme_id} className="p-4">
                  {item.scheme.official_application_url ? (
                    <a
                      href={item.scheme.official_application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-blue-600 hover:underline font-bold"
                    >
                      <span>Apply Portal</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No link listed</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
