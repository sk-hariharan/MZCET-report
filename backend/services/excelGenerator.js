import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

// Deduplication helper to prevent repeated records in the same section
function removeDuplicates(records, keyFields) {
  if (!Array.isArray(records)) return [];
  const seen = new Set();
  return records.filter(record => {
    const key = keyFields
      .map(field => String(record[field] || '').trim().toLowerCase())
      .join('|');
    if (!key || key.replace(/\|/g, '') === '') return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Helper to style section titles
function addSectionTitle(worksheet, text) {
  const row = worksheet.addRow([text]);
  worksheet.mergeCells(`A${row.number}:F${row.number}`);
  const cell = row.getCell(1);
  cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF1E3A8A' } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
  row.height = 24;
  worksheet.addRow([]); // Blank line spacing
}

// Helper to style sub-section titles
function addSubSectionTitle(worksheet, text) {
  const row = worksheet.addRow([text]);
  worksheet.mergeCells(`A${row.number}:F${row.number}`);
  const cell = row.getCell(1);
  cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
  row.height = 20;
}

// Helper to add styled table
function addStyledTable(worksheet, headers, rows, numCols = 6) {
  // Header Row
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 24;

  headerRow.eachCell((cell, colNumber) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // MZCET Navy Blue
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  });

  if (!rows || rows.length === 0) {
    const emptyRow = worksheet.addRow(['No records submitted for this section.']);
    const maxColChar = String.fromCharCode(64 + Math.max(headers.length, 1));
    worksheet.mergeCells(`A${emptyRow.number}:${maxColChar}${emptyRow.number}`);
    const emptyCell = emptyRow.getCell(1);
    emptyCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
    emptyCell.alignment = { vertical: 'middle', horizontal: 'center' };
    emptyCell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
    emptyRow.height = 20;
  } else {
    rows.forEach((rowData, idx) => {
      const dataRow = worksheet.addRow(rowData);
      dataRow.height = 20;
      dataRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });
    });
  }

  worksheet.addRow([]); // Blank spacing row after table
}

// Generate Excel Report for Department Monthly Summary (Matches PDF & Word Table Structure)
export async function generateHodMonthlyReportExcel(summary, departmentName = 'Information Technology') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MZCET FacultyReport Portal';
  workbook.lastModifiedBy = 'MZCET FacultyReport Portal';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Monthly Report Summary', {
    pageSetup: { paperSize: 9, orientation: 'landscape' }
  });

  // Set default column widths
  worksheet.columns = [
    { width: 8 },  // Col A: S.No / Category / Code
    { width: 32 }, // Col B: Faculty / Event / Subject
    { width: 28 }, // Col C: Details / Date
    { width: 32 }, // Col D: Title / Venue / Particulars
    { width: 22 }, // Col E: Status / Result / Target
    { width: 22 }  // Col F: Outcome / Remarks / Additional
  ];

  // 1. Institution Header Banner
  const titleRow = worksheet.addRow(['MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY']);
  worksheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);
  const titleCell = titleRow.getCell(1);
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF1E3A8A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleRow.height = 26;

  const subTitleRow = worksheet.addRow(['(An Autonomous Institution) • Approved by AICTE & Affiliated to Anna University']);
  worksheet.mergeCells(`A${subTitleRow.number}:F${subTitleRow.number}`);
  const subTitleCell = subTitleRow.getCell(1);
  subTitleCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
  subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  subTitleRow.height = 18;

  const docTitleRow = worksheet.addRow([`MONTHLY REPORT – ACADEMIC YEAR ${summary?.academic_year || '2026 – 27'} (${(summary?.semester || 'ODD').toUpperCase()} SEMESTER)`]);
  worksheet.mergeCells(`A${docTitleRow.number}:F${docTitleRow.number}`);
  const docTitleCell = docTitleRow.getCell(1);
  docTitleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF1E3A8A' } };
  docTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  docTitleRow.height = 24;

  worksheet.addRow([]); // Spacing

  // 2. Metadata Card Row
  const deptName = summary?.department_name || departmentName;
  const startDate = summary?.start_date || '2026-07-06';
  const endDate = summary?.end_date || '2026-08-07';

  const metaRow = worksheet.addRow([
    'Name of Department:', deptName, '', 'Reporting Period:', `${startDate} to ${endDate}`, ''
  ]);
  worksheet.mergeCells(`B${metaRow.number}:C${metaRow.number}`);
  worksheet.mergeCells(`E${metaRow.number}:F${metaRow.number}`);
  metaRow.height = 22;

  [1, 4].forEach(colIdx => {
    const cell = metaRow.getCell(colIdx);
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cell.alignment = { vertical: 'middle', horizontal: 'right' };
  });

  [2, 5].forEach(colIdx => {
    const cell = metaRow.getCell(colIdx);
    cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  worksheet.addRow([]); // Spacing

  // Extract isolated section arrays with deduplication
  const teachingList = removeDuplicates(summary?.teaching_activities || [], ['subject_name', 'class_assigned']);
  const eventsList = removeDuplicates(summary?.events || [], ['event_date', 'event_name']);
  const fdpList = removeDuplicates(summary?.fdp_training || [], ['start_date', 'program_title']);
  
  const achievements = summary?.achievements || [];
  const facultyNptelList = removeDuplicates(achievements.filter(a => a.category === 'Faculty NPTEL' || a.achievement_type === 'NPTEL Course'), ['achievement_title', 'description']);
  const studentPartList = removeDuplicates(achievements.filter(a => a.category === 'Student NPTEL' || a.category === 'Student Event' || a.achievement_type === 'Student NPTEL' || a.achievement_type === 'Student Event'), ['achievement_title', 'description']);
  
  const researchList = removeDuplicates(summary?.research_activities || [], ['journal_paper', 'conference_paper', 'research_proposal', 'work_done']);
  const workPlanList = removeDuplicates(summary?.future_plans || [], ['particulars', 'sno']);

  // ---------------------------------------------------------
  // Section A. Syllabus Completion (Theory and Lab)
  // ---------------------------------------------------------
  addSectionTitle(worksheet, 'A. Details of Syllabus completion (Theory and Lab)');

  addSubSectionTitle(worksheet, 'Syllabus Completion — Theory Courses');
  const theoryItems = teachingList.filter(t => (t.course_type || '').toLowerCase() !== 'laboratory');
  const theoryHeaders = ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Unit Taken (TLP No./Total TLP)'];
  const theoryRows = theoryItems.map(t => [
    `${t.subject_name || 'Subject'}${t.instructor_name ? ' / ' + t.instructor_name : ''}`,
    t.teaching_hours ? `${t.teaching_hours} Hours` : `${t.classes_taken || 0} Hours`,
    t.current_unit || `Unit Completion: ${t.syllabus_pct || 0}%`
  ]);
  addStyledTable(worksheet, theoryHeaders, theoryRows);

  addSubSectionTitle(worksheet, 'Syllabus Completion — Laboratory Courses');
  const labItems = teachingList.filter(t => (t.course_type || '').toLowerCase() === 'laboratory');
  const labHeaders = ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Exp. Completed / Hours taken', 'Remaining Exp. / Hours required'];
  const labRows = labItems.map(l => [
    `${l.subject_name || 'Lab Course'}${l.instructor_name ? ' / ' + l.instructor_name : ''}`,
    l.teaching_hours ? `${l.teaching_hours} Hours` : `${l.classes_taken || 0} Hours`,
    l.exp_completed || 'Completed',
    l.exp_remaining || 'Remaining'
  ]);
  addStyledTable(worksheet, labHeaders, labRows);

  // ---------------------------------------------------------
  // Section B. Events Organised
  // ---------------------------------------------------------
  addSectionTitle(worksheet, 'B. Details of events organised (IV/Conference/Workshop/Seminar/Symposium/Other)');
  const eventsHeaders = ['S.No', 'Date of Event', 'Name of Event', 'Year / Students', 'Internal Coordinator', 'Resource Person Details'];
  const eventRows = eventsList.map((e, idx) => [
    String(idx + 1),
    e.event_date || '—',
    e.event_name || '—',
    e.students_participated || '—',
    e.role || deptName || '—',
    e.description || '—'
  ]);
  addStyledTable(worksheet, eventsHeaders, eventRows);

  // ---------------------------------------------------------
  // Section C. Faculty Participation — FDP & NPTEL
  // ---------------------------------------------------------
  addSectionTitle(worksheet, 'C. Details of Faculty Participation');

  addSubSectionTitle(worksheet, 'Details of Faculty Participation — Workshop / Seminar / FDP');
  const fdpHeaders = ['S.No', 'Name of Faculty', 'Date of Event', 'Name of Event', 'Details of Event (Venue)'];
  const fdpRows = fdpList.map((f, idx) => [
    String(idx + 1),
    f.role || 'Faculty Member',
    f.start_date || '—',
    f.program_title || '—',
    `${f.organizing_institution || ''} (${f.mode || 'Offline'})`
  ]);
  addStyledTable(worksheet, fdpHeaders, fdpRows);

  addSubSectionTitle(worksheet, 'Details of Faculty Participation — NPTEL Course');
  const fNptelHeaders = ['S.No', 'Name of Faculty', 'Date (From – To)', 'Name of Course', 'Status / Result'];
  const fNptelRows = facultyNptelList.map((fn, idx) => [
    String(idx + 1),
    fn.recognition || 'Faculty Member',
    fn.description || '—',
    fn.achievement_title || '—',
    fn.level || 'Registered'
  ]);
  addStyledTable(worksheet, fNptelHeaders, fNptelRows);

  // ---------------------------------------------------------
  // Section D. Student Participation & NPTEL
  // ---------------------------------------------------------
  addSectionTitle(worksheet, 'D. Details of Student Participation & NPTEL');
  const sNptelHeaders = ['S.No', 'Name of Mentor', 'Name of Student', 'Category', 'Name of Course / Event', 'Status / Prize'];
  const sPartRows = studentPartList.map((sp, idx) => [
    String(idx + 1),
    sp.recognition || 'Mentor',
    sp.description || 'Student',
    sp.achievement_type === 'Student Event' ? 'Event' : 'NPTEL',
    sp.achievement_title || '—',
    sp.level || 'Registered'
  ]);
  addStyledTable(worksheet, sNptelHeaders, sPartRows);

  // ---------------------------------------------------------
  // Section G. Research Activity
  // ---------------------------------------------------------
  addSectionTitle(worksheet, 'G. Details of Research Activity (Publication, Conference, Research proposal)');
  const researchHeaders = ['Category', 'Name of Faculty', 'Title & Venue Details', 'Status'];
  const researchRows = researchList.map(r => [
    r.work_done || 'Research',
    r.progress_remarks || 'IT Faculty Team',
    r.journal_paper || r.conference_paper || r.research_proposal || r.work_done || 'Details',
    r.publication_status || 'In Progress'
  ]);
  addStyledTable(worksheet, researchHeaders, researchRows);

  // ---------------------------------------------------------
  // Section H. Work Plan
  // ---------------------------------------------------------
  addSectionTitle(worksheet, 'H. Work Plan (Next Month Department Targets)');
  const kpiHeaders = ['S.No', 'Particulars', 'Requirement Target', 'Conducted', 'To be Conducted'];
  const workPlanRows = workPlanList.map((wp, idx) => [
    String(wp.sno || (idx + 1)),
    wp.particulars || wp.target_to_achieve || '—',
    wp.requirement || '—',
    wp.conducted || '0',
    wp.to_be_conducted || 'Planned'
  ]);
  addStyledTable(worksheet, kpiHeaders, workPlanRows);

  // Signature Block
  const sigRow = worksheet.addRow(['', '', '', '', 'Signature of HoD:', '___________________________']);
  sigRow.height = 24;
  sigRow.getCell(5).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E3A8A' } };
  sigRow.getCell(6).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E3A8A' } };

  return await workbook.xlsx.writeBuffer();
}

// Generate Excel Report for Individual Staff Activity Report
export async function generateStaffReportExcel(report) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MZCET FacultyReport Portal';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Staff Activity Report', {
    pageSetup: { paperSize: 9, orientation: 'portrait' }
  });

  worksheet.columns = [
    { width: 28 },
    { width: 26 },
    { width: 24 },
    { width: 24 },
    { width: 24 }
  ];

  // Header Title
  const titleRow = worksheet.addRow([`${(report.report_type || 'FACULTY').toUpperCase()} ACTIVITY REPORT`]);
  worksheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
  const titleCell = titleRow.getCell(1);
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF1E3A8A' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleRow.height = 26;

  worksheet.addRow([]);

  // Staff Profile Card
  const profileRows = [
    ['Staff Name:', report.staff_name || 'N/A', 'Staff ID / Code:', report.staff_code || 'N/A', ''],
    ['Department:', report.department_name || 'N/A', 'Designation:', report.designation || 'N/A', ''],
    ['Reporting Period:', `${report.month || ''} ${report.week_number ? '(Week ' + report.week_number + ')' : ''}`, 'Period Dates:', `${report.start_date || 'N/A'} to ${report.end_date || 'N/A'}`, ''],
    ['Academic Year:', report.academic_year || 'N/A', 'Semester & Status:', `${report.semester || 'N/A'} (${report.status || 'Draft'})`, '']
  ];

  profileRows.forEach(r => {
    const row = worksheet.addRow(r);
    row.height = 20;
    [1, 3].forEach(idx => {
      row.getCell(idx).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      row.getCell(idx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    });
    [2, 4].forEach(idx => {
      row.getCell(idx).font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
      row.getCell(idx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    });
  });

  worksheet.addRow([]);

  // Teaching Activities
  addSectionTitle(worksheet, '1. Teaching / Academic Activities');
  const teachingHeaders = ['Subject Handled', 'Class Assigned', 'Taken/Resch/Cancel', 'Teaching Hours', 'Syllabus Comp. %'];
  const teachingRows = (report.teaching_activities || []).map(t => [
    t.subject_name,
    t.class_assigned || '—',
    `${t.classes_taken || 0} / ${t.classes_rescheduled || 0} / ${t.classes_cancelled || 0}`,
    t.teaching_hours,
    `${t.syllabus_pct || 0}%`
  ]);
  addStyledTable(worksheet, teachingHeaders, teachingRows);

  // Student Attendance
  addSectionTitle(worksheet, '2. Student Attendance & Performance');
  const attHeaders = ['Class Name', 'Total Students', 'Avg Attendance %', 'Below 75% Count', 'Class Average Mark'];
  const attRows = (report.student_attendance || []).map(a => [
    a.class_name,
    a.total_students,
    `${a.avg_attendance_pct}%`,
    a.students_below_75,
    a.class_average_mark
  ]);
  addStyledTable(worksheet, attHeaders, attRows);

  // Events
  addSectionTitle(worksheet, '3. Events & Co-Curricular Activities');
  const eventHeaders = ['Event Name', 'Date', 'Type', 'Role', 'Students Participated'];
  const eventRows = (report.events || []).map(e => [
    e.event_name,
    e.event_date,
    e.event_type,
    e.role,
    e.students_participated
  ]);
  addStyledTable(worksheet, eventHeaders, eventRows);

  // Research
  addSectionTitle(worksheet, '4. Research Activities');
  const resHeaders = ['Journal / Conf Paper', 'Research Work Description', 'Status', 'Scopus / WoS', 'Citations'];
  const resRows = (report.research_activities || []).map(r => [
    `${r.journal_paper || ''} ${r.conference_paper || ''}`.trim() || 'N/A',
    r.work_done,
    r.publication_status,
    r.scopus_wos ? 'Yes' : 'No',
    r.citation_count
  ]);
  addStyledTable(worksheet, resHeaders, resRows);

  return await workbook.xlsx.writeBuffer();
}

// Generate Excel Report for College Overall Monthly Summary
export async function generateCollegeSummaryExcel(summary) {
  return await generateHodMonthlyReportExcel(summary, 'Mount Zion Institutional Overall');
}
