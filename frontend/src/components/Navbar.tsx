import React, { useState } from 'react';
import { 
  Compass, 
  Bookmark, 
  Scale, 
  Bot, 
  ShieldAlert, 
  Menu, 
  X,
  FileCheck2
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
  compareCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  compareCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'questionnaire', label: 'Find Schemes', highlight: true },
    { id: 'results', label: 'Recommendations' },
    { id: 'compare', label: 'Compare', count: compareCount, icon: Scale },
    { id: 'saved', label: 'Saved Schemes', count: savedCount, icon: Bookmark },
    { id: 'chat', label: 'AI Assistant', icon: Bot },
    { id: 'admin', label: 'Admin Portal', icon: ShieldAlert }
  ];

  const handleNav = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Tricolor top accent strip */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <button 
            onClick={() => handleNav('landing')}
            className="flex items-center space-x-3 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">Scheme<span className="text-blue-600">Connect</span></span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">India</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">National Welfare & Scholarship Portal</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                    item.highlight && !isActive
                      ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                      : isActive
                      ? 'bg-slate-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 opacity-80" />}
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-blue-600 text-white text-[11px] rounded-full font-bold">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
