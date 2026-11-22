import React from 'react';
import { ShieldCheck, AlertCircle, HelpCircle, XCircle } from 'lucide-react';
import { EligibilityStatus } from '../types';

interface EligibilityBadgeProps {
  status: EligibilityStatus;
  showSubtitle?: boolean;
}

export const EligibilityBadge: React.FC<EligibilityBadgeProps> = ({ status, showSubtitle = true }) => {
  switch (status) {
    case 'Eligible based on verified criteria':
      return (
        <div className="inline-flex flex-col">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Eligible (Verified Criteria)
          </span>
          {showSubtitle && (
            <span className="text-[10px] text-emerald-700 mt-0.5 ml-1">
              All mandatory verified rules satisfied
            </span>
          )}
        </div>
      );

    case 'Potential match':
      return (
        <div className="inline-flex flex-col">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
            Potential Match (Needs Verification)
          </span>
          {showSubtitle && (
            <span className="text-[10px] text-amber-700 mt-0.5 ml-1">
              Detailed official guidelines unverified
            </span>
          )}
        </div>
      );

    case 'More information needed':
      return (
        <div className="inline-flex flex-col">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            More Information Needed
          </span>
          {showSubtitle && (
            <span className="text-[10px] text-blue-700 mt-0.5 ml-1">
              Additional profile details required
            </span>
          )}
        </div>
      );

    case 'Not eligible based on verified criteria':
      return (
        <div className="inline-flex flex-col">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
            Not Eligible (Verified Condition)
          </span>
          {showSubtitle && (
            <span className="text-[10px] text-rose-700 mt-0.5 ml-1">
              Does not satisfy verified rule
            </span>
          )}
        </div>
      );

    default:
      return null;
  }
};
