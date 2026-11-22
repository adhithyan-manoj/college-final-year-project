import React from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  FileQuestion, 
  ArrowRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { RecommendationItem } from '../types';
import { EligibilityBadge } from './EligibilityBadge';

interface WhyRecommendedModalProps {
  item: RecommendationItem | null;
  onClose: () => void;
}

export const WhyRecommendedModal: React.FC<WhyRecommendedModalProps> = ({ item, onClose }) => {
  if (!item) return null;
  const { scheme } = item;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {scheme.scheme_id}
              </span>
              <span className="text-xs text-slate-500">• Explainable AI Report</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {scheme.scheme_name}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content answering the 5 requirements */}
        <div className="p-6 space-y-6">
          {/* Status summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Evaluated Status</h4>
            <EligibilityBadge status={item.eligibility_status} />
            <p className="text-xs text-slate-600 mt-2 font-medium">
              Relevance Score: <strong className="text-indigo-600">{item.relevance_score}%</strong> (Interest & Scope Alignment)
            </p>
          </div>

          {/* 1. Why am I seeing this scheme? */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center">
              <HelpCircle className="w-4 h-4 text-blue-600 mr-2" />
              1. Why am I seeing this scheme?
            </h4>
            <p className="text-xs text-slate-700 pl-6 leading-relaxed">
              {item.why_recommended}
            </p>
          </div>

          {/* 2. Which of my profile details are relevant? */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" />
              2. Which profile attributes matched?
            </h4>
            <ul className="pl-6 space-y-1">
              {item.matched_profile_attributes.length > 0 ? (
                item.matched_profile_attributes.map((attr, idx) => (
                  <li key={idx} className="text-xs text-slate-700 list-disc">
                    {attr}
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-500 italic">Matched based on national welfare catalog scope.</li>
              )}
            </ul>
          </div>

          {/* 3. Which eligibility conditions are verified? */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center">
              <ShieldAlert className="w-4 h-4 text-amber-600 mr-2" />
              3. Verified Criteria Evaluation
            </h4>
            <div className="pl-6 space-y-2">
              {item.verified_satisfied_conditions.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">Satisfied Rules:</span>
                  <ul className="space-y-1">
                    {item.verified_satisfied_conditions.map((c, i) => (
                      <li key={i} className="text-xs text-emerald-800 list-disc font-medium">{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.verified_failed_conditions.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-1">Failed Rules:</span>
                  <ul className="space-y-1">
                    {item.verified_failed_conditions.map((c, i) => (
                      <li key={i} className="text-xs text-rose-800 list-disc font-medium">{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.verified_satisfied_conditions.length === 0 && item.verified_failed_conditions.length === 0 && (
                <p className="text-xs text-slate-600 italic">
                  This record is currently listed as an unverified official listing in the database. No rules have been officially promoted to fully verified status yet.
                </p>
              )}
            </div>
          </div>

          {/* 4. Which requirements are still unknown/unverified? */}
          <div className="space-y-1.5">
            <h4 className="text-sm font-bold text-slate-900 flex items-center">
              <FileQuestion className="w-4 h-4 text-purple-600 mr-2" />
              4. Unverified Requirements & Missing Info
            </h4>
            <div className="pl-6 space-y-1.5">
              {item.unverified_conditions.map((u, i) => (
                <div key={i} className="text-xs text-slate-600 flex items-start space-x-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{u}</span>
                </div>
              ))}
              {item.missing_information.map((m, i) => (
                <div key={i} className="text-xs text-blue-700 flex items-start space-x-1.5">
                  <span className="text-blue-500 font-bold">ℹ</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. What should I do next? */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center">
              <ArrowRight className="w-4 h-4 mr-1.5 text-blue-700" />
              5. Recommended Next Steps
            </h4>
            <p className="text-xs text-blue-900 leading-relaxed font-medium">
              {item.next_steps}
            </p>
            {scheme.official_application_url && (
              <a 
                href={scheme.official_application_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs font-bold text-blue-700 hover:text-blue-800 underline mt-1"
              >
                <span>Visit Official Application Portal</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
