import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  CheckCircle,
  XOctagon,
  MessageSquare,
  FileText,
  FileCode,
  Calendar,
  GraduationCap,
  BookOpen,
  Briefcase,
  Award,
  FlaskConical,
  Loader2,
  Trash2
} from 'lucide-react';
import type { FullReport } from '../types';

interface ReportReviewModalProps {
  reportId: number;
  onClose: () => void;
  onActionComplete?: (status: string) => void;
}

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  reportId,
  onClose,
  onActionComplete
}) => {
  const { token, user, apiBaseUrl } = useAuth();
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${apiBaseUrl}/reports/${reportId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setReport(data.report);
        } else {
          setError(data.message || 'Failed to load report');
        }
      } catch (err: any) {
        setError('Network error loading report');
      } finally {
        setLoading(false);
      }
    };
    if (reportId) fetchReport();
  }, [reportId, apiBaseUrl, token]);

  const handleDeleteReport = async () => {
    if (!reportId) return;
    if (!window.confirm(`Are you sure you want to delete report #${reportId}? This action cannot be undone.`)) {
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete report');
      if (onActionComplete) onActionComplete('deleted');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (status: 'Approved' | 'Rejected') => {
    if (status === 'Rejected' && !reviewComment.trim()) {
      setError('Rejection requires a feedback comment explaining the corrections needed.');
      return;
    }

    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          review_comments: reviewComment
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');

      if (onActionComplete) onActionComplete(status);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (format: 'word' | 'ppt') => {
    try {
      setActionLoading(true);
      const endpoint = format === 'word' ? 'word' : 'ppt';
      const res = await fetch(`${apiBaseUrl}/reports/${reportId}/${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Report_${reportId}.${format === 'word' ? 'docx' : 'pptx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const renderSection = (title: string, icon: React.ElementType, items: any[] | undefined, renderFn: (item: any, idx: number) => React.ReactNode) => {
    if (!items || items.length === 0) return null;
    const Icon = icon;
    return (
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200/80 flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-blue-600" />
          <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">{title}</h4>
          <span className="ml-auto text-[10px] font-bold text-slate-500 bg-white border px-2 py-0.5 rounded-full">{items.length} entries</span>
        </div>
        <div className="p-4 space-y-3">
          {items.map((item, idx) => renderFn(item, idx))}
        </div>
      </div>
    );
  };

  const renderKeyValue = (label: string, value: any) => {
    if (!value && value !== 0) return null;
    return (
      <div className="flex justify-between text-xs border-b border-slate-100 py-1.5">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="font-bold text-slate-800 text-right max-w-[60%]">{String(value)}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/80 sticky top-0 z-10">
          <div>
            <h2 className="text-base font-black text-slate-900">
              {report ? `${report.report_type?.toUpperCase()} Report Review — ${report.staff_name}` : 'Loading Report...'}
            </h2>
            {report && (
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {report.month} {report.week_number ? `(Week ${report.week_number})` : ''} • {report.academic_year} • {report.semester} Sem
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error && !report ? (
            <div className="text-center text-red-500 font-bold py-12">{error}</div>
          ) : report ? (
            <>
              {/* Staff Profile Card */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-md">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black flex-shrink-0">
                    {report.staff_name?.charAt(0) || 'F'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black truncate">{report.staff_name}</h3>
                    <p className="text-xs text-blue-200 font-semibold">{report.staff_code} • {report.designation} • {report.department_name}</p>
                    <p className="text-xs text-blue-300 mt-0.5">{report.qualification} — {report.specialization}</p>
                  </div>
                </div>
              </div>

              {/* Download Buttons */}
              {report.status !== 'Draft' && (
                <div className="flex gap-2">
                  <button onClick={() => handleDownload('word')} className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs py-2 px-3.5 rounded-xl border border-blue-200 transition-all">
                    <FileText className="h-4 w-4" /> Download Word DOCX
                  </button>
                  <button onClick={() => handleDownload('ppt')} className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-xs py-2 px-3.5 rounded-xl border border-amber-200 transition-all">
                    <FileCode className="h-4 w-4" /> Download PowerPoint PPTX
                  </button>
                </div>
              )}

              {/* Teaching Activities */}
              {renderSection('Teaching & Academic Activities', BookOpen, report.teaching_activities, (t, idx) => (
                <div key={idx} className="bg-slate-50/70 p-3.5 rounded-xl space-y-1 border border-slate-100">
                  <p className="font-bold text-xs text-slate-900">
                    {t.subject_name} —{' '}
                    <span className="text-blue-600 font-semibold">
                      {t.class_assigned && t.class_assigned.includes(' | ')
                        ? `${t.class_assigned.split(' | ')[1]} - ${t.class_assigned.split(' | ')[2]} (${t.class_assigned.split(' | ')[0]})`
                        : t.class_assigned}
                    </span>
                  </p>
                  {renderKeyValue('Classes Taken / Hours', `${t.classes_taken || 0} classes (${t.teaching_hours || 0} hrs)`)}
                  {renderKeyValue('Syllabus Completion', `${t.syllabus_pct || 0}%`)}
                  {renderKeyValue('Lesson Plan Status', t.lesson_plan_status)}
                  {renderKeyValue('Current Unit', t.current_unit)}
                  {renderKeyValue('Teaching Methods', t.teaching_methods)}
                  {t.pending_reason && renderKeyValue('Pending Reason', t.pending_reason)}
                </div>
              ))}

              {/* Student Attendance */}
              {renderSection('Student Attendance & Performance', GraduationCap, report.student_attendance, (a, idx) => (
                <div key={idx} className="bg-slate-50/70 p-3.5 rounded-xl space-y-1 border border-slate-100">
                  <p className="font-bold text-xs text-slate-900">{a.class_name} — <span className="text-slate-500 font-medium">{a.total_students} students</span></p>
                  {renderKeyValue('Average Attendance', `${a.avg_attendance_pct}%`)}
                  {renderKeyValue('Below 75%', a.students_below_75)}
                  {renderKeyValue('Class Average Mark', a.class_average_mark)}
                  {renderKeyValue('Slow / Advanced Learners', `${a.slow_learners || '—'} / ${a.advanced_learners || '—'}`)}
                </div>
              ))}

              {/* Assessments */}
              {renderSection('Assessments & Evaluations', Briefcase, report.assessments, (a, idx) => (
                <div key={idx} className="bg-slate-50/70 p-3.5 rounded-xl space-y-1 border border-slate-100">
                  <p className="font-bold text-xs text-slate-900">{a.assessment_name}</p>
                  {renderKeyValue('Given Date', a.given_date)}
                  {renderKeyValue('Submissions', a.submission_count)}
                  {renderKeyValue('CO-Wise Performance', a.co_wise_performance)}
                </div>
              ))}

              {/* Events */}
              {renderSection('Events Organized / Attended', Calendar, report.events, (e, idx) => (
                <div key={idx} className="bg-slate-50/70 p-3.5 rounded-xl space-y-1 border border-slate-100">
                  <p className="font-bold text-xs text-slate-900">{e.event_name}</p>
                  {renderKeyValue('Type / Date', `${e.event_type || '—'} | ${e.event_date || '—'}`)}
                  {renderKeyValue('Role', e.role)}
                  {renderKeyValue('Students Participated', e.students_participated)}
                  {renderKeyValue('Outcome', e.outcome)}
                </div>
              ))}

              {/* FDP */}
              {renderSection('FDP & Workshops', BookOpen, report.fdp_training, (f, idx) => (
                <div key={idx} className="bg-slate-50/70 p-3.5 rounded-xl space-y-1 border border-slate-100">
                  <p className="font-bold text-xs text-slate-900">{f.program_title}</p>
                  {renderKeyValue('Institution', f.organizing_institution)}
                  {renderKeyValue('Duration / Mode', `${f.duration || '—'} | ${f.mode || '—'}`)}
                  {renderKeyValue('Applied in Teaching', f.application_in_teaching)}
                </div>
              ))}

              {/* Research */}
              {renderSection('Research Activities', FlaskConical, report.research_activities, (r, idx) => (
                <div key={idx} className="bg-slate-50/70 p-3.5 rounded-xl space-y-1 border border-slate-100">
                  <p className="font-bold text-xs text-slate-900">{r.work_done || r.journal_paper || 'Research Entry'}</p>
                  {renderKeyValue('Journal Paper', r.journal_paper)}
                  {renderKeyValue('Status', r.publication_status)}
                  {renderKeyValue('Scopus/WoS Indexed', r.scopus_wos ? 'Yes' : 'No')}
                  {renderKeyValue('Citations', r.citation_count)}
                </div>
              ))}

              {/* Achievements */}
              {renderSection('Achievements & Recognition', Award, report.achievements, (a, idx) => (
                <div key={idx} className="bg-slate-50/70 p-3.5 rounded-xl space-y-1 border border-slate-100">
                  <p className="font-bold text-xs text-slate-900">{a.achievement_title}</p>
                  {renderKeyValue('Level', a.level)}
                  {renderKeyValue('Category', a.category)}
                  {renderKeyValue('Date Received', a.date_received)}
                </div>
              ))}

              {/* Future Plans */}
              {report.future_plans && report.future_plans.length > 0 && (
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-5 py-3 border-b">
                    <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Plans for Next Period</h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {report.future_plans.map((p, idx) => (
                      <div key={idx} className="space-y-1">
                        {renderKeyValue('Planned Classes', p.planned_classes)}
                        {renderKeyValue('Target Syllabus %', `${p.target_syllabus_pct}%`)}
                        {renderKeyValue('Assignments Planned', p.assignments_planned)}
                        {renderKeyValue('Key Targets', p.target_to_achieve)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Documents */}
              {report.documents && report.documents.length > 0 && (
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-5 py-3 border-b">
                    <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Attached Proofs & Documents ({report.documents.length})</h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {report.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl text-xs font-semibold text-slate-800 border">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="truncate">{doc.file_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Action Bar */}
        {report && (user?.role === 'hod' || user?.role === 'admin') && (report.status === 'Submitted' || report.status === 'Resubmitted') && (
          <div className="p-6 border-t bg-slate-50/90 space-y-4 sticky bottom-0">
            {error && (
              <div className="text-rose-600 text-xs font-bold bg-rose-50 border border-rose-200 p-3 rounded-xl">{error}</div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                HOD Review Comment / Feedback <span className="text-slate-400 font-normal">(Required for rejection)</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-800 h-20 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter feedback, commendations, or correction directions for faculty..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAction('Approved')}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-50 active:scale-98"
              >
                <CheckCircle className="h-4 w-4" />
                {actionLoading ? 'Approving...' : 'Approve Report'}
              </button>
              <button
                onClick={() => handleAction('Rejected')}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3.5 rounded-xl shadow-lg shadow-rose-950/20 transition-all disabled:opacity-50 active:scale-98"
              >
                <XOctagon className="h-4 w-4" />
                {actionLoading ? 'Processing...' : 'Request Corrections'}
              </button>
              <button
                onClick={handleDeleteReport}
                disabled={actionLoading}
                className="flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs py-3.5 px-4 rounded-xl border border-rose-200 transition-all disabled:opacity-50"
                title="Delete Report"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        )}

        {report && (!(user?.role === 'hod' || user?.role === 'admin') || (report.status !== 'Submitted' && report.status !== 'Resubmitted')) && (
          <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
            <button
              onClick={handleDeleteReport}
              disabled={actionLoading}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs py-2 px-3.5 rounded-xl border border-rose-200 transition-all disabled:opacity-50"
              title="Delete Report"
            >
              <Trash2 className="h-4 w-4" /> Delete Report
            </button>
            <button onClick={onClose} className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all">
              Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
