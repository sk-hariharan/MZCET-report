import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Clock, 
  GraduationCap, 
  TrendingUp,
  Eye,
  RefreshCw,
  Award,
  BookOpen,
  Trash2,
  Search,
  History,
  BarChart3,
  ClipboardCheck,
  FolderOpen,
  Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FullReport } from '../types';

interface HodDashboardProps {
  currentTab?: string;
  onReviewReport: (id: number) => void;
  onPreviewReport: (id: number) => void;
}

interface HodDashboardMetrics {
  totalStaff: number;
  pendingCount: number;
  avgSyllabus: number;
  avgAttendance: number;
}

export const HodDashboard: React.FC<HodDashboardProps> = ({ currentTab, onReviewReport, onPreviewReport }) => {
  const { token, user, apiBaseUrl } = useAuth();
  const [metrics, setMetrics] = useState<HodDashboardMetrics | null>(null);
  const [pendingQueue, setPendingQueue] = useState<FullReport[]>([]);
  const [allReports, setAllReports] = useState<FullReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter controls for Department Reports
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchHodData = async () => {
    try {
      setLoading(true);
      setError(null);

      const deptId = user?.department_id || 1;

      // 1. Fetch HOD department metrics
      const metricsRes = await fetch(`${apiBaseUrl}/analytics/dashboard/hod?department_id=${deptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      setMetrics(metricsData.metrics);

      // 2. Fetch pending reports for department
      const pendingRes = await fetch(`${apiBaseUrl}/reports?status=Submitted&department_id=${deptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pendingData = await pendingRes.json();
      
      const resubmittedRes = await fetch(`${apiBaseUrl}/reports?status=Resubmitted&department_id=${deptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resubmittedData = await resubmittedRes.json();
      
      const mergedPending = [...(pendingData.reports || []), ...(resubmittedData.reports || [])];
      setPendingQueue(mergedPending);

      // 3. Fetch all reports for department (approved/rejected history)
      const allReportsRes = await fetch(`${apiBaseUrl}/reports?department_id=${deptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allReportsData = await allReportsRes.json();
      setAllReports(allReportsData.reports || []);

    } catch (err: any) {
      console.error(err);
      setError('Failed to retrieve HOD dashboard parameters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHodData();
    // Real-time Live Polling Interval (every 5 seconds)
    const interval = setInterval(() => {
      fetchHodData();
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const handleDeleteReport = async (reportId: number) => {
    if (!window.confirm(`Are you sure you want to delete report #${reportId}? This action cannot be undone.`)) {
      return;
    }
    const prevPending = [...pendingQueue];
    const prevAll = [...allReports];
    try {
      setDeletingId(reportId);
      // Optimistic update
      setPendingQueue(prev => prev.filter(r => r.id !== reportId));
      setAllReports(prev => prev.filter(r => r.id !== reportId));

      const res = await fetch(`${apiBaseUrl}/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        setPendingQueue(prevPending);
        setAllReports(prevAll);
        throw new Error(data.message || 'Failed to delete report');
      }
      fetchHodData();
    } catch (err: any) {
      alert(`Delete Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Compile Chart data from approved reports or all submitted
  const chartData = (allReports.length > 0 ? allReports : pendingQueue).map((r) => ({
    name: r.staff_name ? r.staff_name.split(' ')[0] : 'Staff',
    'Syllabus %': r.syllabus_pct || 75,
    'Attendance %': r.avg_attendance_pct || 82,
    Period: r.month
  })).slice(0, 8);

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
      a.download = `StaffReport_${(report.staff_name || 'Staff').replace(/ /g, '_')}_${report.month}_${report.id}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`Word export error: ${err.message}`);
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
      a.download = `StaffReport_${(report.staff_name || 'Staff').replace(/ /g, '_')}_${report.month}_${report.id}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`PowerPoint export error: ${err.message}`);
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
      a.download = `StaffReport_${(report.staff_name || 'Staff').replace(/ /g, '_')}_${report.month}_${report.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`PDF export error: ${err.message}`);
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
      a.download = `StaffReport_${(report.staff_name || 'Staff').replace(/ /g, '_')}_${report.month}_${report.id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`Excel export error: ${err.message}`);
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleDeptSummaryDownload = async (format: 'pdf' | 'word' | 'excel' | 'ppt') => {
    try {
      const deptId = user?.department_id || 1;
      const url = `${apiBaseUrl}/analytics/department-monthly-summary/${format}?department_id=${deptId}&academic_year=2026-2027&semester=ODD&month=August`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to generate department ${format.toUpperCase()} report`);
      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      const extMap: Record<string, string> = { pdf: 'pdf', word: 'docx', excel: 'xlsx', ppt: 'pptx' };
      const cleanDept = (user?.department_name || 'IT').replace(/ /g, '_');
      a.download = `${cleanDept}_Department_Monthly_Report_August_2026.${extMap[format]}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  // Filter all reports based on search & dropdowns
  const filteredAllReports = allReports.filter(report => {
    const matchesQuery = searchQuery === '' || 
      report.staff_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.month?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(report.id).includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.report_type === typeFilter;

    return matchesQuery && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2.5 py-1 text-[11px] font-extrabold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">Approved</span>;
      case 'Rejected':
        return <span className="px-2.5 py-1 text-[11px] font-extrabold bg-rose-50 text-rose-700 rounded-full border border-rose-200">Correction Required</span>;
      case 'Submitted':
        return <span className="px-2.5 py-1 text-[11px] font-extrabold bg-blue-50 text-blue-700 rounded-full border border-blue-200">Submitted</span>;
      case 'Resubmitted':
        return <span className="px-2.5 py-1 text-[11px] font-extrabold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">Resubmitted</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] font-extrabold bg-slate-100 text-slate-600 rounded-full border border-slate-200">{status}</span>;
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500 font-bold flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          Loading department details...
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render Specific Views Based on currentTab
  // -------------------------------------------------------------

  // 1. REVIEW QUEUE TAB
  if (currentTab === 'review_queue') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-7 rounded-3xl border border-blue-700/50 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[11px] font-extrabold uppercase tracking-wider border border-blue-400/20">
              <ClipboardCheck className="h-3.5 w-3.5" /> HOD Review Console
            </div>
            <h2 className="text-2xl font-black text-white">Review Queue & Approvals</h2>
            <p className="text-xs text-blue-200 font-medium">Verify and approve pending weekly & monthly faculty activity submissions</p>
          </div>
          <button 
            onClick={fetchHodData}
            className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-white/10 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Queue ({pendingQueue.length})
          </button>
        </div>

        {/* Pending Queue Cards */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">Submitted Reports Awaiting Action</h3>
              <p className="text-xs text-slate-500 font-medium">Review reports and endorse for college archives</p>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full">
              {pendingQueue.length} Pending
            </span>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <Clock className="h-12 w-12 text-slate-300 mx-auto" />
              <p className="text-base font-extrabold text-slate-700">No pending reports for approval</p>
              <p className="text-xs text-slate-400 font-medium">All submitted faculty reports in your department have been reviewed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingQueue.map((report) => (
                <div key={report.id} className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all space-y-4 bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{report.staff_name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{report.designation} • {report.department_name}</p>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Report Period</span>
                      <span className="font-bold text-slate-700">{report.month} {report.week_number ? `(W${report.week_number})` : ''}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Type</span>
                      <span className="font-bold text-slate-700 uppercase">{report.report_type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                    <button 
                      onClick={() => onReviewReport(report.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm text-center"
                    >
                      Review & Verify
                    </button>
                    <button 
                      onClick={() => onPreviewReport(report.id)}
                      className="p-2.5 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
                      title="View Full Report Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. DEPARTMENT REPORTS TAB
  if (currentTab === 'reports') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-7 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[11px] font-extrabold uppercase tracking-wider border border-blue-400/20">
              <History className="h-3.5 w-3.5" /> Department Archive
            </div>
            <h2 className="text-2xl font-black text-white">Department Reports History</h2>
            <p className="text-xs text-slate-300 font-medium">Browse, search, and export official PDF, DOCX, XLSX & PPTX reports for your department</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => handleDeptSummaryDownload('pdf')} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm">
              Export PDF
            </button>
            <button onClick={() => handleDeptSummaryDownload('word')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm">
              Export Word
            </button>
            <button onClick={() => handleDeptSummaryDownload('excel')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm">
              Export Excel
            </button>
            <button onClick={() => handleDeptSummaryDownload('ppt')} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm">
              Export PPT
            </button>
          </div>
        </div>

        {/* Department Reports Table with Filters */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">All Faculty Activity Submissions</h3>
              <p className="text-xs text-slate-500 font-medium">Departmental repository of past and active reports</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Staff, Month, ID..."
                  className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 bg-white w-48"
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
                <option value="Approved">Approved</option>
                <option value="Submitted">Submitted</option>
                <option value="Rejected">Correction Required</option>
                <option value="Draft">Draft</option>
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

              <button onClick={fetchHodData} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl transition-all border border-blue-200">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>
          </div>

          {filteredAllReports.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-semibold text-sm">
              No department reports found matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b">
                    <th className="p-4 pl-6">Faculty</th>
                    <th className="p-4">Period</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">PDF</th>
                    <th className="p-4">Word</th>
                    <th className="p-4">Excel</th>
                    <th className="p-4">PPTX</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAllReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900">{report.staff_name}</td>
                      <td className="p-4 font-bold text-slate-800 text-xs">{report.month} {report.week_number ? `(W${report.week_number})` : ''}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          report.report_type === 'monthly' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {report.report_type}
                        </span>
                      </td>
                      <td className="p-4">{getStatusBadge(report.status)}</td>
                      <td className="p-4">
                        {report.status === 'Draft' ? (
                          <span className="text-slate-300 text-xs">—</span>
                        ) : (
                          <button onClick={() => handleDownloadPdf(report)} disabled={downloadingKey === `${report.id}-pdf`} className="text-xs font-bold text-rose-600 hover:text-rose-800 disabled:opacity-50 inline-flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200/50">
                            {downloadingKey === `${report.id}-pdf` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} PDF
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        {report.status === 'Draft' ? (
                          <span className="text-slate-300 text-xs">—</span>
                        ) : (
                          <button onClick={() => handleDownloadWord(report)} disabled={downloadingKey === `${report.id}-word`} className="text-xs font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50 inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200/50">
                            {downloadingKey === `${report.id}-word` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} DOCX
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        {report.status === 'Draft' ? (
                          <span className="text-slate-300 text-xs">—</span>
                        ) : (
                          <button onClick={() => handleDownloadExcel(report)} disabled={downloadingKey === `${report.id}-excel`} className="text-xs font-bold text-emerald-600 hover:text-emerald-800 disabled:opacity-50 inline-flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/50">
                            {downloadingKey === `${report.id}-excel` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} XLSX
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        {report.status === 'Draft' ? (
                          <span className="text-slate-300 text-xs">—</span>
                        ) : (
                          <button onClick={() => handleDownloadPptx(report)} disabled={downloadingKey === `${report.id}-ppt`} className="text-xs font-bold text-amber-600 hover:text-amber-800 disabled:opacity-50 inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/50">
                            {downloadingKey === `${report.id}-ppt` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null} PPTX
                          </button>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right space-x-1">
                        <button onClick={() => onPreviewReport(report.id)} className="text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-1 text-xs hover:bg-slate-100 px-2.5 py-1 rounded-xl transition-all">
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <button onClick={() => handleDeleteReport(report.id)} disabled={deletingId === report.id} className="text-rose-600 hover:text-rose-800 disabled:opacity-50 p-1 hover:bg-rose-50 rounded-xl inline-flex items-center gap-1 text-xs font-bold transition-colors" title="Delete Report">
                          {deletingId === report.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
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
  }

  // 3. DEPT ANALYTICS TAB
  if (currentTab === 'analytics') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-7 rounded-3xl border border-indigo-700/50 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[11px] font-extrabold uppercase tracking-wider border border-indigo-400/20">
              <BarChart3 className="h-3.5 w-3.5" /> Academic Analytics
            </div>
            <h2 className="text-2xl font-black text-white">Department Analytics & Insights</h2>
            <p className="text-xs text-indigo-200 font-medium">Faculty progression, syllabus completion metrics, and attendance performance charts</p>
          </div>
          <button onClick={fetchHodData} className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-white/10 shadow-sm">
            <RefreshCw className="h-4 w-4" /> Refresh Analytics
          </button>
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Department Faculty</span>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-black text-slate-800">{metrics.totalStaff}</p>
                <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl"><Users className="h-5 w-5" /></div>
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Reviews</span>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-black text-blue-600">{metrics.pendingCount}</p>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Clock className="h-5 w-5" /></div>
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Syllabus Progress</span>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-black text-emerald-600">{metrics.avgSyllabus}%</p>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="h-5 w-5" /></div>
              </div>
            </div>
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Student Attendance</span>
              <div className="flex justify-between items-end">
                <p className="text-3xl font-black text-indigo-600">{metrics.avgAttendance}%</p>
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><GraduationCap className="h-5 w-5" /></div>
              </div>
            </div>
          </div>
        )}

        {/* Progression Analytics Charts */}
        {chartData.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-800 text-base">Faculty Academic Progression Analytics</h3>
                <p className="text-xs text-slate-500 mt-0.5">Comparison of syllabus completion and average attendance levels across faculty members</p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  <BookOpen className="h-3.5 w-3.5" /> Syllabus %
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                  <Award className="h-3.5 w-3.5" /> Attendance %
                </span>
              </div>
            </div>
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Syllabus %" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Attendance %" fill="#0D9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. DEFAULT OVERVIEW DASHBOARD (currentTab === 'dashboard' or undefined)
  return (
    <div className="space-y-6">
      {/* Welcome & Dept Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-slate-100 p-7 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-block px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-2">
            HOD Department Review Console
          </div>
          <h2 className="text-2xl font-black text-white">Department Head Dashboard</h2>
          <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mt-1">{user?.department_name || 'Department of Information Technology'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => handleDeptSummaryDownload('pdf')} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm">
            Export PDF
          </button>
          <button onClick={() => handleDeptSummaryDownload('word')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm">
            Export Word
          </button>
          <button onClick={() => handleDeptSummaryDownload('excel')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm">
            Export Excel
          </button>
          <button onClick={() => handleDeptSummaryDownload('ppt')} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm">
            Export PPT
          </button>
          <button onClick={fetchHodData} className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all border border-white/10">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Department Faculty</span>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-black text-slate-800">{metrics.totalStaff}</p>
              <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl"><Users className="h-5 w-5" /></div>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Reviews</span>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-black text-blue-600">{metrics.pendingCount}</p>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Clock className="h-5 w-5" /></div>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Syllabus Progress</span>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-black text-emerald-600">{metrics.avgSyllabus}%</p>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp className="h-5 w-5" /></div>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Student Attendance</span>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-black text-indigo-600">{metrics.avgAttendance}%</p>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><GraduationCap className="h-5 w-5" /></div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Queue Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Reports Submitted for Review</h3>
            <p className="text-xs text-slate-500 font-medium">Pending HOD approval or correction verification</p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full">
            {pendingQueue.length} Pending
          </span>
        </div>

        {pendingQueue.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">No pending reports for approval</p>
            <p className="text-xs text-slate-400 font-medium mt-1">All submitted faculty reports have been reviewed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingQueue.map((report) => (
              <div key={report.id} className="border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all space-y-4 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{report.staff_name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{report.designation} • {report.department_name}</p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Report Period</span>
                    <span className="font-bold text-slate-700">{report.month} {report.week_number ? `(W${report.week_number})` : ''}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Type</span>
                    <span className="font-bold text-slate-700 uppercase">{report.report_type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                  <button onClick={() => onReviewReport(report.id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl transition-all shadow-sm text-center">
                    Review & Verify
                  </button>
                  <button onClick={() => onPreviewReport(report.id)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors" title="View Full Report Details">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Charts */}
      {chartData.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="border-b pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-black text-slate-800 text-base">Faculty Academic Progression Analytics</h3>
              <p className="text-xs text-slate-500 mt-0.5">Comparison of syllabus completion and average attendance levels across faculty members</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg"><BookOpen className="h-3.5 w-3.5" /> Syllabus %</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg"><Award className="h-3.5 w-3.5" /> Attendance %</span>
            </div>
          </div>
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Syllabus %" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Attendance %" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* All Department Reports Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">All Department Reports</h3>
            <p className="text-xs text-slate-500 font-medium">History of all faculty submissions in your department</p>
          </div>
        </div>

        {allReports.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-semibold text-sm">
            No records found for this department.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b">
                  <th className="p-4 pl-6">Faculty</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">PDF</th>
                  <th className="p-4">Word</th>
                  <th className="p-4">Excel</th>
                  <th className="p-4">PPTX</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {allReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900">{report.staff_name}</td>
                    <td className="p-4 font-bold text-slate-800 text-xs">{report.month} {report.week_number ? `(W${report.week_number})` : ''}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        report.report_type === 'monthly' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {report.report_type}
                      </span>
                    </td>
                    <td className="p-4">{getStatusBadge(report.status)}</td>
                    <td className="p-4">
                      {report.status === 'Draft' ? <span className="text-slate-300 text-xs">—</span> : <button onClick={() => handleDownloadPdf(report)} className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200/50">PDF</button>}
                    </td>
                    <td className="p-4">
                      {report.status === 'Draft' ? <span className="text-slate-300 text-xs">—</span> : <button onClick={() => handleDownloadWord(report)} className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200/50">DOCX</button>}
                    </td>
                    <td className="p-4">
                      {report.status === 'Draft' ? <span className="text-slate-300 text-xs">—</span> : <button onClick={() => handleDownloadExcel(report)} className="text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/50">XLSX</button>}
                    </td>
                    <td className="p-4">
                      {report.status === 'Draft' ? <span className="text-slate-300 text-xs">—</span> : <button onClick={() => handleDownloadPptx(report)} className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/50">PPTX</button>}
                    </td>
                    <td className="p-4 pr-6 text-right space-x-1">
                      <button onClick={() => onPreviewReport(report.id)} className="text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-1 text-xs hover:bg-slate-100 px-2.5 py-1 rounded-xl transition-all"><Eye className="h-3.5 w-3.5" /> View</button>
                      <button onClick={() => handleDeleteReport(report.id)} className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded-xl inline-flex items-center gap-1 text-xs font-bold transition-colors" title="Delete Report"><Trash2 className="h-3.5 w-3.5" /></button>
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
