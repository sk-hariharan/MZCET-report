import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

// Helper: Try to read header logo image as Base64 for PPTX embedding
function getLogoBase64(filename = 'pdf word top logo.png') {
  const logoPaths = [
    'c:\\Users\\HARIHARAN S\\OneDrive\\Desktop\\Report-Automation\\frontend\\public\\' + filename,
    'c:\\Users\\HARIHARAN S\\OneDrive\\Desktop\\Report-Automation\\' + filename,
    path.resolve(`frontend/public/${filename}`),
    path.resolve(`public/${filename}`),
    path.resolve(filename),
    path.resolve(`backend/${filename}`)
  ];

  for (const logoPath of logoPaths) {
    if (fs.existsSync(logoPath)) {
      try {
        const fileBuffer = fs.readFileSync(logoPath);
        const ext = path.extname(logoPath).toLowerCase() === '.png' ? 'png' : 'jpeg';
        return `data:image/${ext};base64,${fileBuffer.toString('base64')}`;
      } catch (err) {
        console.error(`Error reading ${filename} for PPTX:`, err);
      }
    }
  }
  return null;
}

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

// Master slide setup helper for 16:9 widescreen (10.0 x 5.625 inches)
function applySlideMaster(slide, title, departmentName = 'Information Technology') {
  slide.background = { fill: 'F8FAFC' };

  // Top header bar (navy blue) - Width: 10.0 in, Height: 0.75 in
  slide.addShape('rect', {
    x: 0, y: 0, w: 10.0, h: 0.75,
    fill: '1E3A8A'
  });

  // Slide Title (White text in header)
  slide.addText(title, {
    x: 0.4, y: 0.1, w: 9.2, h: 0.55,
    color: 'FFFFFF', fontSize: 13, bold: true, align: 'left', wrap: true
  });

  // Footer bar line
  slide.addShape('line', {
    x: 0.4, y: 5.15, w: 9.2, h: 0,
    line: { color: '1E3A8A', width: 1 }
  });

  // Footer text
  slide.addText(`Mount Zion College of Engineering and Technology | Dept of ${departmentName} | Monthly Report`, {
    x: 0.4, y: 5.22, w: 9.2, h: 0.3,
    fontSize: 8, color: '64748B'
  });
}

// Create slide tables helper with exact 9.2 in total width
function addSlideTable(slide, headers, rows, colWidths = null, yPos = 0.9) {
  const finalRows = (!rows || rows.length === 0)
    ? [[ { text: 'No records submitted for this section.', options: { colspan: headers.length, fill: 'FFFFFF', color: '64748B', italic: true, align: 'center', fontSize: 8.5 } } ]]
    : rows.map(row => row.map(cell => ({
        text: String(cell !== undefined && cell !== null ? cell : '—'),
        options: { fill: 'FFFFFF', color: '1E293B', align: 'center', fontSize: 7.5 }
      })));

  const tableData = [
    headers.map(h => ({
      text: h,
      options: { fill: '1E3A8A', color: 'FFFFFF', bold: true, align: 'center', fontSize: 8.5 }
    })),
    ...finalRows
  ];

  const totalWidth = 9.2;
  const widths = colWidths || Array(headers.length).fill(totalWidth / headers.length);

  slide.addTable(tableData, {
    x: 0.4, y: yPos, w: totalWidth,
    border: { type: 'solid', color: 'CBD5E1', width: 0.5 },
    colW: widths,
    margin: 2
  });
}

// Main PPTX Generator for Department Monthly Reports (Sections A - H)
export async function generatePptx(summary, departmentName = 'Information Technology') {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9'; // 10.0 in x 5.625 in

  const deptToDisplay = summary?.department_name || departmentName;

  // ==========================================
  // SLIDE 1: Title Slide
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { fill: 'F8FAFC' };

  // Top Accent Strip
  slide1.addShape('rect', {
    x: 0, y: 0, w: 10.0, h: 0.1,
    fill: '1E3A8A'
  });

  // College Header Logo Banner
  const topLogo = getLogoBase64('pdf word top logo.png') || getLogoBase64('mzcet-logo.png');
  if (topLogo) {
    slide1.addImage({
      data: topLogo,
      x: 1.0, y: 0.25, w: 8.0, h: 0.95
    });
  }

  // Separator Line
  slide1.addShape('rect', {
    x: 0.75, y: 1.3, w: 8.5, h: 0.03,
    fill: '1E3A8A'
  });

  // Document Title Hero Card
  slide1.addShape('rect', {
    x: 0.75, y: 1.45, w: 8.5, h: 1.15,
    fill: '1E3A8A', line: { color: '1D4ED8', width: 1 }
  });

  slide1.addText('MONTHLY PERFORMANCE & ACADEMIC REPORT', {
    x: 0.85, y: 1.58, w: 8.3, h: 0.45,
    color: 'FFFFFF', fontSize: 17, bold: true, align: 'center', wrap: true
  });

  slide1.addText('ACADEMIC YEAR 2026 – 2027 (ODD SEMESTER)', {
    x: 0.85, y: 2.1, w: 8.3, h: 0.35,
    color: '93C5FD', fontSize: 12, bold: true, align: 'center'
  });

  // Information Card Container
  slide1.addShape('rect', {
    x: 1.2, y: 2.8, w: 7.6, h: 2.1,
    fill: 'FFFFFF', line: { color: 'CBD5E1', width: 1 }
  });

  slide1.addShape('rect', {
    x: 1.2, y: 2.8, w: 0.15, h: 2.1,
    fill: '1E3A8A'
  });

  slide1.addText([
    { text: 'Name of the Department : ', options: { bold: true, color: '1E3A8A', fontSize: 11.5 } },
    { text: `${deptToDisplay}\n\n`, options: { bold: true, color: '0F172A', fontSize: 11.5 } },
    { text: 'Reporting Period Date   : ', options: { bold: true, color: '1E3A8A', fontSize: 11.5 } },
    { text: `${summary?.start_date || '06.07.2026'} to ${summary?.end_date || '07.08.2026'}\n\n`, options: { color: '334155', fontSize: 11.5 } },
    { text: 'Institution Status            : ', options: { bold: true, color: '1E3A8A', fontSize: 11.5 } },
    { text: 'Autonomous Institution (NAAC A+ Grade)', options: { color: '334155', fontSize: 11.5 } }
  ], {
    x: 1.55, y: 2.98, w: 7.0, h: 1.7,
    align: 'left', lineSpacing: 18
  });

  // Bottom Footer
  slide1.addShape('line', {
    x: 0.5, y: 5.15, w: 9.0, h: 0,
    line: { color: 'CBD5E1', width: 1 }
  });

  slide1.addText('Mount Zion College of Engineering and Technology — Autonomous Institution', {
    x: 0.5, y: 5.25, w: 9.0, h: 0.3,
    fontSize: 8.5, color: '64748B', align: 'center'
  });

  // Extract isolated section arrays with deduplication
  const teachingList = removeDuplicates(summary?.teaching_activities || [], ['subject_name', 'class_assigned']);
  const eventsList = removeDuplicates(summary?.events || [], ['event_date', 'event_name']);
  const fdpList = removeDuplicates(summary?.fdp_training || [], ['start_date', 'program_title']);
  
  const achievements = summary?.achievements || [];
  const facultyNptelList = removeDuplicates(achievements.filter(a => a.category === 'Faculty NPTEL' || a.achievement_type === 'NPTEL Course'), ['achievement_title', 'description']);
  const studentPartList = removeDuplicates(achievements.filter(a => a.category === 'Student NPTEL' || a.category === 'Student Event' || a.achievement_type === 'Student NPTEL' || a.achievement_type === 'Student Event'), ['achievement_title', 'description']);
  
  const researchList = removeDuplicates(summary?.research_activities || [], ['journal_paper', 'conference_paper', 'research_proposal', 'work_done']);
  const workPlanList = removeDuplicates(summary?.future_plans || [], ['particulars', 'sno']);

  // ==========================================
  // SLIDE 2: Section A - Syllabus Completion
  // ==========================================
  const slide2 = pptx.addSlide();
  applySlideMaster(slide2, 'A. Syllabus Completion (Theory & Laboratory)', deptToDisplay);

  const syllabusRows = teachingList.map((t, idx) => [
    String(idx + 1),
    `${t.subject_name || 'Subject'}${t.instructor_name ? ' / ' + t.instructor_name : ''}`,
    t.class_assigned || '—',
    t.teaching_hours ? `${t.teaching_hours} Hours` : `${t.classes_taken || 0} Hours`,
    t.current_unit || `${t.syllabus_pct || 0}% Completed`
  ]);

  addSlideTable(slide2, ['S.No', 'Course Name & Instructor', 'Class Assigned', 'Hours Handled', 'Completion Status'], syllabusRows, [0.6, 3.6, 1.8, 1.4, 1.8]);

  // ==========================================
  // SLIDE 3: Section B - Events Organised
  // ==========================================
  const slide3 = pptx.addSlide();
  applySlideMaster(slide3, 'B. Details of Events Organised', deptToDisplay);

  const eventRows = eventsList.map((e, idx) => [
    String(idx + 1),
    e.event_date || '—',
    e.event_name || '—',
    e.students_participated || '—',
    e.role || summary?.staff_name || '—',
    e.description || '—'
  ]);

  addSlideTable(slide3, ['S.No', 'Date', 'Event Name', 'Attendance', 'Coordinator', 'Resource Person Details'], eventRows, [0.5, 1.1, 2.6, 1.2, 1.8, 2.0]);

  // ==========================================
  // SLIDE 4: Section C - Faculty Participation
  // ==========================================
  const slide4 = pptx.addSlide();
  applySlideMaster(slide4, 'C. Details of Faculty Participation (FDP & Workshops)', deptToDisplay);

  const fdpRows = fdpList.map((f, idx) => [
    String(idx + 1),
    f.role || summary?.staff_name || 'Faculty Member',
    f.start_date || '—',
    f.program_title || '—',
    `${f.organizing_institution || ''} (${f.mode || 'Offline'})`
  ]);

  addSlideTable(slide4, ['S.No', 'Faculty Name', 'Date', 'Event Name', 'Venue / Organizer'], fdpRows, [0.5, 2.2, 1.4, 2.6, 2.5]);

  // ==========================================
  // SLIDE 5: Section C - Faculty NPTEL Courses
  // ==========================================
  const slide5 = pptx.addSlide();
  applySlideMaster(slide5, 'C. Faculty NPTEL Courses', deptToDisplay);

  const fnptelRows = facultyNptelList.map((fn, idx) => [
    String(idx + 1),
    fn.recognition || summary?.staff_name || 'Faculty Member',
    fn.description || '—',
    fn.achievement_title || '—',
    fn.level || 'Registered'
  ]);

  addSlideTable(slide5, ['S.No', 'Faculty Name', 'Date (From – To)', 'Course Name', 'Status / Result'], fnptelRows, [0.5, 2.2, 1.8, 3.0, 1.7]);

  // ==========================================
  // SLIDE 6: Section D - Student Participation & NPTEL
  // ==========================================
  const slide6 = pptx.addSlide();
  applySlideMaster(slide6, 'D. Details of Student Participation & NPTEL', deptToDisplay);

  const spartRows = studentPartList.map((sp, idx) => [
    String(idx + 1),
    sp.recognition || summary?.staff_name || 'Mentor',
    sp.description || 'Student',
    sp.achievement_type === 'Student Event' ? 'Event' : 'NPTEL',
    sp.achievement_title || '—',
    sp.level || 'Registered'
  ]);

  addSlideTable(slide6, ['S.No', 'Mentor Name', 'Student Name', 'Category', 'Course / Event Name', 'Status / Prize'], spartRows, [0.5, 1.8, 1.8, 0.8, 2.6, 1.7]);

  // ==========================================
  // SLIDE 7: Section G - Research Activities
  // ==========================================
  const slide7 = pptx.addSlide();
  applySlideMaster(slide7, 'G. Details of Research Activity', deptToDisplay);

  const researchRows = researchList.map(r => [
    r.work_done || 'Research',
    r.progress_remarks || summary?.staff_name || 'IT Faculty Team',
    r.journal_paper || r.conference_paper || r.research_proposal || r.work_done || 'Details',
    r.publication_status || 'In Progress'
  ]);

  addSlideTable(slide7, ['Category', 'Faculty Name', 'Title & Venue Details', 'Status'], researchRows, [1.5, 2.0, 4.0, 1.7]);

  // ==========================================
  // SLIDE 8: Section H - Work Plan (Next Month)
  // ==========================================
  const slide8 = pptx.addSlide();
  applySlideMaster(slide8, 'H. Work Plan Targets (Next Month Department Targets)', deptToDisplay);

  const workPlanRows = workPlanList.map((wp, idx) => [
    String(wp.sno || (idx + 1)),
    wp.particulars || wp.target_to_achieve || '—',
    wp.requirement || '—',
    wp.conducted || '0',
    wp.to_be_conducted || 'Planned'
  ]);

  addSlideTable(slide8, ['S.No', 'Particulars', 'Requirement Target', 'Conducted', 'To be Conducted'], workPlanRows, [0.5, 3.2, 2.5, 1.3, 1.7]);

  // ==========================================
  // SLIDE 9: Thank You Slide (Closing Slide)
  // ==========================================
  const slide9 = pptx.addSlide();
  slide9.background = { fill: 'F8FAFC' };

  // Top Accent Bar
  slide9.addShape('rect', {
    x: 0, y: 0, w: 10.0, h: 0.12,
    fill: '1E3A8A'
  });

  // Central Hero Card Container
  slide9.addShape('rect', {
    x: 1.0, y: 0.6, w: 8.0, h: 4.2,
    fill: '1E3A8A', line: { color: '1D4ED8', width: 1.5 }
  });

  // Inner Accent Border Box
  slide9.addShape('rect', {
    x: 1.2, y: 0.8, w: 7.6, h: 3.8,
    fill: '1E3A8A', line: { color: '93C5FD', width: 1 }
  });

  // Large THANK YOU Heading
  slide9.addText('THANK YOU!', {
    x: 1.5, y: 1.35, w: 7.0, h: 0.9,
    color: 'FFFFFF', fontSize: 36, bold: true, align: 'center', tracking: 2
  });

  // Decorative Accent Separator
  slide9.addShape('rect', {
    x: 3.5, y: 2.35, w: 3.0, h: 0.03,
    fill: '93C5FD'
  });

  // Sub-text: Department Name & Institutional Endorsement
  slide9.addText(`DEPARTMENT OF ${deptToDisplay.toUpperCase()}`, {
    x: 1.5, y: 2.55, w: 7.0, h: 0.45,
    color: '93C5FD', fontSize: 15, bold: true, align: 'center'
  });

  slide9.addText('Mount Zion College of Engineering and Technology', {
    x: 1.5, y: 3.1, w: 7.0, h: 0.4,
    color: 'FFFFFF', fontSize: 13, bold: true, align: 'center'
  });

  slide9.addText('An Autonomous Institution | Accredited by NAAC with A+ Grade', {
    x: 1.5, y: 3.55, w: 7.0, h: 0.35,
    color: 'CBD5E1', fontSize: 10.5, italic: true, align: 'center'
  });

  // Bottom Footer
  slide9.addShape('line', {
    x: 0.5, y: 5.15, w: 9.0, h: 0,
    line: { color: 'CBD5E1', width: 1 }
  });

  slide9.addText('Mount Zion College of Engineering and Technology — To Make Man Whole!!', {
    x: 0.5, y: 5.25, w: 9.0, h: 0.3,
    fontSize: 8.5, color: '64748B', align: 'center'
  });

  return await pptx.write('nodebuffer');
}

export async function generateDepartmentSummaryPptx(summary, departmentName = 'Information Technology') {
  return await generatePptx(summary, departmentName);
}

export async function generateCollegeSummaryPptx(summary) {
  return await generatePptx(summary, 'Mount Zion Institutional Overall');
}
