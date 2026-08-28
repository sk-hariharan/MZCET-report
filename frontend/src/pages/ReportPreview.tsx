import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  FileText,
  FileCode,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
  FlaskConical,
  MessageSquare,
  Paperclip,
  Check,
  Building2,
  UserCheck,
  Trash2,
  Loader2
} from 'lucide-react';
import type { FullReport } from '../types';

interface ReportPreviewProps {
  reportId: number;
  onBack: () => void;
  onEdit?: (id: number, type: 'weekly' | 'monthly') => void;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ reportId, onBack, onEdit }) => {
  const { token, user, apiBaseUrl } = useAuth();
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'activities' | 'research' | 'plans' | 'documents'>('overview');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBaseUrl}/reports/${reportId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Report not found');
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError('Network error fetching report details');
      } finally {
        setLoading(false);
      }
    };

    if (reportId) fetchReport();
  }, [reportId, apiBaseUrl, token]);

  const handleDeleteReport = async () => {
    if (!report) return;
    if (!window.confirm(`Are you sure you want to delete report #${report.id}? This action cannot be undone.`)) {
      return;
    }
    try {
      setIsDeleting(true);
      const res = await fetch(`${apiBaseUrl}/reports/${report.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete report');
      onBack();
    } catch (err: any) {
      alert(`Delete Error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!report) return;
    try {
      setDownloadingFormat('word');
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
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadPptx = async () => {
    if (!report) return;
    try {
      setDownloadingFormat('ppt');
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
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    try {
      setDownloadingFormat('pdf');
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
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleDownloadExcel = async () => {
    if (!report) return;
    try {
      setDownloadingFormat('excel');
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
      alert(`Excel download error: ${err.message}`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-3 py-1 text-xs font-extrabold bg-emerald-500 text-white rounded-full shadow-sm">Approved</span>;
      case 'Rejected':
        return <span className="px-3 py-1 text-xs font-extrabold bg-rose-500 text-white rounded-full shadow-sm">Correction Required</span>;
      case 'Submitted':
      case 'Under Review':
        return <span className="px-3 py-1 text-xs font-extrabold bg-blue-500 text-white rounded-full shadow-sm">Under Review</span>;
      case 'Resubmitted':
        return <span className="px-3 py-1 text-xs font-extrabold bg-indigo-500 text-white rounded-full shadow-sm">Resubmitted</span>;
      default:
        return <span className="px-3 py-1 text-xs font-extrabold bg-slate-500 text-white rounded-full shadow-sm">Draft</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-500 font-bold space-y-3 shadow-sm">
        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p>Loading comprehensive report preview...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="bg-white border border-red-200 rounded-3xl p-12 text-center text-red-600 font-bold space-y-4 shadow-sm">
        <p>{error || 'Report not found'}</p>
        <button onClick={onBack} className="bg-slate-800 text-white px-5 py-2 rounded-xl text-xs">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Top Navigation Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                {report.report_type?.toUpperCase()} Activity Report Preview
              </h2>
              {getStatusBadge(report.status)}
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Report #{report.id} • {report.month} {report.week_number ? `(Week ${report.week_number})` : ''} • AY {report.academic_year} ({report.semester})
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {report.status !== 'Draft' && (
            <>
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingFormat === 'pdf'}
                className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-rose-900/20 transition-all hover:scale-105"
              >
                {downloadingFormat === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} PDF Report
              </button>
              <button
                onClick={handleDownloadWord}
                disabled={downloadingFormat === 'word'}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-900/20 transition-all hover:scale-105"
              >
                {downloadingFormat === 'word' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} Word DOCX
              </button>
              <button
                onClick={handleDownloadExcel}
                disabled={downloadingFormat === 'excel'}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-emerald-900/20 transition-all hover:scale-105"
              >
                {downloadingFormat === 'excel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCode className="h-4 w-4" />} Excel XLSX
              </button>
              <button
                onClick={handleDownloadPptx}
                disabled={downloadingFormat === 'ppt'}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-amber-900/20 transition-all hover:scale-105"
              >
                {downloadingFormat === 'ppt' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCode className="h-4 w-4" />} PPTX
              </button>
            </>
          )}
          {onEdit && (report.status === 'Draft' || report.status === 'Rejected') && (
            <button
              onClick={() => onEdit(report.id, report.report_type)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all"
            >
              Edit Report
            </button>
          )}
          <button
            onClick={handleDeleteReport}
            disabled={isDeleting}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 font-extrabold text-xs py-2.5 px-3.5 rounded-xl border border-rose-200 transition-all"
            title="Delete Report"
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete Report
          </button>
        </div>
      </div>

      {/* College & Faculty Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-7 shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 border border-blue-300/30 flex items-center justify-center text-2xl font-black text-white shadow-lg flex-shrink-0">
            {report.staff_name?.charAt(0) || 'F'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white">{report.staff_name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                {report.staff_code || 'Staff'}
              </span>
            </div>
            <p className="text-xs text-blue-300 font-semibold mt-0.5">
              {report.designation} • {report.department_name}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Qualification: {report.qualification || 'M.E.'} • Specialization: {report.specialization || 'Engineering'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-semibold bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
          <div>
            <span className="text-[10px] uppercase text-slate-400 block font-bold">Reporting Period</span>
            <p className="font-bold text-white">{report.start_date || '—'} to {report.end_date || '—'}</p>
          </div>
          <div className="border-l border-white/10 pl-4">
            <span className="text-[10px] uppercase text-slate-400 block font-bold">Submission Date</span>
            <p className="font-bold text-white">{report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : 'Draft Mode'}</p>
          </div>
        </div>
      </div>

      {/* Review Feedback Alert if Rejected / Approved with comment */}
      {report.review_comments && (
        <div className={`p-5 rounded-2xl border ${report.status === 'Rejected'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
          <div className="flex items-center gap-2 font-bold text-sm mb-1">
            <MessageSquare className="h-4 w-4" />
            <span>HOD Review Feedback ({report.reviewer_name || 'Department Head'})</span>
          </div>
          <p className="text-xs font-medium pl-6">{report.review_comments}</p>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm overflow-x-auto gap-1">
        {[
          { id: 'overview', label: 'Overview & Summary', icon: Building2 },
          { id: 'academics', label: 'Teaching & Attendance', icon: BookOpen },
          { id: 'activities', label: 'Department & Events', icon: Calendar },
          { id: 'research', label: 'Research & FDP', icon: FlaskConical },
          { id: 'plans', label: 'Labs & Future Plans', icon: Briefcase },
          { id: 'documents', label: 'Attachments', icon: Paperclip }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                  : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Teaching Subjects</span>
                <p className="text-2xl font-black text-slate-800 mt-1">{report.teaching_activities?.length || 0}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Classes Handled</span>
                <p className="text-2xl font-black text-blue-600 mt-1">
                  {report.teaching_activities?.reduce((acc, curr) => acc + (curr.classes_taken || 0), 0) || 0}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Events / FDPs</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {(report.events?.length || 0) + (report.fdp_training?.length || 0)}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Research Works</span>
                <p className="text-2xl font-black text-indigo-600 mt-1">{report.research_activities?.length || 0}</p>
              </div>
            </div>

            {/* Overall Remarks */}
            {report.additional_remarks && report.additional_remarks.length > 0 && (
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-3">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Overall Faculty Summary & Remarks</h4>
                {report.additional_remarks.map((r, idx) => (
                  <div key={idx} className="space-y-2 text-xs text-slate-700">
                    {r.overall_summary && <p className="leading-relaxed"><strong className="text-slate-900">Summary:</strong> {r.overall_summary}</p>}
                    {r.major_contributions && <p className="leading-relaxed"><strong className="text-slate-900">Major Contributions:</strong> {r.major_contributions}</p>}
                    {r.suggestions && <p className="leading-relaxed"><strong className="text-slate-900">Suggestions:</strong> {r.suggestions}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACADEMICS & TEACHING */}
        {activeTab === 'academics' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3">Teaching & Syllabus Progression</h4>
              {(!report.teaching_activities || report.teaching_activities.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No teaching activities recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-extrabold border-b">
                        <th className="p-3">Subject</th>
                        <th className="p-3">Class</th>
                        <th className="p-3">Classes Taken</th>
                        <th className="p-3">Hours</th>
                        <th className="p-3">Syllabus %</th>
                        <th className="p-3">Lesson Plan</th>
                        <th className="p-3">Current Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.teaching_activities.map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{t.subject_name}</td>
                          <td className="p-3 font-semibold text-slate-600">
                            {t.class_assigned && t.class_assigned.includes(' | ')
                              ? `${t.class_assigned.split(' | ')[1]} - ${t.class_assigned.split(' | ')[2]} (${t.class_assigned.split(' | ')[0]})`
                              : t.class_assigned}
                          </td>
                          <td className="p-3 font-bold text-blue-600">{t.classes_taken}</td>
                          <td className="p-3 font-semibold">{t.teaching_hours}</td>
                          <td className="p-3 font-extrabold text-emerald-600">{t.syllabus_pct}%</td>
                          <td className="p-3">{t.lesson_plan_status || 'On Track'}</td>
                          <td className="p-3">{t.current_unit || 'Unit 1'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3">Student Attendance & Performance</h4>
              {(!report.student_attendance || report.student_attendance.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No attendance records recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-extrabold border-b">
                        <th className="p-3">Class</th>
                        <th className="p-3">Total Students</th>
                        <th className="p-3">Avg Attendance</th>
                        <th className="p-3">Below 75%</th>
                        <th className="p-3">Class Avg Mark</th>
                        <th className="p-3">Slow Learners</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.student_attendance.map((a, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{a.class_name}</td>
                          <td className="p-3 font-semibold text-slate-600">{a.total_students}</td>
                          <td className="p-3 font-extrabold text-indigo-600">{a.avg_attendance_pct}%</td>
                          <td className="p-3 font-bold text-rose-600">{a.students_below_75 || 0}</td>
                          <td className="p-3 font-semibold">{a.class_average_mark || '—'}</td>
                          <td className="p-3 text-slate-600">{a.slow_learners || 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVITIES & EVENTS */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3">Events Organized & Attended</h4>
              {(!report.events || report.events.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No events recorded.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.events.map((e, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-xs">
                      <p className="font-bold text-slate-900 text-sm">{e.event_name}</p>
                      <p className="text-slate-500 font-medium">Type: {e.event_type || 'Workshop'} • Date: {e.event_date || '—'}</p>
                      <p className="text-slate-600"><strong className="text-slate-800">Role:</strong> {e.role || 'Coordinator'}</p>
                      <p className="text-slate-600"><strong className="text-slate-800">Participants:</strong> {e.students_participated || 0} students</p>
                      {e.outcome && <p className="text-slate-600"><strong className="text-slate-800">Outcome:</strong> {e.outcome}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3">Project Guidance</h4>
              {(!report.project_guidance || report.project_guidance.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No projects recorded.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.project_guidance.map((p, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-xs">
                      <p className="font-bold text-slate-900 text-sm">{p.project_title}</p>
                      <p className="text-slate-600">Students: {p.students_guided || '—'}</p>
                      <div className="flex justify-between font-bold pt-1">
                        <span className="text-blue-600">Progress: {p.progress_pct}%</span>
                        <span className="text-slate-500">Status: {p.completion_status || 'In Progress'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RESEARCH & FDP */}
        {activeTab === 'research' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3">Faculty Development Programs & Workshops</h4>
              {(!report.fdp_training || report.fdp_training.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No FDPs recorded.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.fdp_training.map((f, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-xs">
                      <p className="font-bold text-slate-900 text-sm">{f.program_title}</p>
                      <p className="text-slate-500">{f.organizing_institution || 'MZCET'} • {f.duration || '5 Days'}</p>
                      {f.application_in_teaching && (
                        <p className="text-slate-600 pt-1"><strong className="text-slate-800">Applied in Teaching:</strong> {f.application_in_teaching}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3">Research & Publications</h4>
              {(!report.research_activities || report.research_activities.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No research activities recorded.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.research_activities.map((r, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1 text-xs">
                      <p className="font-bold text-slate-900 text-sm">{r.journal_paper || r.work_done || 'Research Publication'}</p>
                      <p className="text-slate-500">Status: {r.publication_status || 'Submitted'} • Scopus/WoS: {r.scopus_wos ? 'Yes' : 'No'}</p>
                      {r.citation_count ? <p className="text-blue-600 font-bold">Citations: {r.citation_count}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: PLANS & LABS */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider mb-3">Plans for Upcoming Period</h4>
              {(!report.future_plans || report.future_plans.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No future plans recorded.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.future_plans.map((p, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-700">Planned Classes: {p.planned_classes}</span>
                        <span className="text-emerald-600">Target Syllabus: {p.target_syllabus_pct}%</span>
                      </div>
                      {p.assignments_planned && <p className="text-slate-600"><strong className="text-slate-800">Assignments:</strong> {p.assignments_planned}</p>}
                      {p.target_to_achieve && <p className="text-slate-600"><strong className="text-slate-800">Key Milestones:</strong> {p.target_to_achieve}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Attached Verification Documents</h4>
            {(!report.documents || report.documents.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No documents attached.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {report.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="font-bold text-slate-800 truncate">{doc.file_name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
