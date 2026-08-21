import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

// Helper: Try to read header logo image as Base64 for PPTX embedding
function getHeaderLogoBase64() {
  const logoPaths = [
    'c:\\Users\\HARIHARAN S\\OneDrive\\Desktop\\Report-Automation\\frontend\\public\\pdf word top logo.png',
    path.resolve('frontend/public/pdf word top logo.png'),
    path.resolve('../frontend/public/pdf word top logo.png'),
    path.resolve('public/pdf word top logo.png'),
    path.resolve('mzcet-logo.png'),
    path.resolve('../mzcet-logo.png')
  ];

  for (const logoPath of logoPaths) {
    if (fs.existsSync(logoPath)) {
      try {
        const fileBuffer = fs.readFileSync(logoPath);
        const ext = path.extname(logoPath).toLowerCase() === '.png' ? 'png' : 'jpeg';
        return `data:image/${ext};base64,${fileBuffer.toString('base64')}`;
      } catch (err) {
        console.error('Error reading logo for PPTX:', err);
      }
    }
  }
  return null;
}

// Master slide setup helper for 16:9 widescreen (10.0 x 5.625 inches)
function applySlideMaster(slide, title, logoBase64, departmentName = 'Information Technology') {
  slide.background = { fill: 'F8FAFC' };

  // Top header bar (navy blue) - Width: 10.0 in, Height: 0.75 in
  slide.addShape('rect', {
    x: 0, y: 0, w: 10.0, h: 0.75,
    fill: '1E3A8A'
  });

  // Slide Title (White text in header)
  slide.addText(title, {
    x: 0.4, y: 0.1, w: 6.2, h: 0.55,
    color: 'FFFFFF', fontSize: 13, bold: true, align: 'left', wrap: true
  });

  // College header logo in top right (fitted within 10.0 in slide width)
  if (logoBase64) {
    slide.addImage({
      data: logoBase64,
      x: 6.7, y: 0.05, w: 3.1, h: 0.65
    });
  }

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
  const tableData = [
    headers.map(h => ({
      text: h,
      options: { fill: '1E3A8A', color: 'FFFFFF', bold: true, align: 'center', fontSize: 8.5 }
    })),
    ...rows.map(row => row.map(cell => ({
      text: String(cell !== undefined && cell !== null ? cell : '—'),
      options: { fill: 'FFFFFF', color: '1E293B', align: 'center', fontSize: 7.5 }
    })))
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

  const logoBase64 = getHeaderLogoBase64();

  // ==========================================
  // SLIDE 1: Title Slide (Fitted for 10.0 x 5.625 inches)
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { fill: 'F8FAFC' };

  // Top header logo banner card (Centered)
  if (logoBase64) {
    slide1.addImage({
      data: logoBase64,
      x: 0.75, y: 0.3, w: 8.5, h: 1.05
    });
  }

  // Decorative blue separator line
  slide1.addShape('line', {
    x: 0.75, y: 1.45, w: 8.5, h: 0,
    line: { color: '1E3A8A', width: 1.5 }
  });

  // Main Title Box
  slide1.addText('MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY', {
    x: 0.5, y: 1.65, w: 9.0, h: 0.45,
    color: '1E3A8A', fontSize: 16, bold: true, align: 'center', wrap: true
  });

  slide1.addText('MONTHLY REPORT – ACADEMIC YEAR 2026 – 27 (ODD SEMESTER)', {
    x: 0.5, y: 2.15, w: 9.0, h: 0.4,
    color: '0F172A', fontSize: 13, bold: true, align: 'center', wrap: true
  });

  // Information Card Container
  slide1.addShape('rect', {
    x: 1.5, y: 2.75, w: 7.0, h: 1.9,
    fill: 'FFFFFF', line: { color: 'CBD5E1', width: 1 }
  });

  slide1.addText(`Name of the Department : ${departmentName}\nReporting Period Date : 06.07.2026 to 07.08.2026\nAcademic Year : 2026 – 2027 (Odd Semester)`, {
    x: 1.6, y: 2.85, w: 6.8, h: 1.7,
    color: '1E293B', fontSize: 11, align: 'center', lineSpacing: 20
  });

  // Bottom Footer
  slide1.addText('Mount Zion College of Engineering and Technology — Autonomous Institution', {
    x: 0.5, y: 5.05, w: 9.0, h: 0.3,
    fontSize: 8.5, color: '64748B', align: 'center'
  });

  // ==========================================
  // SLIDE 2: Section A - II Year Theory & Lab
  // ==========================================
  const slide2 = pptx.addSlide();
  applySlideMaster(slide2, 'A. Syllabus Completion — II YEAR (Theory & Lab)', logoBase64, departmentName);
  
  let iiRows = [];
  if (summary?.teaching_activities && Array.isArray(summary.teaching_activities) && summary.teaching_activities.length > 0) {
    iiRows = summary.teaching_activities
      .filter(t => (t.class_assigned || '').includes('II') || (t.class_assigned || '').includes('2'))
      .map((t, idx) => [
        t.subject_code || `IT253${idx+1}`,
        `${t.subject_name || 'Subject'} / ${t.instructor_name || 'Faculty'}`,
        t.teaching_hours ? `${t.teaching_hours}` : `${t.classes_taken || 20} Hours`,
        t.syllabus_completed || `Unit 1 & 2 Completed`
      ]);
  }
  if (iiRows.length === 0) {
    iiRows = [
      ['MA25C02', 'Discrete Mathematics / Dr. Sabeena', '25 Hours', 'Unit 1 & 2 Completed'],
      ['IT25301', 'Data Structures in C / Mrs. V. Brindha Devi', '20 Hours', 'Unit 1, Unit 2 & 3.4/3.12 Completed'],
      ['IT25302', 'Computer Org & Arch / Mrs. R Saraswathi', '20 Hours', 'Unit 1 & Unit 2 Completed'],
      ['CS25303', 'Operating Systems (T+L) / Mrs. R. Sangeetha', '20h (T) / 8h (L)', 'Theory: Unit 1,2 Comp | Lab: Ex-4/8'],
      ['CS25305', 'OOSE / Mrs A Arifa Banu', '20 Hours', 'Unit 1 & 2 Completed'],
      ['CS25302', 'Java Programming / Mrs. Shalini L', '20 Hours', 'Unit 1 & 2 Completed'],
      ['IT25303', 'Data Structures Lab / Mrs. V. Brindha Devi', '20 Hours', 'EX: 6/15 | Rem: Ex: 8/15'],
      ['CS25307', 'Java Programming Lab / Mrs. L Shalini', '20 Hours', 'Ex: 5/10 | Rem: Ex: 5/10']
    ];
  }
  // Col Widths sum: 1.0 + 3.6 + 1.4 + 3.2 = 9.2 in
  addSlideTable(slide2, ['Sub. Code', 'Course Name & Instructor', 'Hours Handled', 'Completion Status'], iiRows, [1.0, 3.6, 1.4, 3.2]);

  // ==========================================
  // SLIDE 3: Section A - III Year Theory & Lab
  // ==========================================
  const slide3 = pptx.addSlide();
  applySlideMaster(slide3, 'A. Syllabus Completion — III YEAR (Theory & Lab)', logoBase64, departmentName);
  
  let iiiRows = [];
  if (summary?.teaching_activities && Array.isArray(summary.teaching_activities) && summary.teaching_activities.length > 0) {
    iiiRows = summary.teaching_activities
      .filter(t => (t.class_assigned || '').includes('III') || (t.class_assigned || '').includes('3'))
      .map((t, idx) => [
        t.subject_code || `CS35${idx+1}`,
        `${t.subject_name || 'Subject'} / ${t.instructor_name || 'Faculty'}`,
        t.teaching_hours ? `${t.teaching_hours}` : `${t.classes_taken || 20} Hours`,
        t.syllabus_completed || `Unit 1 & 2 Completed`
      ]);
  }
  if (iiiRows.length === 0) {
    iiiRows = [
      ['CS3591', 'Computer Networks (T+L) / Mrs. L Shalini', '15h (T) / 10h (L)', 'Theory: Unit 1,2 Comp | Lab: Ex-5/10'],
      ['IT3501', 'Full Stack Web Dev / Mrs. R Saraswathi', '20 Hours', 'Unit 1 & Unit 2 Completed'],
      ['CS3551', 'Distributed Computing / Mrs A Arifa Banu', '15 Hours', 'Unit 1 & Unit 2 Completed'],
      ['CS3691', 'Embedded Systems & IoT / Dr. P. Rajkumar', '15h (T) / 10h (L)', 'Theory: Unit 1,2 Comp | Lab: Ex-6/11'],
      ['CCS335', 'Cloud Computing (T+L) / Mrs. R. Sangeetha', '22h (T) / 8h (L)', 'Theory: Unit 1,2 & 3.3 | Lab: Ex-4/10'],
      ['CCS361', 'RPA (T+L) / Mrs. V. Brindha Devi', '18h (T) / 10h (L)', 'Theory: Unit 1,2 & 3.1 | Lab: Ex-4/13'],
      ['MX3084', 'Disaster Management / Dr. A. Nivedha', '15 Hours', 'Unit 1 & Unit 2 Completed'],
      ['IT3511', 'Full Stack Web Dev Lab / Mrs. R Saraswathi', '20 Hours', 'EX: 6/8 | Rem: 2/8 & 1 Project']
    ];
  }
  addSlideTable(slide3, ['Sub. Code', 'Course Name & Instructor', 'Hours Handled', 'Completion Status'], iiiRows, [1.0, 3.6, 1.4, 3.2]);

  // ==========================================
  // SLIDE 4: Section A - IV Year Theory
  // ==========================================
  const slide4 = pptx.addSlide();
  applySlideMaster(slide4, 'A. Syllabus Completion — IV YEAR (Theory)', logoBase64, departmentName);
  
  let ivRows = [];
  if (summary?.teaching_activities && Array.isArray(summary.teaching_activities) && summary.teaching_activities.length > 0) {
    ivRows = summary.teaching_activities
      .filter(t => (t.class_assigned || '').includes('IV') || (t.class_assigned || '').includes('4'))
      .map((t, idx) => [
        t.subject_code || `GE37${idx+1}`,
        `${t.subject_name || 'Subject'} / ${t.instructor_name || 'Faculty'}`,
        t.teaching_hours ? `${t.teaching_hours}` : `${t.classes_taken || 20} Hours`,
        t.syllabus_completed || `Unit 1,2 Completed`
      ]);
  }
  if (ivRows.length === 0) {
    ivRows = [
      ['GE3791', 'Human Values and Ethics / Mrs. S. Ammu', '28 Hours', 'Unit 1,2,3 & Unit 4.1/4.5 Completed'],
      ['GE3751', 'Principles of Management / Mr. K. Muthuraman', '20 Hours', 'Unit 1,2 & 3.8/3.10 Completed'],
      ['AI3021', 'OE 2 IT in Agriculture / Ms. S. Nivetha', '25 Hours', 'Unit 1,2 & 3.6/3.8 Completed'],
      ['OME354', 'OE 3 Applied Design Thinking / Mrs A Arifa Banu', '23 Hours', 'Unit 1,2,3 & Unit 4.3/4.6 Completed'],
      ['CRA332', 'OE 4 Drone Technologies / Ms. Ramaprabha', '23 Hours', 'Unit 1,2 & 3.6/3.8 Completed']
    ];
  }
  addSlideTable(slide4, ['Sub. Code', 'Course Name & Instructor', 'Hours Handled', 'Completion Status'], ivRows, [1.0, 3.6, 1.4, 3.2]);

  // ==========================================
  // SLIDE 5: Section B - Events Organised
  // ==========================================
  const slide5 = pptx.addSlide();
  applySlideMaster(slide5, 'B. Details of Events Organised', logoBase64, departmentName);
  
  let bRows = [];
  if (summary?.events && Array.isArray(summary.events) && summary.events.length > 0) {
    bRows = summary.events.map((e, idx) => [
      String(idx + 1),
      e.event_date || '14.07.2026',
      e.event_name || 'Technical Workshop',
      `${e.students_participated || 30} Students`,
      e.role || 'Coordinator',
      e.description || 'Resource Person'
    ]);
  }
  if (bRows.length === 0) {
    bRows = [
      ['1', '14.07.2026', 'WORKSHOP: Hands on networking', 'IV Year / 29', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
      ['2', '16.07.2026', 'SEMINAR: Cyber Security & Ethical Hacking', '90 Students', 'Mrs A Arifa Banu', 'Mr. R Thamarai Selvam, UK'],
      ['3', '24.07.2026', 'WORKSHOP: IT Infrastructure Essentials', 'IV (29) & III (61)', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
      ['4', '28.07.2026', 'WORKSHOP: Systems & Networking', 'II Year / 59', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
      ['5', '05.08–07.08', 'WORKSHOP: Cloud Computing Tech', '71 Students', 'Mrs. R Saraswathi', 'Dr. R V Nataraj, Campus Reign']
    ];
  }
  // Col Widths sum: 0.5 + 1.1 + 2.6 + 1.2 + 1.8 + 2.0 = 9.2 in
  addSlideTable(slide5, ['S.No', 'Date', 'Event Name', 'Attendance', 'Coordinator', 'Resource Person'], bRows, [0.5, 1.1, 2.6, 1.2, 1.8, 2.0]);

  // ==========================================
  // SLIDE 6: Section C - Faculty Participation
  // ==========================================
  const slide6 = pptx.addSlide();
  applySlideMaster(slide6, 'C. Details of Faculty Participation (FDP & NPTEL)', logoBase64, departmentName);
  
  let cRows = [];
  if (summary?.fdp_training && Array.isArray(summary.fdp_training) && summary.fdp_training.length > 0) {
    cRows = summary.fdp_training.map((f, idx) => [
      String(idx + 1),
      f.role || 'Faculty Member',
      f.start_date || '15.06.2026',
      f.program_title || 'FDP Program',
      f.organizing_institution || 'ICT Academy'
    ]);
  }
  if (cRows.length === 0) {
    cRows = [
      ['1', 'Mrs. V Brindha Devi', '15.06–17.06.2026', 'New Age Teaching Techniques', 'ICT Academy - MZCET'],
      ['2', 'Mrs. V Brindha Devi', '22.06–26.06.2026', 'AGENTIC AI SYSTEMS', 'Kalasalingam (KARE)'],
      ['3', 'Mrs. V Brindha Devi', '08.06–12.06.2026', 'Agentic AI: MCP & Enterprise Agents', 'JBIET - ExcelR'],
      ['4', 'Mrs. A Arifa Banu', '15.06–17.06.2026', 'New Age Teaching Techniques', 'ICT Academy - MZCET'],
      ['5', 'Mrs. A Arifa Banu', '22.06–26.06.2026', 'AGENTIC AI SYSTEMS', 'Kalasalingam (KARE)'],
      ['6', 'Mrs R Sangeetha', '22.06–26.06.2026', 'AGENTIC AI SYSTEMS', 'Kalasalingam (KARE)'],
      ['7', 'Mrs R Sangeetha', '29.06–04.07.2026', 'AI Driven Cyber Security', 'New Prince Bhavani'],
      ['8', 'Mrs L Shalini', '22.06–26.06.2026', 'AGENTIC AI SYSTEMS', 'Kalasalingam (KARE)']
    ];
  }
  // Col Widths sum: 0.5 + 2.2 + 1.4 + 2.6 + 2.5 = 9.2 in
  addSlideTable(slide6, ['S.No', 'Faculty Name', 'Date', 'Event Name', 'Venue / Organizer'], cRows, [0.5, 2.2, 1.4, 2.6, 2.5]);

  // ==========================================
  // SLIDE 7: Section D - Student Participation (NPTEL)
  // ==========================================
  const slide7 = pptx.addSlide();
  applySlideMaster(slide7, 'D. Details of Student Participation (NPTEL)', logoBase64, departmentName);
  
  const dRows = [
    ['1', 'Mrs A Arifa Banu', 'Aahela Parveen', 'IV', 'Data Analytics with Python', 'Elite'],
    ['2', 'Mrs V Brindha Devi', 'J Nandhini', 'III', 'Cloud Computing', 'Elite with Silver'],
    ['3', 'Mrs R Saraswathi', 'C Ramya', 'III', 'Cloud Computing', 'Elite'],
    ['4', 'Mrs V Brindha Devi', 'S Sudharsana Devi', 'III', 'Cloud Computing', 'Elite'],
    ['5', 'Dr Rajkumar', 'S Seran', 'III', 'Cloud Computing', 'Pass'],
    ['6', 'Dr Rajkumar', 'S Pragadeesh', 'III', 'Cloud Computing', 'Elite'],
    ['7', 'Mr K Muthu Raman', 'T Dinesh', 'II', 'Data Structures Using Python', 'Payment finished'],
    ['8', 'Mrs R Saraswathi', 'R Joyslin Robena', 'II', 'Data Structures Using Python', 'Payment finished'],
    ['9', 'Mrs V Brindha Devi', 'A Saniya Aasmin', 'II', 'Data Structures Using Python', 'Payment finished'],
    ['10', 'Mrs R Sangeetha', 'J Rahmath Fahmidha', 'II', 'Data Structures Using Python', 'Payment finished']
  ];
  // Col Widths sum: 0.5 + 1.8 + 1.8 + 0.6 + 2.8 + 1.7 = 9.2 in
  addSlideTable(slide7, ['S.No', 'Mentor Name', 'Student Name', 'Year', 'Course Name', 'Status'], dRows, [0.5, 1.8, 1.8, 0.6, 2.8, 1.7]);

  // ==========================================
  // SLIDE 8: Section H - Work Plan (Next Month)
  // ==========================================
  const slide8 = pptx.addSlide();
  applySlideMaster(slide8, 'H. Work Plan Targets (Next Month)', logoBase64, departmentName);
  
  let hRows = [];
  if (summary?.future_plans && Array.isArray(summary.future_plans) && summary.future_plans.length > 0) {
    hRows = summary.future_plans.map((p, idx) => [
      String(idx + 1),
      p.particulars || 'Academic Plan',
      p.requirement || 'Standard Target',
      p.to_be_conducted || 'Planned'
    ]);
  }
  if (hRows.length === 0) {
    hRows = [
      ['1', 'Certificate/VAC course', 'Min. 1 per Semester (UG & PG)', '1 per class'],
      ['2', 'Participation in internship', 'Above 50%', 'Target 50%+'],
      ['3', 'Participation in IPT', 'Above 65%', 'Target 65%+'],
      ['4', 'Industrial visit', 'Min. 1 per ACY (I & II Year)', 'Planned'],
      ['5', 'Student centric activities', 'Min. 1 per month per subject', '1 per subject'],
      ['6', '24 hours workshop', '3 per semester (UG), 1 per sem (PG)', '2 Planned'],
      ['7', 'Exam results (Internal & External)', '75% Dept, 85% Subject, 4 Ranks', 'Target 75%+'],
      ['8', 'Publication (Journal & Conf)', 'Min. 1 per Sem / Faculty', '1 Journal, 1 Conf']
    ];
  }
  // Col Widths sum: 0.5 + 3.5 + 3.2 + 2.0 = 9.2 in
  addSlideTable(slide8, ['S.No', 'Particulars', 'Requirement Target', 'To be Conducted'], hRows, [0.5, 3.5, 3.2, 2.0]);

  // ==========================================
  // SLIDE 9: Signature Slide
  // ==========================================
  const slide9 = pptx.addSlide();
  applySlideMaster(slide9, 'Signature & Endorsement', logoBase64, departmentName);

  slide9.addText(`Department of ${departmentName}`, {
    x: 0.5, y: 1.5, w: 9.0, h: 0.4,
    fontSize: 16, bold: true, color: '1E3A8A', align: 'center'
  });
  slide9.addText('Monthly Report Period: 06.07.2026 to 07.08.2026', {
    x: 0.5, y: 2.0, w: 9.0, h: 0.4,
    fontSize: 12, color: '475569', align: 'center'
  });

  slide9.addShape('line', {
    x: 3.0, y: 4.0, w: 4.0, h: 0,
    line: { color: '1E3A8A', width: 1.5 }
  });

  slide9.addText('Signature of HoD', {
    x: 3.0, y: 4.1, w: 4.0, h: 0.3,
    align: 'center', fontSize: 11, bold: true, color: '0F172A'
  });

  return await pptx.write('nodebuffer');
}

export async function generateDepartmentSummaryPptx(summary, departmentName = 'Information Technology') {
  return await generatePptx(summary, departmentName);
}

export async function generateCollegeSummaryPptx(summary) {
  return await generatePptx(summary, 'Mount Zion Institutional Overall');
}
