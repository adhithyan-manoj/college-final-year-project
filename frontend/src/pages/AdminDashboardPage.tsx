import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Edit3, 
  Plus, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Archive,
  Save,
  X,
  ExternalLink,
  MessageSquareWarning,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Scheme, AdminStats } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'add' | 'import' | 'reports'>('catalog');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState<any>(null);

  // New scheme form state
  const [newScheme, setNewScheme] = useState<Partial<Scheme>>({
    scheme_id: `IND-GOV-${Math.floor(1000 + Math.random() * 9000)}`,
    scheme_name: '',
    government_level: 'Central',
    state_or_ut: 'All India',
    sector: 'Scholarship / fee assistance',
    workflow_status: 'draft'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, schemesData, reportsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminSchemes(),
        api.getAdminReports()
      ]);
      setStats(statsData);
      setSchemes(schemesData.schemes || []);
      setReports(reportsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheme) return;

    try {
      await api.updateAdminScheme(editingScheme.scheme_id, editingScheme);
      alert("Scheme updated successfully and workflow transition logged.");
      setEditingScheme(null);
      loadData();
    } catch (err) {
      alert("Failed to update scheme.");
    }
  };

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheme.scheme_id || !newScheme.scheme_name) {
      alert("Scheme ID and Name are required");
      return;
    }
    try {
      await api.createAdminScheme(newScheme as Scheme);
      alert("New scheme added in draft status.");
      setActiveTab('catalog');
      loadData();
    } catch (err) {
      alert("Failed to create scheme.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const res = await api.importDatasetFile(file);
      setImportStatus(res.result);
      loadData();
    } catch (err) {
      alert("Import failed. Check file format.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSchemes = schemes.filter(s => {
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const match = s.scheme_name.toLowerCase().includes(q) || s.scheme_id.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all') {
      if (s.workflow_status !== statusFilter) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900">Admin Verification & Catalog Portal</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage 251 official records, enforce strict guideline verification workflow, and review user reports.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xl font-extrabold text-slate-900 block">{stats.total_schemes}</span>
            <span className="text-[11px] font-medium text-slate-500">Total Records</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xl font-extrabold text-emerald-700 block">{stats.published_count}</span>
            <span className="text-[11px] font-medium text-slate-500">Published</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xl font-extrabold text-blue-700 block">{stats.verified_count}</span>
            <span className="text-[11px] font-medium text-slate-500">Verified</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xl font-extrabold text-amber-700 block">{stats.under_review_count}</span>
            <span className="text-[11px] font-medium text-slate-500">Under Review</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xl font-extrabold text-slate-600 block">{stats.draft_count}</span>
            <span className="text-[11px] font-medium text-slate-500">Drafts</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xl font-extrabold text-rose-700 block">{stats.pending_reports_count}</span>
            <span className="text-[11px] font-medium text-slate-500">User Reports</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'catalog' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Schemes Catalog ({schemes.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'add' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          + Add New Scheme
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'import' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Dataset CSV/JSON Import
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
            activeTab === 'reports' 
              ? 'bg-blue-600 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquareWarning className="w-3.5 h-3.5" />
          <span>User Reports ({reports.length})</span>
        </button>
      </div>

      {/* TAB 1: Scheme Catalog & Review Workflow */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Search scheme ID or name..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 outline-none"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="all">All Workflow Statuses</option>
                <option value="draft">Draft</option>
                <option value="under_review">Under Review</option>
                <option value="verified">Verified</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Scheme ID</th>
                  <th className="p-3.5">Scheme Name</th>
                  <th className="p-3.5">Level / State</th>
                  <th className="p-3.5">Workflow Status</th>
                  <th className="p-3.5">Rule Verification</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchemes.slice(0, 50).map(s => (
                  <tr key={s.scheme_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-blue-700">{s.scheme_id}</td>
                    <td className="p-3.5 font-semibold text-slate-900 max-w-xs truncate" title={s.scheme_name}>
                      {s.scheme_name}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {s.government_level} ({s.state_or_ut})
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        s.workflow_status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                        s.workflow_status === 'verified' ? 'bg-blue-100 text-blue-800' :
                        s.workflow_status === 'under_review' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {s.workflow_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 truncate max-w-[150px]" title={s.eligibility_rule_verification || ''}>
                      {s.eligibility_rule_verification || 'unverified listing'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setEditingScheme({ ...s })}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold rounded-lg transition-colors"
                      >
                        Edit / Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSchemes.length > 50 && (
            <p className="text-xs text-slate-400 text-center">Showing first 50 of {filteredSchemes.length} records</p>
          )}
        </div>
      )}

      {/* TAB 2: Add New Scheme */}
      {activeTab === 'add' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-3xl mx-auto shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Add New Government Scheme</h2>
          <form onSubmit={handleCreateScheme} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheme ID *</label>
                <input
                  type="text"
                  required
                  value={newScheme.scheme_id || ''}
                  onChange={e => setNewScheme({ ...newScheme, scheme_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Government Level</label>
                <select
                  value={newScheme.government_level}
                  onChange={e => setNewScheme({ ...newScheme, government_level: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Central">Central</option>
                  <option value="State">State</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scheme Name *</label>
              <input
                type="text"
                required
                value={newScheme.scheme_name || ''}
                onChange={e => setNewScheme({ ...newScheme, scheme_name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">State / UT</label>
                <input
                  type="text"
                  value={newScheme.state_or_ut || ''}
                  onChange={e => setNewScheme({ ...newScheme, state_or_ut: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sector</label>
                <input
                  type="text"
                  value={newScheme.sector || ''}
                  onChange={e => setNewScheme({ ...newScheme, sector: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scheme Purpose / Description</label>
              <textarea
                rows={3}
                value={newScheme.scheme_purpose || ''}
                onChange={e => setNewScheme({ ...newScheme, scheme_purpose: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Application URL</label>
                <input
                  type="url"
                  value={newScheme.official_application_url || ''}
                  onChange={e => setNewScheme({ ...newScheme, official_application_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source URL</label>
                <input
                  type="url"
                  value={newScheme.source_url || ''}
                  onChange={e => setNewScheme({ ...newScheme, source_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Create Scheme Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Dataset Import */}
      {activeTab === 'import' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-xl mx-auto shadow-xs text-center space-y-4">
          <Upload className="w-10 h-10 text-blue-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Repeatable CSV / JSON Dataset Import</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload the official `india_official_government_schemes_200plus.csv` or `.json` file. The backend automatically deduplicates on `scheme_id`, validates schema rules, and preserves unknown fields as NULL.
          </p>

          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />

          {importStatus && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-left text-xs text-emerald-900 space-y-1 mt-4">
              <p className="font-bold">✓ Import Successful</p>
              <p>Total Records Processed: {importStatus.total_input_records}</p>
              <p>Successfully Inserted / Upserted: {importStatus.successfully_imported}</p>
              <p>Errors Count: {importStatus.errors_count}</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: User Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">User Inaccuracy & Deadlines Reports</h3>
          {reports.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No reports pending review.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((r, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 font-mono">{r.scheme_id}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                      {r.report_type}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium">{r.description}</p>
                  <p className="text-[11px] text-slate-400">Reporter: {r.contact_email || 'Anonymous citizen'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Scheme Modal */}
      {editingScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {editingScheme.scheme_id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">Review & Verify Scheme</h3>
              </div>
              <button onClick={() => setEditingScheme(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateScheme} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheme Name</label>
                <input
                  type="text"
                  value={editingScheme.scheme_name}
                  onChange={e => setEditingScheme({ ...editingScheme, scheme_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              {/* Workflow Status selector (Draft -> Under Review -> Verified -> Published) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Workflow Status Progression</label>
                <select
                  value={editingScheme.workflow_status}
                  onChange={e => setEditingScheme({ ...editingScheme, workflow_status: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-blue-300 bg-blue-50 text-blue-900 font-bold"
                >
                  <option value="draft">Draft (Initial unverified entry)</option>
                  <option value="under_review">Under Review (Guideline document attached)</option>
                  <option value="verified">Verified (Official gazette/portal confirmed)</option>
                  <option value="published">Published (Visible in citizen search)</option>
                  <option value="archived">Archived (Expired/discontinued)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Guideline Source Evidence URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editingScheme.source_url || ''}
                  onChange={e => setEditingScheme({ ...editingScheme, source_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Verified Benefit Amount (₹)</label>
                  <input
                    type="number"
                    value={editingScheme.benefit_amount_inr || ''}
                    onChange={e => setEditingScheme({ ...editingScheme, benefit_amount_inr: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 50000"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="text"
                    value={editingScheme.application_deadline || ''}
                    onChange={e => setEditingScheme({ ...editingScheme, application_deadline: e.target.value })}
                    placeholder="YYYY-MM-DD"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Age</label>
                  <input
                    type="number"
                    value={editingScheme.minimum_age || ''}
                    onChange={e => setEditingScheme({ ...editingScheme, minimum_age: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Age</label>
                  <input
                    type="number"
                    value={editingScheme.maximum_age || ''}
                    onChange={e => setEditingScheme({ ...editingScheme, maximum_age: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Income (₹)</label>
                  <input
                    type="number"
                    value={editingScheme.maximum_annual_family_income_inr || ''}
                    onChange={e => setEditingScheme({ ...editingScheme, maximum_annual_family_income_inr: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verification / Research Audit Notes</label>
                <textarea
                  rows={2}
                  value={editingScheme.research_notes || ''}
                  onChange={e => setEditingScheme({ ...editingScheme, research_notes: e.target.value })}
                  placeholder="Record source gazette number, verification officer notes..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingScheme(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Record Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
