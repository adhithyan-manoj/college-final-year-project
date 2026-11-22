import React from 'react';
import { ShieldCheck, ExternalLink, HeartHandshake, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                SC
              </div>
              <span className="text-lg font-bold text-white tracking-tight">SchemeConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An AI-powered discovery and eligibility navigation portal assisting Indian students, youth, and citizens in accessing legitimate public assistance opportunities.
            </p>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>251 Verified Government Records</span>
            </div>
          </div>

          {/* Column 2: Data Sources */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Official Sources</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="https://scholarships.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>National Scholarship Portal (NSP)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://dbtbharat.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>Direct Benefit Transfer (DBT Bharat)</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://myscheme.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>myScheme Citizen Services</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://kerala.gov.in" target="_blank" rel="noreferrer" className="hover:text-white flex items-center space-x-1">
                  <span>Government of Kerala Portals</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Safety */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Public Notice</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              SchemeConnect never asks for Aadhaar numbers, OTPs, or bank passwords. All applications are submitted strictly on official government domain links (.gov.in / .nic.in).
            </p>
          </div>

          {/* Column 4: Academic Note */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Project Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              BCA Final Year Capstone Project demonstrating real-time deterministic eligibility evaluation, Supabase PostgreSQL, and grounded AI synthesis.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <Database className="w-3.5 h-3.5" />
              <span>PostgreSQL • FastAPI • React</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 SchemeConnect India. Open Public Service Platform.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Designed with care for Indian Citizens</span>
            <HeartHandshake className="w-3.5 h-3.5 text-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
