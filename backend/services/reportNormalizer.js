/**
 * Single Source of Truth Report Normalizer
 * Normalizes raw report database records into a single standardized data object
 * used by PDF, Word (DOCX), PowerPoint (PPTX), and Excel (XLSX) generators.
 */

export function removeDuplicates(records, keyFields = []) {
  if (!Array.isArray(records)) return [];
  const seen = new Set();
  return records.filter(record => {
    if (!record) return false;
    // Prefer explicit record ID if present
    if (record.id !== undefined && record.id !== null) {
      const idKey = `id:${record.id}`;
      if (seen.has(idKey)) return false;
      seen.add(idKey);
      return true;
    }
    // Fallback to composite key of specified keyFields
    if (keyFields.length > 0) {
      const key = keyFields
        .map(field => String(record[field] || '').trim().toLowerCase())
        .join('|');
      if (!key || key.replace(/\|/g, '') === '') return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }
    return true;
  });
}

/**
 * Normalizes raw weekly attendance summary DB records into { weeks, rows }
 */
export function normalizeAttendanceSummary(rawList) {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return { weeks: [], rows: [] };
  }

  const formatShortDate = (dStr) => {
    if (!dStr) return '';
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}.${month}.${year}`;
  };

  // Group by week_index to build weeks array
  const weekMap = new Map();
  rawList.forEach(item => {
    const idx = item.week_index || 1;
    if (!weekMap.has(idx)) {
      let label = item.week_label;
      if (!label || label.startsWith('Week ')) {
        const sFmt = formatShortDate(item.week_start);
        const eFmt = formatShortDate(item.week_end);
        if (sFmt && eFmt) {
          label = `${sFmt} - ${eFmt}`;
        }
      }
      weekMap.set(idx, {
        startDate: item.week_start || '',
        endDate: item.week_end || '',
        label: label || `Week ${idx}`
      });
    }
  });

  const sortedWeekIndices = Array.from(weekMap.keys()).sort((a, b) => a - b);
  const weeks = sortedWeekIndices.map(idx => weekMap.get(idx));

  // Group by year to build rows array
  const yearMap = new Map();
  rawList.forEach(item => {
    const year = item.year || 'II';
    if (!yearMap.has(year)) {
      yearMap.set(year, new Map());
    }
    const idx = item.week_index || 1;
    yearMap.get(year).set(idx, item.attendance_pct !== undefined && item.attendance_pct !== null ? Number(item.attendance_pct) : null);
  });

  // Custom year ordering (I, II, III, IV, etc.)
  const customYears = Array.from(yearMap.keys());
  const yearOrder = ['I', 'II', 'III', 'IV'];
  customYears.sort((a, b) => {
    const ia = yearOrder.indexOf(a);
    const ib = yearOrder.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  const rows = customYears.map(year => {
    const valMap = yearMap.get(year);
    const attendance = sortedWeekIndices.map(idx => {
      const val = valMap.get(idx);
      return val !== undefined && val !== null ? val : '—';
    });
    return { year, attendance };
  });

  return { weeks, rows };
}

/**
 * Normalizes a raw report database object into the single source of truth structure.
 * @param {Object} report Raw report object from database (db.getReportById)
 * @returns {Object} Normalized report data object
 */
export function normalizeReportData(report) {
  if (!report) {
    throw new Error('normalizeReportData requires a valid report object');
  }

  const departmentName = report.department_name || 'Information Technology';
  const staffName = report.staff_name || 'Faculty Member';
  const staffCode = report.staff_code || '';
  const designation = report.designation || '';
  const academicYear = report.academic_year || '2026-2027';
  const semester = (report.semester || 'ODD').toUpperCase();
  const month = report.month || 'August';
  const weekNumber = report.week_number ? Number(report.week_number) : null;
  const startDate = report.start_date || '';
  const endDate = report.end_date || '';
  const reportingPeriod = startDate && endDate ? `${startDate} to ${endDate}` : month;
  const status = report.status || 'Draft';

  // 1. Teaching Activities (Syllabus Completion)
  const rawTeaching = report.teaching_activities || [];
  const teachingList = removeDuplicates(rawTeaching, ['subject_name', 'class_assigned', 'course_type']);
  
  const theoryItems = teachingList.filter(t => (t.course_type || '').toLowerCase() !== 'laboratory');
  const labItems = teachingList.filter(t => (t.course_type || '').toLowerCase() === 'laboratory');

  const syllabusTheoryHeaders = ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Unit Taken (TLP No./Total TLP)'];
  const syllabusTheoryRows = theoryItems.map(t => [
    `${t.subject_name || 'Subject'}${t.instructor_name ? ' / ' + t.instructor_name : ''}`,
    t.teaching_hours
      ? (String(t.teaching_hours).toLowerCase().includes('hour') ? t.teaching_hours : `${t.teaching_hours} Hours`)
      : `${t.classes_taken || 0} Hours`,
    t.current_unit || `Unit Completion: ${t.syllabus_pct || 0}%`
  ]);

  const syllabusLabHeaders = ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Exp. Completed / Hours taken', 'Remaining Exp. / Hours required'];
  const syllabusLabRows = labItems.map(l => [
    `${l.subject_name || 'Lab Course'}${l.instructor_name ? ' / ' + l.instructor_name : ''}`,
    l.teaching_hours
      ? (String(l.teaching_hours).toLowerCase().includes('hour') ? l.teaching_hours : `${l.teaching_hours} Hours`)
      : `${l.classes_taken || 0} Hours`,
    l.exp_completed || 'Completed',
    l.exp_remaining || 'Remaining'
  ]);

  // 2. Events Organised
  const rawEvents = report.events || [];
  const eventsList = removeDuplicates(rawEvents, ['event_name', 'event_date']);
  const eventsHeaders = ['S.No', 'Date of Event', 'Name of Event', 'Year / Students', 'Internal Coordinator', 'Resource Person Details'];
  const eventsRows = eventsList.map((e, idx) => [
    String(idx + 1),
    e.event_date || '—',
    e.event_name || '—',
    e.students_participated !== undefined && e.students_participated !== null ? String(e.students_participated) : '—',
    e.role || staffName || '—',
    e.description || '—'
  ]);

  // 3. Faculty Participation (FDP / Workshops)
  const rawFdp = report.fdp_training || [];
  const fdpList = removeDuplicates(rawFdp, ['program_title', 'start_date']);
  const facultyFdpHeaders = ['S.No', 'Name of Faculty', 'Date of Event', 'Name of Event', 'Details of Event (Venue)'];
  const facultyFdpRows = fdpList.map((f, idx) => [
    String(idx + 1),
    f.role || staffName || 'Faculty Member',
    f.start_date || '—',
    f.program_title || '—',
    `${f.organizing_institution || ''}${f.mode ? ` (${f.mode})` : ''}`.trim() || '—'
  ]);

  // 4. Faculty Participation (NPTEL Courses)
  const rawAchievements = report.achievements || [];
  const achievements = removeDuplicates(rawAchievements, ['achievement_title', 'description']);
  
  const facultyNptelList = achievements.filter(
    a => a.category === 'Faculty NPTEL' || a.achievement_type === 'NPTEL Course'
  );
  const facultyNptelHeaders = ['S.No', 'Name of Faculty', 'Date (From – To)', 'Name of Course', 'Status / Result'];
  const facultyNptelRows = facultyNptelList.map((fn, idx) => [
    String(idx + 1),
    fn.recognition || staffName || 'Faculty Member',
    fn.date_received || fn.description || '—',
    fn.achievement_title || '—',
    fn.level || 'Registered'
  ]);

  // 5. Student Participation & NPTEL
  const studentPartList = achievements.filter(
    a => a.category === 'Student NPTEL' || a.category === 'Student Event' || a.achievement_type === 'Student NPTEL' || a.achievement_type === 'Student Event'
  );
  const studentPartHeaders = ['S.No', 'Name of Mentor', 'Name of Student', 'Category', 'Name of Course / Event', 'Status / Prize'];
  const studentPartRows = studentPartList.map((sp, idx) => [
    String(idx + 1),
    sp.recognition || staffName || 'Mentor',
    sp.description || 'Student',
    sp.achievement_type === 'Student Event' ? 'Event' : 'NPTEL',
    sp.achievement_title || '—',
    sp.level || 'Registered'
  ]);

  // 6. Research Activity
  const rawResearch = report.research_activities || [];
  const researchList = removeDuplicates(rawResearch, ['journal_paper', 'conference_paper', 'work_done']);
  const researchHeaders = ['Category', 'Name of Faculty', 'Title & Venue Details', 'Status'];
  const researchRows = researchList.map(r => [
    r.work_done || 'Research',
    r.progress_remarks || staffName || 'Faculty Team',
    r.journal_paper || r.conference_paper || r.research_proposal || r.work_done || 'Details',
    r.publication_status || 'In Progress'
  ]);

  // 7. Work Plan (Next Month Department Targets)
  const rawPlans = report.future_plans || [];
  const workPlanList = removeDuplicates(rawPlans, ['particulars', 'sno']);
  const workPlanHeaders = ['S.No', 'Particulars', 'Requirement Target', 'Conducted', 'To be Conducted'];
  const workPlanRows = workPlanList.map((wp, idx) => [
    String(wp.sno || (idx + 1)),
    wp.particulars || wp.target_to_achieve || '—',
    wp.requirement || '—',
    wp.conducted !== undefined && wp.conducted !== null ? String(wp.conducted) : '0',
    wp.to_be_conducted || 'Planned'
  ]);

  // 8. Weekly Attendance Summary (PPT Only)
  const rawAttendance = report.weekly_attendance_summary || [];
  const attendanceSummary = normalizeAttendanceSummary(rawAttendance);

  return {
    reportId: report.id,
    departmentName,
    staffName,
    staffCode,
    designation,
    academicYear,
    semester,
    month,
    weekNumber,
    startDate,
    endDate,
    reportingPeriod,
    status,
    submittedAt: report.submitted_at,
    approvedAt: report.approved_at,
    documents: report.documents || [],
    auditLogs: report.audit_logs || [],

    // Normalized Section Definitions (Headers & Rows)
    sectionTitleA: 'A. Details of Syllabus completion (Theory and Lab)',
    syllabusTheoryTitle: 'Syllabus Completion — Theory Courses',
    syllabusTheoryHeaders,
    syllabusTheoryRows,

    syllabusLabTitle: 'Syllabus Completion — Laboratory Courses',
    syllabusLabHeaders,
    syllabusLabRows,

    sectionTitleB: 'B. Details of events organised (IV/Conference/Workshop/Seminar/Symposium/Other)',
    eventsHeaders,
    eventsRows,

    sectionTitleC1: 'C. Details of Faculty Participation — Workshop / Seminar / FDP',
    facultyFdpHeaders,
    facultyFdpRows,

    sectionTitleC2: 'C. Details of Faculty Participation — NPTEL Course',
    facultyNptelHeaders,
    facultyNptelRows,

    sectionTitleD: 'D. Details of Student Participation & NPTEL',
    studentPartHeaders,
    studentPartRows,

    sectionTitleG: 'G. Details of Research Activity (Publication, Conference, Research proposal)',
    researchHeaders,
    researchRows,

    sectionTitleH: 'H. Work Plan (Next Month Department Targets)',
    workPlanHeaders,
    workPlanRows,

    // Attendance Summary (PPT Only)
    attendanceSummary,

    // Constant for empty section text
    emptySectionText: 'No records submitted for this section.'
  };
}
