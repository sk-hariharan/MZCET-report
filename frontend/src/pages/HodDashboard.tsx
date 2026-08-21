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
  BookOpen
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FullReport } from '../types';

interface HodDashboardProps {
  onReviewReport: (id: number) => void;
  onPreviewReport: (id: number) => void;
}

interface HodDashboardMetrics {
  totalStaff: number;
  pendingCount: number;
  avgSyllabus: number;
  avgAttendance: number;
}

export const HodDashboard: React.FC<HodDashboardProps> = ({ onReviewReport, onPreviewReport }) => {
  const { token, user, apiBaseUrl } = useAuth();
  const [metrics, setMetrics] = useState<HodDashboardMetrics | null>(null);
  const [pendingQueue, setPendingQueue] = useState<FullReport[]>([]);
  const [allReports, setAllReports] = useState<FullReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Compile Chart data from approved reports or all submitted
  const chartData = (allReports.length > 0 ? allReports : pendingQueue).map((r) => ({
    name: r.staff_name ? r.staff_name.split(' ')[0] : 'Staff',
    'Syllabus %': r.syllabus_pct || 75,
    'Attendance %': r.avg_attendance_pct || 82,
    Period: r.month
  })).slice(0, 8);

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
      alert(`Word export error: ${err.message}`);
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
      alert(`PowerPoint export error: ${err.message}`);
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
      alert(`PDF export error: ${err.message}`);
    }
  };

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
          Loading department dashboard details...
        </div>
      </div>
    );
  }

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
        <button 
          onClick={fetchHodData}
          className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all border border-white/10 backdrop-blur-md"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
        </button>
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
              <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Reviews</span>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-black text-blue-600">{metrics.pendingCount}</p>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Syllabus Progress</span>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-black text-emerald-600">{metrics.avgSyllabus}%</p>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg Student Attendance</span>
            <div className="flex justify-between items-end">
              <p className="text-3xl font-black text-indigo-600">{metrics.avgAttendance}%</p>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Queue */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/70 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-800 text-base">Pending Submissions Review Queue ({pendingQueue.length})</h3>
            <p className="text-xs text-slate-500 mt-0.5">Inspect faculty reports, provide structured review comments, and approve or reject submissions</p>
          </div>
          {pendingQueue.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 animate-pulse">
              Action Needed
            </span>
          )}
        </div>

        {pendingQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm space-y-1">
            <p className="font-bold text-slate-600">All submissions up to date!</p>
            <p className="text-xs">No pending reports awaiting your review at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b">
                  <th className="p-4 pl-6">Faculty Name</th>
                  <th className="p-4">Report Type</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4 pr-6 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pendingQueue.map((report) => (
                  <tr key={report.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-extrabold text-slate-900">{report.staff_name}</p>
                      <p className="text-[10px] font-bold text-slate-400">{report.staff_code || 'Faculty'}</p>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        report.report_type === 'monthly' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {report.report_type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 text-xs">{report.month} {report.week_number ? `(W${report.week_number})` : ''}</td>
                    <td className="p-4">{getStatusBadge(report.status)}</td>
                    <td className="p-4 text-xs font-semibold text-slate-500">{report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : '—'}</td>
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={() => onReviewReport(report.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2 px-4 rounded-xl shadow-md shadow-blue-900/20 transition-all hover:scale-105 active:scale-95"
                      >
                        Review & Action
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Department Reports History */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/70">
          <h3 className="font-black text-slate-800 text-base">Department Reports Directory</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Listing of all reports created in this department with direct Word & PPTX export</p>
        </div>

        {allReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No reports found in department history.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b">
                  <th className="p-4 pl-6">Faculty</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">PDF Report</th>
                  <th className="p-4">Word DOCX</th>
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
                      {report.status === 'Draft' ? (
                        <span className="text-slate-300 text-xs">—</span>
                      ) : (
                        <button 
                          onClick={() => handleDownloadPdf(report)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/50"
                        >
                          PDF
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      {report.status === 'Draft' ? (
                        <span className="text-slate-300 text-xs">—</span>
                      ) : (
                        <button 
                          onClick={() => handleDownloadWord(report)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/50"
                        >
                          DOCX
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      {report.status === 'Draft' ? (
                        <span className="text-slate-300 text-xs">—</span>
                      ) : (
                        <button 
                          onClick={() => handleDownloadPptx(report)}
                          className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50"
                        >
                          PPTX
                        </button>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={() => onPreviewReport(report.id)}
                        className="text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-1 text-xs hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Eye className="h-4 w-4" /> View Details
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
