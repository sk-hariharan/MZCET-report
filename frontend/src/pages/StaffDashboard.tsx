import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FilePlus, 
  Layers, 
  FileText,
  FileCode,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  AlertTriangle,
  FolderOpen,
  RefreshCw,
  Search,
  History,
  Loader2
} from 'lucide-react';
import type { FullReport } from '../types';

interface StaffDashboardProps {
  currentTab?: string;
  onCreateReport: (type: 'weekly' | 'monthly') => void;
  onEditReport: (id: number, type: 'weekly' | 'monthly') => void;
  onPreviewReport: (id: number) => void;
}

interface StaffDashboardMetrics {
  currentAcademicYear: string;
  currentSemester: string;
  metrics: {
    total: number;
    drafts: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ 
  currentTab,
  onCreateReport, 
  onEditReport, 
  onPreviewReport 
}) => {
  const { token, user, apiBaseUrl } = useAuth();
  const [metrics, setMetrics] = useState<StaffDashboardMetrics | null>(null);
  const [history, setHistory] = useState<FullReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter controls for Reports History
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Async action state
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Fetch dashboard metrics
      const metricsRes = await fetch(`${apiBaseUrl}/analytics/dashboard/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);

      // 2. Fetch history reports
      const reportsRes = await fetch(`${apiBaseUrl}/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reportsData = await reportsRes.json();
      setHistory(reportsData.reports || []);

    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch dashboard data. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Real-time Live Polling Interval (every 5 seconds)
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleDeleteReport = async (reportId: number) => {
    if (!window.confirm(`Are you sure you want to delete report #${reportId}? This action cannot be undone.`)) {
      return;
    }
    const previousHistory = [...history];
    try {
      setDeletingId(reportId);
      // Optimistic update
      setHistory(prev => prev.filter(r => r.id !== reportId));

      const res = await fetch(`${apiBaseUrl}/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setHistory(previousHistory);
        throw new Error(data.message || 'Failed to delete report');
      }
      fetchDashboardData();
    } catch (err: any) {
      alert(`Delete Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadWord = async (report: FullReport) => {
    const key = `${report.id}-word`;
    try {
      setDownloadingKey(key);
      const res = await fetch(`${apiBaseUrl}/reports/${report.id}/word`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StaffReport_${(user?.name || 'Staff').replace(/ /g, '_')}_${report.month}_${report.id}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`Word download error: ${err.message}`);
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleDownloadPptx = async (report: FullReport) => {
    const key = `${report.id}-ppt`;
    try {
      setDownloadingKey(key);
      const res = await fetch(`${apiBaseUrl}/reports/${report.id}/ppt`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StaffReport_${(user?.name || 'Staff').replace(/ /g, '_')}_${report.month}_${report.id}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`PowerPoint download error: ${err.message}`);
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleDownloadPdf = async (report: FullReport) => {
    const key = `${report.id}-pdf`;
    try {
      setDownloadingKey(key);
      const res = await fetch(`${apiBaseUrl}/reports/${report.id}/pdf`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StaffReport_${(user?.name || 'Staff').replace(/ /g, '_')}_${report.month}_${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`PDF download error: ${err.message}`);
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleDownloadExcel = async (report: FullReport) => {
    const key = `${report.id}-excel`;
    try {
      setDownloadingKey(key);
      const res = await fetch(`${apiBaseUrl}/reports/${report.id}/excel`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StaffReport_${(user?.name || 'Staff').replace(/ /g, '_')}_${report.month}_${report.id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`Excel download error: ${err.message}`);
    } finally {
      setDownloadingKey(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2.5 py-1 text-[11px] font-extrabold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">Approved</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 text-[11px] font-extrabold bg-rose-50 text-rose-700 rounded-full border border-rose-200">Correction Required</span>;
      case 'Submitted':
      case 'Under Review':
        return <span className="px-2.5 py-1 text-[11px] font-extrabold bg-blue-50 text-blue-700 rounded-full border border-blue-200">Under Review</span>;
      case 'Resubmitted':
        return <span className="px-2.5 py-1 text-[11px] font-extrabold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">Resubmitted</span>;
      case 'Draft':
      default:
        return <span className="px-2.5 py-1 text-[11px] font-extrabold bg-slate-100 text-slate-600 rounded-full border border-slate-200">Draft</span>;
    }
  };

  // Filter history based on search & dropdowns
  const filteredHistory = history.filter(report => {
    const matchesQuery = searchQuery === '' || 
      report.month?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(report.id).includes(searchQuery) ||
      report.status?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.report_type === typeFilter;

    return matchesQuery && matchesStatus && matchesType;
  });

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500 font-bold flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          Loading Staff Dashboard metrics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {currentTab === 'reports' ? (
        /* Dedicated My Reports History Page Banner */
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-7 shadow-xl relative overflow-hidden border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[11px] font-extrabold uppercase tracking-wider border border-blue-400/20">
              <History className="h-3.5 w-3.5" /> Reports Archive & History
            </div>
            <h2 className="text-2xl font-black text-white">My Reports History</h2>
            <p className="text-xs text-slate-300 font-medium max-w-xl">
              Access, search, filter, edit drafts, and download official PDF, DOCX, XLSX & PPTX reports
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap gap-2.5">
            <button 
              onClick={() => onCreateReport('weekly')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <FilePlus className="h-4 w-4" /> + New Weekly Report
            </button>
            <button 
              onClick={() => onCreateReport('monthly')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center gap-1.5"
            >
              <FilePlus className="h-4 w-4" /> + New Monthly Report
            </button>
          </div>
          <div className="absolute right-4 -bottom-6 opacity-10 text-white pointer-events-none">
            <FolderOpen className="h-56 w-56" />
          </div>
        </div>
      ) : (
        /* Welcome Banner & Metrics for Main Dashboard */
        <>
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl p-7 shadow-xl relative overflow-hidden border border-blue-700/50">
            <div className="relative z-10 space-y-2">
              <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-bold tracking-widest text-blue-200 uppercase">
                Faculty Reporting Hub
              </div>
              <h2 className="text-2xl font-black text-white">Welcome back, {user?.name}!</h2>
              <p className="text-xs text-blue-200 font-medium max-w-xl">Mount Zion College of Engineering & Technology — Weekly and Monthly Activity Portal</p>
              <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-100 pt-3">
                <span className="flex items-center gap-1.5 bg-slate-900/50 backdrop-blur-md py-1.5 px-3.5 rounded-xl border border-white/10">
                  <Calendar className="h-4 w-4 text-blue-300" /> AY: {metrics?.currentAcademicYear || '2025-2026'}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900/50 backdrop-blur-md py-1.5 px-3.5 rounded-xl border border-white/10">
                  <Layers className="h-4 w-4 text-indigo-300" /> Sem: {metrics?.currentSemester || 'ODD'}
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900/50 backdrop-blur-md py-1.5 px-3.5 rounded-xl border border-white/10 text-emerald-300">
                  Dept: {user?.department_name || 'Information Technology'}
                </span>
              </div>
            </div>
            <div className="absolute right-4 -bottom-6 opacity-10 text-white pointer-events-none">
              <FolderOpen className="h-56 w-56" />
            </div>
          </div>

          {metrics?.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">Total Reports</span>
                <p className="text-3xl font-black text-slate-800">{metrics.metrics.total}</p>
              </div>
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">Drafts</span>
                <p className="text-3xl font-black text-slate-500">{metrics.metrics.drafts}</p>
              </div>
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">Under Review</span>
                <p className="text-3xl font-black text-blue-600">{metrics.metrics.submitted}</p>
              </div>
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">Approved</span>
                <p className="text-3xl font-black text-emerald-600">{metrics.metrics.approved}</p>
              </div>
              <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">Corrections</span>
                <p className="text-3xl font-black text-rose-600">{metrics.metrics.rejected}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button 
              onClick={() => onCreateReport('weekly')}
              className="bg-white border-2 border-slate-200 hover:border-blue-500 p-6 rounded-3xl shadow-sm hover:shadow-xl flex items-center gap-5 text-left transition-all duration-300 group transform hover:-translate-y-0.5"
            >
              <div className="p-4 bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-2xl transition-all shadow-md group-hover:shadow-blue-500/30">
                <FilePlus className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-800 text-base group-hover:text-blue-600 transition-colors">Create Weekly Report</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">Weekly</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Submit classes taken, hours, syllabus progression, and tests for this week</p>
              </div>
            </button>

            <button 
              onClick={() => onCreateReport('monthly')}
              className="bg-white border-2 border-slate-200 hover:border-indigo-500 p-6 rounded-3xl shadow-sm hover:shadow-xl flex items-center gap-5 text-left transition-all duration-300 group transform hover:-translate-y-0.5"
            >
              <div className="p-4 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white rounded-2xl transition-all shadow-md group-hover:shadow-indigo-500/30">
                <FilePlus className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">Create Monthly Report</h4>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase">Monthly</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Comprehensive aggregation including research, mentoring, FDPs, labs & plans</p>
              </div>
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submission History Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70">
          <div>
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              {currentTab === 'reports' ? 'All Activity Reports' : 'Report Submission History'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Track approvals, view details, and download completed PDF, DOCX, XLSX & PPTX documents</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Month, ID..."
                className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 bg-white w-40 sm:w-48"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Correction Required</option>
            </select>

            <select
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            <button 
              onClick={fetchDashboardData} 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all border border-blue-200/60"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <FolderOpen className="h-12 w-12 mx-auto text-slate-300" />
            <p className="font-bold text-slate-600">No activity reports found.</p>
            <p className="text-xs text-slate-400">
              {history.length === 0 ? 'Click on "Create Weekly Report" or "Create Monthly Report" above to start your first submission.' : 'Try adjusting your search or filter criteria above.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submission Date</th>
                  <th className="p-4">PDF</th>
                  <th className="p-4">Word</th>
                  <th className="p-4">Excel</th>
                  <th className="p-4">PPTX</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHistory.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-400 text-xs">#{report.id}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        report.report_type === 'monthly' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {report.report_type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 text-xs">
                      {report.month} {report.week_number ? `(Week ${report.week_number})` : ''}
                    </td>
                    <td className="p-4">{getStatusBadge(report.status)}</td>
                    <td className="p-4 text-xs font-semibold text-slate-500">
                      {report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4">
                      {report.status === 'Draft' ? (
                        <span className="text-slate-300 text-xs font-semibold">—</span>
                      ) : (
                        <button 
                          onClick={() => handleDownloadPdf(report)}
                          disabled={downloadingKey === `${report.id}-pdf`}
                          className="text-rose-600 hover:text-rose-800 disabled:opacity-50 font-extrabold inline-flex items-center gap-1 text-xs bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg transition-all border border-rose-200/60"
                        >
                          {downloadingKey === `${report.id}-pdf` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} PDF
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      {report.status === 'Draft' ? (
                        <span className="text-slate-300 text-xs font-semibold">—</span>
                      ) : (
                        <button 
                          onClick={() => handleDownloadWord(report)}
                          disabled={downloadingKey === `${report.id}-word`}
                          className="text-blue-600 hover:text-blue-800 disabled:opacity-50 font-extrabold inline-flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-all border border-blue-200/60"
                        >
                          {downloadingKey === `${report.id}-word` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} DOCX
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      {report.status === 'Draft' ? (
                        <span className="text-slate-300 text-xs font-semibold">—</span>
                      ) : (
                        <button 
                          onClick={() => handleDownloadExcel(report)}
                          disabled={downloadingKey === `${report.id}-excel`}
                          className="text-emerald-600 hover:text-emerald-800 disabled:opacity-50 font-extrabold inline-flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-all border border-emerald-200/60"
                        >
                          {downloadingKey === `${report.id}-excel` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCode className="h-3.5 w-3.5" />} XLSX
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      {report.status === 'Draft' ? (
                        <span className="text-slate-300 text-xs font-semibold">—</span>
                      ) : (
                        <button 
                          onClick={() => handleDownloadPptx(report)}
                          disabled={downloadingKey === `${report.id}-ppt`}
                          className="text-amber-600 hover:text-amber-800 disabled:opacity-50 font-extrabold inline-flex items-center gap-1 text-xs bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg transition-all border border-amber-200/60"
                        >
                          {downloadingKey === `${report.id}-ppt` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileCode className="h-3.5 w-3.5" />} PPTX
                        </button>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-1.5">
                      <button 
                        onClick={() => onPreviewReport(report.id)}
                        className="text-slate-600 hover:text-slate-900 p-2 hover:bg-slate-100 rounded-xl inline-flex items-center gap-1 text-xs font-bold transition-colors"
                        title="View Full Preview"
                      >
                        <Eye className="h-4 w-4" /> Preview
                      </button>
                      
                      {(report.status === 'Draft' || report.status === 'Rejected') && (
                        <button 
                          onClick={() => onEditReport(report.id, report.report_type)}
                          className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-xl inline-flex items-center gap-1 text-xs font-bold transition-colors"
                          title="Edit Report"
                        >
                          <Edit3 className="h-4 w-4" /> Edit
                        </button>
                      )}

                      <button 
                        onClick={() => handleDeleteReport(report.id)}
                        disabled={deletingId === report.id}
                        className="text-rose-600 hover:text-rose-800 disabled:opacity-50 p-2 hover:bg-rose-50 rounded-xl inline-flex items-center gap-1 text-xs font-bold transition-colors"
                        title="Delete Report"
                      >
                        {deletingId === report.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
