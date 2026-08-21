import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  AlertTriangle,
  Upload,
  X,
  FileText,
  Clock,
  BookOpen,
  Calendar,
  Award,
  Users,
  MessageSquare,
  FileSpreadsheet,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ACADEMIC_CURRICULUM, CLASS_ASSIGNED_OPTIONS, WORK_PLAN_DEFAULT_ITEMS, DEPARTMENTS, YEARS, COURSES_DATA } from '../constants/curriculumData';

const parseClassAssigned = (classAssigned: string = '', subjectName: string = '', userDept: string = '') => {
  const parts = classAssigned.split(' | ');
  if (parts.length === 3) {
    return {
      department: parts[0],
      year: parts[1],
      semester: parts[2]
    };
  }

  // Look up in COURSES_DATA if subjectName is present
  if (subjectName) {
    const course = COURSES_DATA.find(
      c => c.full.toUpperCase() === subjectName.toUpperCase() ||
        c.name.toUpperCase() === subjectName.toUpperCase()
    );
    if (course) {
      return {
        department: course.department,
        year: course.year,
        semester: course.semester
      };
    }
  }

  // Fallback keyword parsing
  const normClass = classAssigned.toUpperCase();
  let year = 'II YEAR';
  if (normClass.includes('I YEAR') || normClass.includes('1ST YEAR') || normClass.includes('FIRST YEAR')) {
    year = 'I YEAR';
  } else if (normClass.includes('II YEAR') || normClass.includes('2ND YEAR') || normClass.includes('SECOND YEAR')) {
    year = 'II YEAR';
  } else if (normClass.includes('III YEAR') || normClass.includes('3RD YEAR') || normClass.includes('THIRD YEAR')) {
    year = 'III YEAR';
  } else if (normClass.includes('IV YEAR') || normClass.includes('4TH YEAR') || normClass.includes('FOURTH YEAR')) {
    year = 'IV YEAR';
  }

  let semester = 'Semester 3';
  if (year === 'I YEAR') semester = 'Semester 1';
  else if (year === 'II YEAR') semester = 'Semester 3';
  else if (year === 'III YEAR') semester = 'Semester 5';
  else if (year === 'IV YEAR') semester = 'Semester 7';

  // Specific semester keyword matching
  if (normClass.includes('SEM 1') || normClass.includes('SEMESTER 1')) semester = 'Semester 1';
  else if (normClass.includes('SEM 2') || normClass.includes('SEMESTER 2')) semester = 'Semester 2';
  else if (normClass.includes('SEM 3') || normClass.includes('SEMESTER 3')) semester = 'Semester 3';
  else if (normClass.includes('SEM 4') || normClass.includes('SEMESTER 4')) semester = 'Semester 4';
  else if (normClass.includes('SEM 5') || normClass.includes('SEMESTER 5')) semester = 'Semester 5';
  else if (normClass.includes('SEM 6') || normClass.includes('SEMESTER 6')) semester = 'Semester 6';
  else if (normClass.includes('SEM 7') || normClass.includes('SEMESTER 7')) semester = 'Semester 7';
  else if (normClass.includes('SEM 8') || normClass.includes('SEMESTER 8')) semester = 'Semester 8';

  const department = userDept || 'INFORMATION TECHNOLOGY';

  return { department, year, semester };
};

const isCourseTypeMatching = (courseType: string = '', entryType: string = '') => {
  const normCourseType = (courseType || '').trim().toLowerCase();
  const normEntryType = (entryType || '').trim().toLowerCase();

  if (normEntryType === 'laboratory') {
    return normCourseType === 'practical' || normCourseType === 'integrated';
  } else {
    // Theory mode
    return normCourseType === 'theory' || normCourseType === 'integrated';
  }
};

export const MultiStepReportForm = ({ reportType, onCancel, editReportId = null }) => {
  const { token, user, apiBaseUrl } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dbSaving, setDbSaving] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [reportId, setReportId] = useState(editReportId);

  // Files state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // -------------------------------------------------------------
  // Form State Definitions (Matching Sections A through H)
  // -------------------------------------------------------------

  // 1. Basic Parameters
  const [meta, setMeta] = useState({
    academic_year: user?.academic_year || '2026-2027',
    semester: user?.semester || 'ODD',
    week_number: '',
    month: 'August',
    start_date: '2026-07-06',
    end_date: '2026-08-07',
    date_of_submission: new Date().toISOString().split('T')[0]
  });

  // Section A: Syllabus Completion (Theory & Laboratory)
  const [teaching, setTeaching] = useState([]);

  // Section B: Events Organised
  const [events, setEvents] = useState([]);

  // Section C: Faculty Participation (FDP/Workshops & NPTEL)
  const [fdp, setFdp] = useState([]);
  const [facultyNptel, setFacultyNptel] = useState([]);

  // Section D: Student Participation (Events/Internships & NPTEL)
  const [studentEvents, setStudentEvents] = useState([]);
  const [studentNptel, setStudentNptel] = useState([]);

  // Section E: Academic Feedback - I
  const [feedback, setFeedback] = useState([]);

  // Section F: Class Committee Meeting (CCM)
  const [ccm, setCcm] = useState([]);

  // Section G: Research Activity (Journals, Conferences & Proposals)
  const [researchJournals, setResearchJournals] = useState([]);
  const [researchConferences, setResearchConferences] = useState([]);
  const [researchProposals, setResearchProposals] = useState([]);

  // Section H: Work Plan (Next Month Department Targets)
  const [workPlan, setWorkPlan] = useState(WORK_PLAN_DEFAULT_ITEMS);

  // Agreement checkbox
  const [confirmed, setConfirmed] = useState(false);

  const STEP_TITLES = [
    'Basic Parameters',
    'A. Syllabus Completion',
    'B. Events Organised',
    'C. Faculty Participation',
    'D. Student Participation',
    'E & F. Feedback & CCM',
    'G. Research Activity',
    'H. Work Plan Targets',
    'Upload & Submit'
  ];

  // -------------------------------------------------------------
  // Load Existing Report (If Editing)
  // -------------------------------------------------------------
  useEffect(() => {
    if (editReportId) {
      const fetchReport = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${apiBaseUrl}/reports/${editReportId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const r = data.report;
            setReportId(r.id);
            setMeta({
              academic_year: r.academic_year || '2026-2027',
              semester: r.semester || 'ODD',
              week_number: r.week_number || '',
              month: r.month || 'August',
              start_date: r.start_date || '2026-07-06',
              end_date: r.end_date || '2026-08-07',
              date_of_submission: r.submitted_at ? r.submitted_at.split('T')[0] : new Date().toISOString().split('T')[0]
            });

            // Populate child rows
            if (r.teaching_activities?.length > 0) {
              const loadedActivities = r.teaching_activities.map(act => {
                const parsed = parseClassAssigned(act.class_assigned, act.subject_name, user?.department_name);
                return {
                  ...act,
                  department: parsed.department,
                  year: parsed.year,
                  semester: parsed.semester
                };
              });
              setTeaching(loadedActivities);
            }
            if (r.events?.length > 0) setEvents(r.events);
            if (r.fdp_training?.length > 0) setFdp(r.fdp_training);
            if (r.achievements?.length > 0) {
              setFacultyNptel(r.achievements.filter(a => a.category === 'Faculty NPTEL'));
              setStudentNptel(r.achievements.filter(a => a.category === 'Student NPTEL'));
              setStudentEvents(r.achievements.filter(a => a.category === 'Student Event'));
            }
            if (r.additional_remarks?.length > 0) {
              setFeedback(r.additional_remarks.filter(a => a.type === 'Feedback'));
              setCcm(r.additional_remarks.filter(a => a.type === 'CCM'));
            }
            if (r.research_activities?.length > 0) {
              setResearchJournals(r.research_activities.filter(res => res.work_done === 'Journal'));
              setResearchConferences(r.research_activities.filter(res => res.work_done === 'Conference'));
              setResearchProposals(r.research_activities.filter(res => res.work_done === 'Proposal'));
            }
            if (r.future_plans?.length > 0) {
              setWorkPlan(r.future_plans);
            }
            setUploadedFiles(r.documents || []);
          }
        } catch (error) {
          console.error(error);
          setErrorMsg('Failed to load report data.');
        } finally {
          setLoading(false);
        }
      };
      fetchReport();
    }
  }, [editReportId, token, apiBaseUrl]);

  // -------------------------------------------------------------
  // Validation Helpers
  // -------------------------------------------------------------
  const validateStep = (step) => {
    setErrorMsg(null);
    if (step === 1) {
      if (!meta.start_date || !meta.end_date) {
        setErrorMsg('Please enter both Reporting Start Date and End Date.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 9));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Assemble payload
  const assembleData = (status = 'Draft') => {
    // Transform all sections to database schema format
    const achievementsList = [
      ...facultyNptel.map(fn => ({ achievement_type: 'NPTEL Course', achievement_title: fn.course_name, description: fn.date_range, level: fn.status, category: 'Faculty NPTEL', recognition: fn.faculty_name })),
      ...studentNptel.map(sn => ({ achievement_type: 'Student NPTEL', achievement_title: sn.course_name, description: sn.student_name, level: sn.status, category: 'Student NPTEL', recognition: sn.mentor_name })),
      ...studentEvents.map(se => ({ achievement_type: 'Student Event', achievement_title: se.event_name, description: se.details, level: se.prize, category: 'Student Event', recognition: se.student_name }))
    ];

    const researchList = [
      ...researchJournals.map(rj => ({ work_done: 'Journal', journal_paper: rj.publication_details, publication_status: rj.status, progress_remarks: rj.faculty_name })),
      ...researchConferences.map(rc => ({ work_done: 'Conference', conference_paper: rc.conference_details, publication_status: rc.status, progress_remarks: rc.faculty_name })),
      ...researchProposals.map(rp => ({ work_done: 'Proposal', research_proposal: rp.proposal_title, publication_status: rp.status, progress_remarks: rp.faculty_name }))
    ];

    const remarksList = [
      ...feedback.map(fb => ({ type: 'Feedback', overall_summary: `Class: ${fb.year} | Sub: ${fb.sub_name} | %: ${fb.pct}`, major_contributions: fb.action_taken })),
      ...ccm.map(cc => ({ type: 'CCM', overall_summary: `Class: ${cc.year} | Discussion: ${cc.discussion}`, major_contributions: cc.action_taken }))
    ];

    return {
      report_type: reportType,
      academic_year: meta.academic_year,
      semester: meta.semester,
      week_number: reportType === 'weekly' ? Number(meta.week_number) : null,
      month: meta.month,
      start_date: meta.start_date,
      end_date: meta.end_date,
      status,
      sections: {
        teaching_activities: teaching.map(({ department, year, semester, ...rest }) => ({
          ...rest,
          class_assigned: `${department || ''} | ${year || ''} | ${semester || ''}`
        })),
        events,
        fdp_training: fdp,
        achievements: achievementsList,
        research_activities: researchList,
        additional_remarks: remarksList,
        future_plans: workPlan
      }
    };
  };

  const handleSaveDraft = async () => {
    setErrorMsg(null);
    setDbSaving(true);
    try {
      const payload = assembleData('Draft');
      const method = reportId ? 'PUT' : 'POST';
      const url = reportId ? `${apiBaseUrl}/reports/${reportId}` : `${apiBaseUrl}/reports`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to save draft.');

      setReportId(data.report.id);
      setLastSaved(new Date().toLocaleTimeString());
      alert('Draft saved successfully to system database.');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setDbSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmed) {
      setErrorMsg('Please check the verification confirmation checkbox.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      const payload = assembleData('Submitted');
      const method = reportId ? 'PUT' : 'POST';
      const url = reportId ? `${apiBaseUrl}/reports/${reportId}` : `${apiBaseUrl}/reports`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to submit report.');

      setSuccessReceipt({
        reportId: data.report.id,
        submissionDate: new Date(data.report.submitted_at || Date.now()).toLocaleString(),
        hodName: user?.hod_name || 'Department HOD',
        status: 'Submitted'
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!reportId) {
      alert('Please click "Save Draft" at top right first before attaching files.');
      return;
    }

    setUploadingFile(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('report_id', reportId);

    try {
      const res = await fetch(`${apiBaseUrl}/documents/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setUploadedFiles(prev => [...prev, data.document]);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  // Row Adders
  const addTheoryRow = () => {
    const userDept = user?.department_name ? user.department_name.toUpperCase() : 'INFORMATION TECHNOLOGY';
    setTeaching(prev => [...prev, {
      subject_name: '', class_assigned: `${userDept} | II YEAR | Semester 3`, course_type: 'Theory',
      instructor_name: user?.name || '', teaching_hours: 20, current_unit: 'Unit 1 & 2 Completed',
      syllabus_pct: 40, exp_completed: '', exp_remaining: '',
      department: userDept,
      year: 'II YEAR',
      semester: 'Semester 3'
    }]);
  };

  const addLabRow = () => {
    const userDept = user?.department_name ? user.department_name.toUpperCase() : 'INFORMATION TECHNOLOGY';
    setTeaching(prev => [...prev, {
      subject_name: '', class_assigned: `${userDept} | II YEAR | Semester 3`, course_type: 'Laboratory',
      instructor_name: user?.name || '', teaching_hours: 20, current_unit: '',
      syllabus_pct: 50, exp_completed: 'EX: 6/15', exp_remaining: 'Ex: 8/15',
      department: userDept,
      year: 'II YEAR',
      semester: 'Semester 3'
    }]);
  };

  const addEventRow = () => {
    setEvents(prev => [...prev, {
      event_date: '2026-07-15', event_name: 'WORKSHOP: Hands on networking',
      students_participated: 'IV Year / 29 Students', role: user?.name || 'Mrs. L. Shalini',
      description: 'Dr. P. Rajkumar, Resource Person'
    }]);
  };

  const addFdpRow = () => {
    setFdp(prev => [...prev, {
      program_type: 'FDP', program_title: 'AGENTIC AI SYSTEMS: From LLMs to Tiny Language Models',
      organizing_institution: 'Kalasalingam Academy of Research and Education',
      start_date: '2026-06-22 to 2026-06-26', mode: 'Offline', role: 'Participant'
    }]);
  };

  const addFacultyNptelRow = () => {
    setFacultyNptel(prev => [...prev, {
      faculty_name: user?.name || 'Mrs. R Saraswathi',
      date_range: '20.07.2026 – 09.10.2026',
      course_name: 'Computer Architecture and Organization',
      status: 'Registered'
    }]);
  };

  const addStudentNptelRow = () => {
    setStudentNptel(prev => [...prev, {
      mentor_name: user?.name || 'Mrs A Arifa Banu',
      student_name: '', year: 'III Year', course_name: 'Cloud Computing', status: 'Elite'
    }]);
  };

  // -------------------------------------------------------------
  // Step Content Renderer
  // -------------------------------------------------------------
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" /> Step 1: Basic Report Parameters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label>
                <input type="text" className="w-full bg-slate-100 border p-3 rounded-xl text-slate-700 font-bold" value={user?.department_name || 'Information Technology'} disabled />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Faculty / Staff Name</label>
                <input type="text" className="w-full bg-slate-100 border p-3 rounded-xl text-slate-700 font-bold" value={user?.name || ''} disabled />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Academic Year</label>
                <select className="w-full border p-3 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={meta.academic_year}
                  onChange={e => setMeta({ ...meta, academic_year: e.target.value })}
                >
                  <option value="2026-2027">2026-2027 (Odd Semester)</option>
                  <option value="2025-2026">2025-2026</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Semester</label>
                <select className="w-full border p-3 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={meta.semester}
                  onChange={e => setMeta({ ...meta, semester: e.target.value })}
                >
                  <option value="ODD">ODD Semester</option>
                  <option value="EVEN">EVEN Semester</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reporting Month</label>
                <select className="w-full border p-3 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  value={meta.month}
                  onChange={e => setMeta({ ...meta, month: e.target.value })}
                >
                  {['August', 'July', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reporting Start Date</label>
                <input type="date" className="w-full border p-3 rounded-xl text-slate-800 font-semibold outline-none"
                  value={meta.start_date}
                  onChange={e => setMeta({ ...meta, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reporting End Date</label>
                <input type="date" className="w-full border p-3 rounded-xl text-slate-800 font-semibold outline-none"
                  value={meta.end_date}
                  onChange={e => setMeta({ ...meta, end_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assigned HOD</label>
                <input type="text" className="w-full bg-slate-100 border p-3 rounded-xl text-slate-600 outline-none" value={user?.hod_name || 'HOD - Information Technology'} disabled />
              </div>
            </div>
          </div>
        );

      case 2: // Section A: Syllabus Completion
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between border-b pb-2 gap-2">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" /> Section A: Details of Syllabus completion (Theory & Lab)
                </h3>
                <p className="text-xs text-slate-500">Record theory courses handled & laboratory experiments progress</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={addTheoryRow} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl">
                  <Plus className="h-4 w-4" /> Add Theory Course
                </button>
                <button type="button" onClick={addLabRow} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-xl">
                  <Plus className="h-4 w-4" /> Add Lab Course
                </button>
              </div>
            </div>

            {teaching.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-slate-50 border-2 border-dashed rounded-2xl">
                No syllabus entries added yet. Click "Add Theory Course" or "Add Lab Course" above.
              </div>
            ) : (
              teaching.map((t, idx) => (
                <div key={idx} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 relative">
                  <button type="button" onClick={() => setTeaching(prev => prev.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <select
                      className={`text-[10px] font-black rounded-lg uppercase px-2 py-0.5 border border-slate-200 outline-none cursor-pointer focus:ring-0 ${(t.course_type || 'Theory').toLowerCase() === 'laboratory'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-blue-100 text-blue-700'
                        }`}
                      value={t.course_type || 'Theory'}
                      onChange={e => {
                        const val = e.target.value;
                        const updated = [...teaching];
                        updated[idx].course_type = val;
                        updated[idx].subject_name = ''; // Reset selected course when Entry Type changes
                        setTeaching(updated);
                      }}
                    >
                      <option value="Theory" className="bg-white text-slate-800 font-semibold normal-case">Theory</option>
                      <option value="Laboratory" className="bg-white text-slate-800 font-semibold normal-case">Laboratory</option>
                    </select>
                    <h4 className="font-bold text-slate-800 text-sm">Course Entry #{idx + 1}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Department <span className="text-red-500">*</span></label>
                      <select
                        className="w-full border p-2.5 rounded-xl text-slate-800 font-semibold outline-none bg-white"
                        value={t.department || ''}
                        onChange={e => {
                          const updated = [...teaching];
                          if (updated[idx].department !== e.target.value) {
                            updated[idx].department = e.target.value;
                            updated[idx].year = '';
                            updated[idx].semester = '';
                            updated[idx].subject_name = ''; // Reset dependent fields
                          }
                          setTeaching(updated);
                        }}
                      >
                        <option value="">-- Select Dept --</option>
                        {DEPARTMENTS.map((dept, dIdx) => (
                          <option key={dIdx} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block animate-none">Class Assigned / Year <span className="text-red-500">*</span></label>
                      <select
                        className="w-full border p-2.5 rounded-xl text-slate-800 font-semibold outline-none bg-white"
                        value={t.year || ''}
                        onChange={e => {
                          const updated = [...teaching];
                          if (updated[idx].year !== e.target.value) {
                            updated[idx].year = e.target.value;
                            updated[idx].semester = '';
                            updated[idx].subject_name = ''; // Reset dependent fields
                          }
                          setTeaching(updated);
                        }}
                      >
                        <option value="">-- Select Year --</option>
                        {YEARS.map((yr, yIdx) => (
                          <option key={yIdx} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block animate-none">Semester <span className="text-red-500">*</span></label>
                      <select
                        className="w-full border p-2.5 rounded-xl text-slate-800 font-semibold outline-none bg-white"
                        value={t.semester || ''}
                        disabled={!t.year}
                        onChange={e => {
                          const updated = [...teaching];
                          if (updated[idx].semester !== e.target.value) {
                            updated[idx].semester = e.target.value;
                            updated[idx].subject_name = ''; // Reset dependent fields
                          }
                          setTeaching(updated);
                        }}
                      >
                        <option value="">-- Select Semester --</option>
                        {t.year === 'I YEAR' && (
                          <>
                            <option value="Semester 1">Semester 1</option>
                            <option value="Semester 2">Semester 2</option>
                          </>
                        )}
                        {t.year === 'II YEAR' && (
                          <>
                            <option value="Semester 3">Semester 3</option>
                            <option value="Semester 4">Semester 4</option>
                          </>
                        )}
                        {t.year === 'III YEAR' && (
                          <>
                            <option value="Semester 5">Semester 5</option>
                            <option value="Semester 6">Semester 6</option>
                          </>
                        )}
                        {t.year === 'IV YEAR' && (
                          <>
                            <option value="Semester 7">Semester 7</option>
                            <option value="Semester 8">Semester 8</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block animate-none">Sub. Code & Name <span className="text-red-500">*</span></label>
                      <select
                        className="w-full border p-2.5 rounded-xl text-slate-800 font-semibold outline-none bg-white"
                        value={COURSES_DATA.filter(course =>
                          course.department.toUpperCase() === (t.department || '').toUpperCase() &&
                          course.year.toUpperCase() === (t.year || '').toUpperCase() &&
                          course.semester.toUpperCase() === (t.semester || '').toUpperCase() &&
                          isCourseTypeMatching(course.type, t.course_type)
                        ).some(s => s.full === t.subject_name) ? t.subject_name : (t.subject_name ? 'CUSTOM' : '')}
                        disabled={!t.department || !t.year || !t.semester}
                        onChange={e => {
                          const val = e.target.value;
                          const updated = [...teaching];
                          if (val !== 'CUSTOM') {
                            updated[idx].subject_name = val;
                          } else {
                            updated[idx].subject_name = '';
                          }
                          setTeaching(updated);
                        }}
                      >
                        <option value="">-- Select Course --</option>
                        {COURSES_DATA.filter(course =>
                          course.department.toUpperCase() === (t.department || '').toUpperCase() &&
                          course.year.toUpperCase() === (t.year || '').toUpperCase() &&
                          course.semester.toUpperCase() === (t.semester || '').toUpperCase() &&
                          isCourseTypeMatching(course.type, t.course_type)
                        ).map((course, cIdx) => (
                          <option key={cIdx} value={course.full}>{course.full}</option>
                        ))}
                        <option value="CUSTOM">✏️ Custom Course Name</option>
                      </select>

                      {(!t.subject_name || !COURSES_DATA.filter(course =>
                        course.department.toUpperCase() === (t.department || '').toUpperCase() &&
                        course.year.toUpperCase() === (t.year || '').toUpperCase() &&
                        course.semester.toUpperCase() === (t.semester || '').toUpperCase() &&
                        isCourseTypeMatching(course.type, t.course_type)
                      ).some(s => s.full === t.subject_name)) && (
                          <input type="text" className="w-full border p-2.5 rounded-xl text-slate-800 mt-2 bg-blue-50/50" placeholder="Type custom course code & name..."
                            value={t.subject_name || ''} onChange={e => {
                              const updated = [...teaching];
                              updated[idx].subject_name = e.target.value;
                              setTeaching(updated);
                            }}
                          />
                        )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Course Instructor</label>
                      <input type="text" className="w-full border p-2.5 rounded-xl text-slate-800" placeholder="Instructor Name"
                        value={t.instructor_name || ''} onChange={e => {
                          const updated = [...teaching];
                          updated[idx].instructor_name = e.target.value;
                          setTeaching(updated);
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Total Hours Handled</label>
                      <input type="text" className="w-full border p-2.5 rounded-xl text-slate-800" placeholder="e.g. 20 Hours"
                        value={t.teaching_hours || ''} onChange={e => {
                          const updated = [...teaching];
                          updated[idx].teaching_hours = e.target.value;
                          setTeaching(updated);
                        }}
                      />
                    </div>

                    {t.course_type !== 'Laboratory' ? (
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Unit Taken (TLP No./Total TLP)</label>
                        <input type="text" className="w-full border p-2.5 rounded-xl text-slate-800" placeholder="e.g. Unit 1 & Unit 2 Completed"
                          value={t.current_unit || ''} onChange={e => {
                            const updated = [...teaching];
                            updated[idx].current_unit = e.target.value;
                            setTeaching(updated);
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Exp Completed / Hours Taken</label>
                          <input type="text" className="w-full border p-2.5 rounded-xl text-slate-800" placeholder="e.g. EX: 6/15"
                            value={t.exp_completed || ''} onChange={e => {
                              const updated = [...teaching];
                              updated[idx].exp_completed = e.target.value;
                              setTeaching(updated);
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Remaining Exp / Required</label>
                          <input type="text" className="w-full border p-2.5 rounded-xl text-slate-800" placeholder="e.g. Ex: 8/15"
                            value={t.exp_remaining || ''} onChange={e => {
                              const updated = [...teaching];
                              updated[idx].exp_remaining = e.target.value;
                              setTeaching(updated);
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 3: // Section B: Events Organised
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" /> Section B: Details of Events Organised
                </h3>
                <p className="text-xs text-slate-500">Workshops, Seminars, Conferences, Symposiums organised</p>
              </div>
              <button type="button" onClick={addEventRow} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl">
                <Plus className="h-4 w-4" /> Add Event Record
              </button>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-slate-50 border-2 border-dashed rounded-2xl">
                No event records added. Click "Add Event Record" above.
              </div>
            ) : (
              events.map((ev, idx) => (
                <div key={idx} className="bg-white border rounded-2xl p-5 shadow-sm space-y-4 relative">
                  <button type="button" onClick={() => setEvents(prev => prev.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <h4 className="font-bold text-slate-800 text-sm">Event Record #{idx + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date of Event</label>
                      <input type="text" className="w-full border p-2.5 rounded-xl text-slate-800" placeholder="e.g. 14.07.2026"
                        value={ev.event_date || ''} onChange={e => {
                          const updated = [...events]; updated[idx].event_date = e.target.value; setEvents(updated);
                        }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Name of Event</label>
                      <input type="text" className="w-full border p-2.5 rounded-xl text-slate-800" placeholder="e.g. WORKSHOP: Hands on networking"
                        value={ev.event_name || ''} onChange={e => {
                          const updated = [...events]; updated[idx].event_name = e.target.value; setEvents(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Year / No. of Students Attended</label>
                      <input type="text" className="w-full border p-2.5 rounded-xl text-slate-800" placeholder="e.g. IV Year / 29 Students"
                        value={ev.students_participated || ''} onChange={e => {
                          const updated = [...events]; updated[idx].students_participated = e.target.value; setEvents(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Internal Coordinator</label>
                      <input type="text" className="w-full border p-2.5 rounded-xl text-slate-800" placeholder="Coordinator Name"
                        value={ev.role || ''} onChange={e => {
                          const updated = [...events]; updated[idx].role = e.target.value; setEvents(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Resource Person Details</label>
                      <input type="text" className="w-full border p-2.5 rounded-xl text-slate-800" placeholder="Name, Designation, Company"
                        value={ev.description || ''} onChange={e => {
                          const updated = [...events]; updated[idx].description = e.target.value; setEvents(updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 4: // Section C: Faculty Participation
        return (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" /> Section C: Details of Faculty Participation
              </h3>
              <p className="text-xs text-slate-500 font-medium">Workshops, FDPs, Seminars and Faculty NPTEL Courses</p>
            </div>

            {/* C1: FDP / Workshop */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">C1. Workshop / Seminar / FDP Participation</h4>
                <button type="button" onClick={addFdpRow} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl">
                  <Plus className="h-4 w-4" /> Add FDP / Workshop
                </button>
              </div>

              {fdp.map((f, idx) => (
                <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm space-y-3 relative">
                  <button type="button" onClick={() => setFdp(prev => prev.filter((_, i) => i !== idx))} className="absolute top-3 right-3 text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Faculty Name</label>
                      <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Faculty Name"
                        value={f.role || ''} onChange={e => {
                          const updated = [...fdp]; updated[idx].role = e.target.value; setFdp(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date of Event</label>
                      <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="e.g. 15.06.2026 – 17.06.2026"
                        value={f.start_date || ''} onChange={e => {
                          const updated = [...fdp]; updated[idx].start_date = e.target.value; setFdp(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Name of Event</label>
                      <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="e.g. New Age Teaching"
                        value={f.program_title || ''} onChange={e => {
                          const updated = [...fdp]; updated[idx].program_title = e.target.value; setFdp(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Details (Venue / Organizer)</label>
                      <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="ICT Academy - MZCET"
                        value={f.organizing_institution || ''} onChange={e => {
                          const updated = [...fdp]; updated[idx].organizing_institution = e.target.value; setFdp(updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* C2: NPTEL Courses */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">C2. Faculty NPTEL Courses</h4>
                <button type="button" onClick={addFacultyNptelRow} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl">
                  <Plus className="h-4 w-4" /> Add Faculty NPTEL
                </button>
              </div>

              {facultyNptel.map((fn, idx) => (
                <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm space-y-3 relative">
                  <button type="button" onClick={() => setFacultyNptel(prev => prev.filter((_, i) => i !== idx))} className="absolute top-3 right-3 text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Faculty Name</label>
                      <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Faculty Name"
                        value={fn.faculty_name || ''} onChange={e => {
                          const updated = [...facultyNptel]; updated[idx].faculty_name = e.target.value; setFacultyNptel(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date (From – To)</label>
                      <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="20.07.2026 – 09.10.2026"
                        value={fn.date_range || ''} onChange={e => {
                          const updated = [...facultyNptel]; updated[idx].date_range = e.target.value; setFacultyNptel(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Name of Course</label>
                      <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Computer Architecture"
                        value={fn.course_name || ''} onChange={e => {
                          const updated = [...facultyNptel]; updated[idx].course_name = e.target.value; setFacultyNptel(updated);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status / Result</label>
                      <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Registered / Elite"
                        value={fn.status || ''} onChange={e => {
                          const updated = [...facultyNptel]; updated[idx].status = e.target.value; setFacultyNptel(updated);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5: // Section D: Student Participation
        return (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" /> Section D: Details of Student Participation & NPTEL
              </h3>
              <p className="text-xs text-slate-500">Student Internships, Competitions, and NPTEL Mentoring Records</p>
            </div>

            {/* D1: Student NPTEL */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Student NPTEL Mentoring Details</h4>
                <button type="button" onClick={addStudentNptelRow} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl">
                  <Plus className="h-4 w-4" /> Add Student NPTEL Record
                </button>
              </div>

              {studentNptel.map((sn, idx) => (
                <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                  <button type="button" onClick={() => setStudentNptel(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Mentor Name</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Mentor Name"
                      value={sn.mentor_name || ''} onChange={e => {
                        const updated = [...studentNptel]; updated[idx].mentor_name = e.target.value; setStudentNptel(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Student Name</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Student Name"
                      value={sn.student_name || ''} onChange={e => {
                        const updated = [...studentNptel]; updated[idx].student_name = e.target.value; setStudentNptel(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Year</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="e.g. III Year"
                      value={sn.year || ''} onChange={e => {
                        const updated = [...studentNptel]; updated[idx].year = e.target.value; setStudentNptel(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">NPTEL Course Name</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Cloud Computing"
                      value={sn.course_name || ''} onChange={e => {
                        const updated = [...studentNptel]; updated[idx].course_name = e.target.value; setStudentNptel(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status / Result</label>
                    <select className="w-full border p-2 rounded-lg text-sm bg-white font-semibold"
                      value={sn.status || 'Registered'} onChange={e => {
                        const updated = [...studentNptel]; updated[idx].status = e.target.value; setStudentNptel(updated);
                      }}
                    >
                      <option value="Elite with Silver">🥈 Elite with Silver</option>
                      <option value="Elite">🏆 Elite</option>
                      <option value="Pass">Pass</option>
                      <option value="Payment finished">Payment finished</option>
                      <option value="Registered">Registered</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6: // Section E & F: Feedback & CCM
        return (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" /> Sections E & F: Academic Feedback & Class Committee Meetings (CCM)
              </h3>
              <p className="text-xs text-slate-500">Record feedback statistics and Class Committee Meeting discussions</p>
            </div>

            {/* Academic Feedback */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">E. Details of Academic Feedback - I</h4>
                <button type="button" onClick={() => setFeedback(prev => [...prev, { year: 'III Year', date_day: '2026-07-20', submissions_total: '55/60', remarks: 'Full Stack Web Dev - 92%', action_taken: 'Continued active teaching' }])} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl">
                  <Plus className="h-4 w-4" /> Add Feedback Record
                </button>
              </div>

              {feedback.map((fb, idx) => (
                <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                  <button type="button" onClick={() => setFeedback(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Class Year</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="III Year"
                      value={fb.year || ''} onChange={e => {
                        const updated = [...feedback]; updated[idx].year = e.target.value; setFeedback(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date / Day</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="20.07.2026"
                      value={fb.date_day || ''} onChange={e => {
                        const updated = [...feedback]; updated[idx].date_day = e.target.value; setFeedback(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Submitted / Total</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="58/61"
                      value={fb.submissions_total || ''} onChange={e => {
                        const updated = [...feedback]; updated[idx].submissions_total = e.target.value; setFeedback(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Remarks (Sub / Feedback %)</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="OS / Mrs. Sangeetha - 94%"
                      value={fb.remarks || ''} onChange={e => {
                        const updated = [...feedback]; updated[idx].remarks = e.target.value; setFeedback(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Action Taken</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Action taken"
                      value={fb.action_taken || ''} onChange={e => {
                        const updated = [...feedback]; updated[idx].action_taken = e.target.value; setFeedback(updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* CCM */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">F. Details of Class Committee Meeting (CCM)</h4>
                <button type="button" onClick={() => setCcm(prev => [...prev, { year: 'II Year', date_day: '2026-07-22', discussion: 'Syllabus completion review and extra coaching', action_taken: 'Scheduled remedial classes' }])} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl">
                  <Plus className="h-4 w-4" /> Add CCM Record
                </button>
              </div>

              {ccm.map((cc, idx) => (
                <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                  <button type="button" onClick={() => setCcm(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Year</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="II Year"
                      value={cc.year || ''} onChange={e => {
                        const updated = [...ccm]; updated[idx].year = e.target.value; setCcm(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date / Day</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="22.07.2026"
                      value={cc.date_day || ''} onChange={e => {
                        const updated = [...ccm]; updated[idx].date_day = e.target.value; setCcm(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Discussion during CCM</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Syllabus progress & lab needs"
                      value={cc.discussion || ''} onChange={e => {
                        const updated = [...ccm]; updated[idx].discussion = e.target.value; setCcm(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Action Taken</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Action taken"
                      value={cc.action_taken || ''} onChange={e => {
                        const updated = [...ccm]; updated[idx].action_taken = e.target.value; setCcm(updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 7: // Section G: Research Activity
        return (
          <div className="space-y-6">
            <div className="border-b pb-2">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" /> Section G: Details of Research Activity
              </h3>
              <p className="text-xs text-slate-500">Journal Publications, Conference Presentations, and Funded Proposals</p>
            </div>

            {/* Journals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">G1. Journal Publications</h4>
                <button type="button" onClick={() => setResearchJournals(prev => [...prev, { faculty_name: user?.name || '', publication_details: '', status: 'Submitted' }])} className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl">
                  <Plus className="h-4 w-4" /> Add Journal Record
                </button>
              </div>

              {researchJournals.map((rj, idx) => (
                <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 relative">
                  <button type="button" onClick={() => setResearchJournals(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Faculty Name</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Faculty Name"
                      value={rj.faculty_name || ''} onChange={e => {
                        const updated = [...researchJournals]; updated[idx].faculty_name = e.target.value; setResearchJournals(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Publication Details (Authors, Title, Journal)</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Title & Journal Name"
                      value={rj.publication_details || ''} onChange={e => {
                        const updated = [...researchJournals]; updated[idx].publication_details = e.target.value; setResearchJournals(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status (SCI / Annexure I)</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Submitted / Published"
                      value={rj.status || ''} onChange={e => {
                        const updated = [...researchJournals]; updated[idx].status = e.target.value; setResearchJournals(updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Conferences */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">G2. Conference Presentations</h4>
                <button type="button" onClick={() => setResearchConferences(prev => [...prev, { faculty_name: user?.name || '', conference_details: '', status: 'In Progress' }])} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl">
                  <Plus className="h-4 w-4" /> Add Conference Record
                </button>
              </div>

              {researchConferences.map((rc, idx) => (
                <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 relative">
                  <button type="button" onClick={() => setResearchConferences(prev => prev.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Faculty Name</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Faculty Name"
                      value={rc.faculty_name || ''} onChange={e => {
                        const updated = [...researchConferences]; updated[idx].faculty_name = e.target.value; setResearchConferences(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Conference Details</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Title, Conference & Organizer"
                      value={rc.conference_details || ''} onChange={e => {
                        const updated = [...researchConferences]; updated[idx].conference_details = e.target.value; setResearchConferences(updated);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Status</label>
                    <input type="text" className="w-full border p-2 rounded-lg text-sm" placeholder="Submitted / Presented"
                      value={rc.status || ''} onChange={e => {
                        const updated = [...researchConferences]; updated[idx].status = e.target.value; setResearchConferences(updated);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 8: // Section H: Work Plan Targets
        return (
          <div className="space-y-6">
            <div className="border-b pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-blue-600" /> Section H: Work Plan (Next Month Department Targets)
                </h3>
                <p className="text-xs text-slate-500 font-medium">Review and update status for the 17 Department Work Plan Key Performance Indicators</p>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-2xl shadow-sm bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold uppercase">
                    <th className="p-3 text-center border-b w-12">S.No</th>
                    <th className="p-3 border-b">Particulars</th>
                    <th className="p-3 border-b w-1/3">Requirement Target</th>
                    <th className="p-3 border-b w-32 text-center">Conducted</th>
                    <th className="p-3 border-b w-36 text-center">To be Conducted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {workPlan.map((wp, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-3 text-center font-extrabold text-slate-700">{wp.sno}</td>
                      <td className="p-3 font-bold text-slate-800">{wp.particulars}</td>
                      <td className="p-3 text-slate-600 font-medium">{wp.requirement}</td>
                      <td className="p-2">
                        <input type="text" className="w-full border p-1.5 rounded-lg text-center font-bold text-slate-700 bg-white"
                          value={wp.conducted || ''} onChange={e => {
                            const updated = [...workPlan]; updated[idx].conducted = e.target.value; setWorkPlan(updated);
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <input type="text" className="w-full border p-1.5 rounded-lg text-center font-bold text-blue-700 bg-blue-50/50"
                          value={wp.to_be_conducted || ''} onChange={e => {
                            const updated = [...workPlan]; updated[idx].to_be_conducted = e.target.value; setWorkPlan(updated);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 9: // Document Upload & Submission
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-extrabold text-slate-900 border-b pb-2">Step 9: Supporting Documents Upload & Final Verification Submit</h3>

            {/* File Upload Box */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-4">
              <Upload className="h-10 w-10 text-slate-400 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800">Attach Supporting Documents (Certificates, Attendance Proofs, Photos)</p>
                <p className="text-xs text-slate-500">Supported formats: PDF, DOCX, XLSX, JPG, PNG (Max 10MB)</p>
              </div>
              <input type="file" onChange={handleFileUpload} className="hidden" id="report-file-uploader" disabled={uploadingFile} />
              <label htmlFor="report-file-uploader" className={`inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl cursor-pointer transition-all ${uploadingFile ? 'opacity-50 pointer-events-none' : ''}`}>
                {uploadingFile ? 'Uploading file...' : 'Choose File to Attach'}
              </label>
            </div>

            {/* Uploaded Documents */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white border rounded-2xl p-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Attached Files ({uploadedFiles.length})</h4>
                <div className="space-y-2">
                  {uploadedFiles.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border text-sm text-slate-700">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate font-semibold">{doc.file_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmation Checkbox */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 flex gap-3 items-start">
              <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-1 h-5 w-5 text-blue-600 rounded cursor-pointer" id="submit-confirm-checkbox" />
              <label htmlFor="submit-confirm-checkbox" className="text-xs text-slate-800 leading-relaxed font-semibold cursor-pointer">
                <strong>I verify and endorse that all records provided in Sections A through H represent accurate monthly departmental activity details.</strong>
              </label>
            </div>
          </div>
        );
    }
  };

  if (successReceipt) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-green-200 shadow-xl rounded-3xl p-8 text-center space-y-6">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
          <CheckCircle className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Department Monthly Report Submitted</h2>
          <p className="text-slate-500 text-sm mt-1">Sent to {successReceipt.hodName} for review and approval.</p>
        </div>
        <button onClick={onCancel} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-6 rounded-xl">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Monthly Department Report Builder</h2>
            <p className="text-xs text-slate-500 font-bold">Academic Year 2026-27 (Odd Semester)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && (
            <div className="text-slate-500 text-xs flex items-center gap-1 font-medium bg-slate-50 border px-2.5 py-1.5 rounded-lg">
              <Clock className="h-3.5 w-3.5" /> Auto-saved {lastSaved}
            </div>
          )}
          <button type="button" onClick={handleSaveDraft} disabled={dbSaving} className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all">
            <Save className="h-4 w-4" /> {dbSaving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      {/* Stepper Tabs Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] gap-1">
          {STEP_TITLES.map((st, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(stepNum)}
                className={`flex-1 text-center py-2 px-1 rounded-xl transition-all flex flex-col items-center ${isActive
                  ? 'bg-blue-600 text-white shadow-md font-extrabold'
                  : isCompleted
                    ? 'bg-blue-50 text-blue-700 font-bold hover:bg-blue-100'
                    : 'text-slate-500 hover:bg-slate-50 font-semibold'
                  }`}
              >
                <span className="text-[10px] opacity-80 uppercase tracking-wider">Step {stepNum}</span>
                <span className="text-[11px] truncate max-w-[100px]">{st}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Box */}
      {loading ? (
        <div className="text-center py-12 bg-white border rounded-3xl shadow-sm text-slate-500 font-bold">
          Loading report form...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
          <div>
            {renderStepContent()}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between border-t mt-8 pt-5">
            <button type="button" onClick={handlePrev} disabled={currentStep === 1} className="flex items-center gap-1 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm px-5 py-2.5 rounded-xl disabled:opacity-40 disabled:pointer-events-none transition-all">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            {currentStep < 9 ? (
              <button type="button" onClick={handleNext} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow transition-all">
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="submit" disabled={loading} className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-8 py-3 rounded-xl shadow-lg transition-all">
                {loading ? 'Submitting Report...' : 'Submit Report to HOD'}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
