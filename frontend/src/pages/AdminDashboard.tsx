import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Users, 
  TrendingUp,
  Search,
  Eye,
  FileCode,
  FileText,
  Download,
  RefreshCw,
  Award,
  Trash2
} from 'lucide-react';
import type { FullReport } from '../types';

interface AdminDashboardProps {
  currentTab?: string;
  onPreviewReport: (id: number) => void;
}

interface AdminDashboardMetrics {
  totalStaff: number;
  totalDepartments: number;
  reportsSubmitted: number;
  reportsPending: number;
  reportsApproved: number;
  reportsRejected: number;
  weeklyReports: number;
  monthlyReports: number;
  avgSyllabus: number;
  avgAttendance: number;
}

interface DepartmentComparison {
  id: number;
  department_name: string;
  staffCount: number;
  reportsCount: number;
  avgSyllabus: number;
  avgAttendance: number;
  eventsCount: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentTab = 'dashboard', onPreviewReport }) => {
  const { token, apiBaseUrl } = useAuth();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [comparisons, setComparisons] = useState<DepartmentComparison[]>([]);
  const [reports, setReports] = useState<FullReport[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active view tab state ('dashboard' | 'reports' | 'analytics')
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'reports' | 'analytics'>('dashboard');

  useEffect(() => {
    if (currentTab === 'reports') {
      setActiveSubTab('reports');
    } else if (currentTab === 'analytics') {
      setActiveSubTab('analytics');
    } else {
      setActiveSubTab('dashboard');
    }
  }, [currentTab]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedAY, setSelectedAY] = useState('2025-2026');
  const [selectedSem, setSelectedSem] = useState('ODD');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get dashboard stats
      const metricsRes = await fetch(`${apiBaseUrl}/analytics/dashboard/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      setMetrics(metricsData.metrics);

      // 2. Get department comparisons
      const compRes = await fetch(`${apiBaseUrl}/analytics/comparison?academic_year=${selectedAY}&semester=${selectedSem}&month=${selectedMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const compData = await compRes.json();
      setComparisons(compData.comparisons || []);

      // 3. Get all reports (with filters)
      let reportsUrl = `${apiBaseUrl}/reports?search=${encodeURIComponent(searchQuery)}`;
      if (selectedDept) reportsUrl += `&department_id=${selectedDept}`;
      if (selectedStatus) reportsUrl += `&status=${selectedStatus}`;

      const reportsRes = await fetch(reportsUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reportsData = await reportsRes.json();
      setReports(reportsData.reports || []);

      // 4. Get departments list
      const deptsRes = await fetch(`${apiBaseUrl}/analytics/comparison`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const deptsData = await deptsRes.json();
      setDepartments(deptsData.comparisons || []);

    } catch (err: any) {
      console.error(err);
      setError('Failed to load administrative configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    // Real-time Live Polling Interval (every 5 seconds)
    const interval = setInterval(() => {
      fetchAdminData();
    }, 5000);
    return () => clearInterval(interval);
  }, [token, searchQuery, selectedDept, selectedStatus, selectedMonth, selectedAY, selectedSem]);

  const handleDeleteReport = async (reportId: number) => {
    if (!window.confirm(`Are you sure you want to delete report #${reportId}? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`${apiBaseUrl}/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete report');
      fetchAdminData();
    } catch (err: any) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  // Exporters for College level summary
  const handleCollegeReportDownload = async (format: 'word' | 'excel' | 'ppt') => {
    try {
      const url = `${apiBaseUrl}/analytics/college-monthly-summary/${format}?academic_year=${selectedAY}&semester=${selectedSem}&month=${selectedMonth}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to generate college summary file');
      }
      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      const extMap: Record<string, string> = { word: 'docx', excel: 'xlsx', ppt: 'pptx' };
      a.download = `MZCET_College_Monthly_Report_${selectedMonth}_${selectedAY}.${extMap[format]}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  // Exporters for Department level summary
  const handleDeptReportDownload = async (deptId: number, deptName: string, format: 'pdf' | 'word' | 'excel' | 'ppt') => {
    try {
      const url = `${apiBaseUrl}/analytics/department-monthly-summary/${format}?department_id=${deptId}&academic_year=${selectedAY}&semester=${selectedSem}&month=${selectedMonth}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to generate department summary file');
      }
      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      const extMap: Record<string, string> = { pdf: 'pdf', word: 'docx', excel: 'xlsx', ppt: 'pptx' };
      a.download = `MZCET_${deptName.replace(/ /g, '_')}_Monthly_Report_${selectedMonth}_${selectedAY}.${extMap[format]}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  const handleDownloadExcel = async (report: FullReport) => {
    try {
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
    }
  };

  const handleDownloadWord = async (report: FullReport) => {
    try {
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
      alert(`Word download error: ${err.message}`);
    }
  };

  const handleDownloadPptx = async (report: FullReport) => {
    try {
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
      alert(`PowerPoint download error: ${err.message}`);
    }
  };

  const handleDownloadPdf = async (report: FullReport) => {
    try {
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
      alert(`PDF download error: ${err.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Submitted':
      case 'Under Review': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-500 font-bold flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
          Loading MZCET Institutional ERP parameters...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-block px-3 py-1 bg-purple-100 border border-purple-200 rounded-full text-[11px] font-bold text-purple-800 uppercase tracking-wider mb-1">
            College Principal / Admin Console
          </div>
          <h2 className="text-xl font-black text-slate-900">MZCET Institutional Admin Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive governance, cross-department comparisons, and institution-wide document generation</p>
        </div>
        
        {/* Aggregated Institutional Exporters */}
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => handleCollegeReportDownload('word')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-3.5 rounded-xl shadow-md shadow-blue-900/20 transition-all hover:scale-105"
          >
            <Download className="h-4 w-4" /> Word Summary
          </button>
          <button 
            onClick={() => handleCollegeReportDownload('excel')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-3.5 rounded-xl shadow-md shadow-emerald-900/20 transition-all hover:scale-105"
          >
            <Download className="h-4 w-4" /> Excel Summary
          </button>
          <button 
            onClick={() => handleCollegeReportDownload('ppt')}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 px-3.5 rounded-xl shadow-md shadow-amber-900/20 transition-all hover:scale-105"
          >
            <Download className="h-4 w-4" /> PPT Summary
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
            activeSubTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Building2 className="h-4 w-4" /> Overview Dashboard
        </button>

        <button
          onClick={() => setActiveSubTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
            activeSubTab === 'reports'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="h-4 w-4" /> All Faculty Reports
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
            activeSubTab === 'reports' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            {reports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
            activeSubTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="h-4 w-4" /> Department Analytics
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Metrics Cards */}
      {metrics && (activeSubTab === 'dashboard' || activeSubTab === 'analytics') && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-1 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Faculty</span>
              <Users className="h-4 w-4" />
            </div>
            <p className="text-3xl font-black text-slate-900">{metrics.totalStaff}</p>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-1 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center text-blue-500">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Submissions</span>
              <Building2 className="h-4 w-4" />
            </div>
            <p className="text-3xl font-black text-blue-600">{metrics.reportsSubmitted}</p>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-1 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center text-emerald-500">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Avg Syllabus</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-3xl font-black text-emerald-600">{metrics.avgSyllabus}%</p>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-1 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center text-indigo-500">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Avg Attendance</span>
              <Award className="h-4 w-4" />
            </div>
            <p className="text-3xl font-black text-indigo-600">{metrics.avgAttendance}%</p>
          </div>
        </div>
      )}

      {/* Global Reports Search & History (Shown First if 'reports' tab is active) */}
      {(activeSubTab === 'reports' || activeSubTab === 'dashboard') && (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-slate-50/70 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-800 text-base">Faculty Submissions Directory</h3>
                <p className="text-xs text-slate-500">Filter through all faculty reports submitted across all college departments</p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                {reports.length} Reports Found
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-medium">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Search className="h-4 w-4" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search staff name or code..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-semibold"
                />
              </div>

              <select className="border border-slate-300 bg-white p-2.5 rounded-xl font-semibold outline-none text-slate-800" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.department_name}</option>
                ))}
              </select>

              <select className="border border-slate-300 bg-white p-2.5 rounded-xl font-semibold outline-none text-slate-800" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Corrections Requested</option>
              </select>

              <button 
                onClick={() => { setSearchQuery(''); setSelectedDept(''); setSelectedStatus(''); }} 
                className="border border-slate-300 hover:bg-slate-100 text-slate-700 p-2.5 rounded-xl font-bold transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No matching faculty reports found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b">
                    <th className="p-4 pl-6">Faculty Name</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Period</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">PDF</th>
                    <th className="p-4">DOCX</th>
                    <th className="p-4">PPTX</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-slate-900">{report.staff_name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{report.staff_code}</p>
                      </td>
                      <td className="p-4 font-semibold text-xs text-slate-500">{report.department_name}</td>
                      <td className="p-4 font-bold text-slate-800 text-xs">{report.month} {report.week_number ? `(W${report.week_number})` : ''}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          report.report_type === 'monthly' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {report.report_type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {report.status === 'Draft' ? '—' : (
                          <button 
                            onClick={() => handleDownloadPdf(report)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/50"
                          >
                            PDF
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        {report.status === 'Draft' ? '—' : (
                          <button 
                            onClick={() => handleDownloadWord(report)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/50"
                          >
                            DOCX
                          </button>
                        )}
                      </td>
                      <td className="p-4">
                        {report.status === 'Draft' ? '—' : (
                          <button 
                            onClick={() => handleDownloadPptx(report)}
                            className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50"
                          >
                            PPTX
                          </button>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right space-x-1">
                        <button 
                          onClick={() => onPreviewReport(report.id)}
                          className="text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-1 text-xs hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <Eye className="h-4 w-4" /> View Details
                        </button>
                        <button 
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-xl inline-flex items-center gap-1 text-xs font-bold transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Department Comparison Table */}
      {(activeSubTab === 'analytics' || activeSubTab === 'dashboard') && (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-slate-50/70 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-black text-slate-800 text-base">Department Comparative Aggregates</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live aggregated syllabus, attendance, and activity completion across all college branches</p>
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <select className="border border-slate-300 bg-white p-2 rounded-xl text-slate-700 outline-none" value={selectedAY} onChange={e => setSelectedAY(e.target.value)}>
                <option value="2025-2026">AY: 2025-2026</option>
                <option value="2026-2027">AY: 2026-2027</option>
              </select>
              <select className="border border-slate-300 bg-white p-2 rounded-xl text-slate-700 outline-none" value={selectedSem} onChange={e => setSelectedSem(e.target.value)}>
                <option value="ODD">Sem: ODD</option>
                <option value="EVEN">Sem: EVEN</option>
              </select>
              <select className="border border-slate-300 bg-white p-2 rounded-xl text-slate-700 outline-none" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {comparisons.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No comparative statistics found for the selected period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b">
                    <th className="p-4 pl-6">Department</th>
                    <th className="p-4">Staff Count</th>
                    <th className="p-4">Approved Reports</th>
                    <th className="p-4">Avg Syllabus %</th>
                    <th className="p-4">Avg Attendance %</th>
                    <th className="p-4">Events</th>
                    <th className="p-4 pr-6 text-right">Department Summary Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {comparisons.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 pl-6 font-bold text-slate-900">{c.department_name}</td>
                      <td className="p-4 font-semibold text-slate-700">{c.staffCount}</td>
                      <td className="p-4 text-blue-600 font-bold">{c.reportsCount}</td>
                      <td className="p-4 font-bold text-emerald-600">{c.avgSyllabus}%</td>
                      <td className="p-4 font-bold text-indigo-600">{c.avgAttendance}%</td>
                      <td className="p-4 font-semibold text-slate-700">{c.eventsCount}</td>
                      <td className="p-4 pr-6 text-right space-x-1.5">
                        <button 
                          onClick={() => handleDeptReportDownload(c.id, c.department_name, 'pdf')}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold inline-flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200/50"
                        >
                          PDF
                        </button>
                        <button 
                          onClick={() => handleDeptReportDownload(c.id, c.department_name, 'word')}
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200/50"
                        >
                          DOCX
                        </button>
                        <button 
                          onClick={() => handleDeptReportDownload(c.id, c.department_name, 'excel')}
                          className="text-emerald-600 hover:text-emerald-800 text-xs font-bold inline-flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/50"
                        >
                          XLSX
                        </button>
                        <button 
                          onClick={() => handleDeptReportDownload(c.id, c.department_name, 'ppt')}
                          className="text-amber-600 hover:text-amber-800 text-xs font-bold inline-flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/50"
                        >
                          PPTX
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
