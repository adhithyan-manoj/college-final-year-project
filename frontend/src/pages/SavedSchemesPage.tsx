import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  ExternalLink, 
  Trash2, 
  CheckSquare, 
  FileEdit, 
  AlertCircle,
  Building2,
  Calendar,
  Save
} from 'lucide-react';
import { api } from '../services/api';
import { SavedSchemeItem, ChecklistItem } from '../types';

interface SavedSchemesPageProps {
  userId: string;
  onViewDetails: (schemeId: string) => void;
  onRemoveSave: (schemeId: string) => void;
}

export const SavedSchemesPage: React.FC<SavedSchemesPageProps> = ({
  userId,
  onViewDetails,
  onRemoveSave
}) => {
  const [savedItems, setSavedItems] = useState<SavedSchemeItem[]>([]);
  const [checklist, setChecklist] = useState<Record<string, { status: string; notes: string }>>({});
  const [loading, setLoading] = useState(true);
  const [savedNotesStatus, setSavedNotesStatus] = useState<string | null>(null);

  useEffect(() => {
    loadSavedData();
  }, [userId]);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      const [saved, chk] = await Promise.all([
        api.getSavedSchemes(userId),
        api.getChecklist(userId)
      ]);
      setSavedItems(saved);

      const chkMap: Record<string, { status: string; notes: string }> = {};
      chk.forEach(item => {
        chkMap[item.scheme_id] = {
          status: item.status,
          notes: item.notes || ''
        };
      });
      setChecklist(chkMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (schemeId: string, newStatus: string) => {
    const currentNotes = checklist[schemeId]?.notes || '';
    setChecklist(prev => ({
      ...prev,
      [schemeId]: { status: newStatus, notes: currentNotes }
    }));
    await api.updateChecklist(userId, schemeId, newStatus, currentNotes);
  };

  const handleNotesSave = async (schemeId: string) => {
    const currentStatus = checklist[schemeId]?.status || 'interested';
    const notes = checklist[schemeId]?.notes || '';
    await api.updateChecklist(userId, schemeId, currentStatus, notes);
    setSavedNotesStatus(schemeId);
    setTimeout(() => setSavedNotesStatus(null), 2000);
  };

  const statusOptions = [
    { value: 'interested', label: '1. Interested' },
    { value: 'reviewing_requirements', label: '2. Reviewing Requirements' },
    { value: 'preparing_documents', label: '3. Preparing Documents' },
    { value: 'ready_to_apply', label: '4. Ready to Apply' },
    { value: 'applied_externally', label: '5. Applied Externally' },
    { value: 'completed', label: '6. Completed' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center space-x-2">
          <Bookmark className="w-7 h-7 text-blue-600" />
          <span>Saved Schemes & Preparation Checklist</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track required documents and self-manage your application progress for saved government programs.
        </p>
      </div>

      {/* Public Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3 text-amber-900 text-xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold block">Self-Managed Tracking Notice</span>
          <p className="leading-relaxed opacity-90">
            Checklist statuses below are personal, user-entered progress notes. SchemeConnect does not transmit or verify live statuses with government application servers.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500">
          Loading your saved schemes...
        </div>
      ) : savedItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Your Saved List is Empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Browse through your personalized recommendations and bookmark schemes to track application deadlines and preparation notes here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedItems.map(item => {
            const scheme = item.schemes;
            if (!scheme) return null;
            const currentStatus = checklist[scheme.scheme_id]?.status || 'interested';
            const currentNotes = checklist[scheme.scheme_id]?.notes || '';

            return (
              <div
                key={scheme.scheme_id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row: Info & Remove */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {scheme.scheme_id}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {scheme.government_level}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {scheme.sector}
                      </span>
                    </div>

                    <h3
                      onClick={() => onViewDetails(scheme.scheme_id)}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {scheme.scheme_name}
                    </h3>

                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{scheme.implementing_authority || 'Ministry / Department'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-start">
                    <button
                      onClick={() => onViewDetails(scheme.scheme_id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => onRemoveSave(scheme.scheme_id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Selector & Notes Bar */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                      <span>My Application Stage</span>
                    </label>
                    <select
                      value={currentStatus}
                      onChange={e => handleStatusChange(scheme.scheme_id, e.target.value)}
                      className="w-full text-xs font-semibold rounded-lg border border-slate-300 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <FileEdit className="w-3.5 h-3.5 text-slate-500" />
                        <span>Personal Notes / Checklist</span>
                      </span>
                      {savedNotesStatus === scheme.scheme_id && (
                        <span className="text-[10px] text-emerald-600 font-bold">Saved!</span>
                      )}
                    </label>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="text"
                        value={currentNotes}
                        onChange={e => {
                          const val = e.target.value;
                          setChecklist(prev => ({
                            ...prev,
                            [scheme.scheme_id]: { ...prev[scheme.scheme_id], notes: val }
                          }));
                        }}
                        placeholder="e.g. Uploaded income cert on 24th Nov..."
                        className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button
                        onClick={() => handleNotesSave(scheme.scheme_id)}
                        className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 shrink-0"
                        title="Save note"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom portal link */}
                {scheme.official_application_url && (
                  <div className="flex justify-end pt-1">
                    <a
                      href={scheme.official_application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-700 underline"
                    >
                      <span>Open Official Portal</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
