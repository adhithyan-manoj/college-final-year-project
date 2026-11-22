import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Bookmark, 
  CheckCircle2, 
  FileText, 
  IndianRupee,
  Share2,
  Clock,
  Flag,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { Scheme } from '../types';
import { ReportSchemeModal } from '../components/ReportSchemeModal';

interface SchemeDetailPageProps {
  schemeId: string;
  onBack: () => void;
  isSaved: boolean;
  onToggleSave: (schemeId: string) => void;
  onAskAIAboutScheme: (schemeId: string, schemeName: string) => void;
}

export const SchemeDetailPage: React.FC<SchemeDetailPageProps> = ({
  schemeId,
  onBack,
  isSaved,
  onToggleSave,
  onAskAIAboutScheme
}) => {
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    loadScheme();
  }, [schemeId]);

  const loadScheme = async () => {
    setLoading(true);
    try {
      const data = await api.getSchemeById(schemeId);
      setScheme(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !scheme) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading scheme record from database...</p>
      </div>
    );
  }

  const isRuleVerified = Boolean(
    scheme.eligibility_rule_verification && 
    scheme.eligibility_rule_verification.toLowerCase().includes('verified')
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Back button and actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Recommendations</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Flag className="w-3.5 h-3.5 mr-1.5" />
            <span>Report Inaccuracy</span>
          </button>

          <button
            onClick={() => onToggleSave(scheme.scheme_id)}
            className={`inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
              isSaved 
                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 mr-1.5 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save Scheme'}</span>
          </button>
        </div>
      </div>

      {/* Main Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
              {scheme.scheme_id}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {scheme.government_level || 'National'}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              {scheme.sector || 'General Welfare'}
            </span>
            {scheme.state_or_ut && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {scheme.state_or_ut}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {scheme.scheme_name}
          </h1>

          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>{scheme.implementing_authority || 'Responsible Ministry / State Department unassigned'}</span>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
          isRuleVerified 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}>
          {isRuleVerified ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-0.5">
            <span className="font-bold block">
              {isRuleVerified ? 'Verified Official Scheme Guidelines' : 'Official Listing — Detailed Rules Unverified'}
            </span>
            <p className="leading-relaxed opacity-90">
              {isRuleVerified 
                ? 'The rules, income limits, and conditions for this program have been cross-verified with official government gazettes.'
                : 'This program exists in the official catalog, but detailed eligibility clauses (exact age cutoffs, category certificates, income limits) are unverified. Please check the linked government portal.'}
            </p>
          </div>
        </div>

        {/* Scheme Purpose & Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Scheme Overview</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {scheme.scheme_purpose || 'Detailed scheme purpose has not been populated in the national catalog.'}
          </p>
        </div>

        {/* Intended Beneficiaries */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Intended Beneficiaries</h3>
          <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {scheme.intended_beneficiaries || 'General eligible public under department guidelines.'}
          </p>
        </div>

        {/* Benefits & Financial Assistance */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Benefits & Financial Coverage</h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-500 block mb-0.5">Benefit Summary</span>
              <span className="text-sm font-semibold text-slate-800">
                {scheme.benefit_summary || 'Financial and material assistance per scheme guidelines.'}
              </span>
            </div>
            {scheme.benefit_amount_inr ? (
              <div className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-sm font-bold self-start sm:self-auto">
                ₹{scheme.benefit_amount_inr.toLocaleString('en-IN')} (Verified Amount)
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">Exact amount unverified</span>
            )}
          </div>
        </div>

        {/* Eligibility Criteria Table */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Eligibility Requirements</h3>
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-500 bg-slate-50 w-1/3">Age Range</td>
                  <td className="px-4 py-3 text-slate-800">
                    {scheme.minimum_age || scheme.maximum_age 
                      ? `${scheme.minimum_age || 'Any'} to ${scheme.maximum_age || 'Any'} years` 
                      : 'Not specified in dataset (Check portal)'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-500 bg-slate-50">Annual Family Income Ceiling</td>
                  <td className="px-4 py-3 text-slate-800">
                    {scheme.maximum_annual_family_income_inr 
                      ? `Up to ₹${scheme.maximum_annual_family_income_inr.toLocaleString('en-IN')}` 
                      : 'Not specified in dataset (Check portal)'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-500 bg-slate-50">Educational Qualification</td>
                  <td className="px-4 py-3 text-slate-800">
                    {scheme.education_requirement || 'Not specified in dataset (Check portal)'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-500 bg-slate-50">Social / Reservation Category</td>
                  <td className="px-4 py-3 text-slate-800">
                    {scheme.social_category_requirement || 'All categories / Not restricted'}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-slate-500 bg-slate-50">Residency / Domicile</td>
                  <td className="px-4 py-3 text-slate-800">
                    {scheme.residency_requirement || scheme.state_or_ut || 'All India'}
                  </td>
                </tr>
                {scheme.other_eligibility_conditions && (
                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-500 bg-slate-50">Other Conditions</td>
                    <td className="px-4 py-3 text-slate-800">
                      {scheme.other_eligibility_conditions}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Required Documents */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Required Documentation</h3>
          <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            {scheme.required_documents || 'Standard government documents (Aadhaar, income certificate, domicile, marksheet) are typically verified during application.'}
          </p>
        </div>

        {/* Application Process & Portal Links */}
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Application & Official Portals</h3>
          <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Application Mode: {scheme.application_mode || 'Online Portal'}</span>
              <span className="text-xs text-slate-300">
                Submit directly through the authorized government server.
              </span>
            </div>

            {scheme.official_application_url ? (
              <a
                href={scheme.official_application_url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors inline-flex items-center space-x-1.5 shrink-0"
              >
                <span>Go to Official Application Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : scheme.source_url ? (
              <a
                href={scheme.source_url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-colors inline-flex items-center space-x-1.5 shrink-0"
              >
                <span>Check Official Source Notice</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <span className="text-xs text-slate-400 italic">No online link specified</span>
            )}
          </div>
        </div>

        {/* Ask AI CTA */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Have questions about whether this scheme fits your specific situation?
          </p>
          <button
            onClick={() => onAskAIAboutScheme(scheme.scheme_id, scheme.scheme_name)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
          >
            Ask AI Assistant About This Scheme →
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <ReportSchemeModal
          schemeId={scheme.scheme_id}
          schemeName={scheme.scheme_name}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </div>
  );
};
