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

// Master slide setup helper (adds header logo and header/footer to content slides)
function applySlideMaster(slide, title, logoBase64, departmentName = 'Information Technology') {
  slide.background = { fill: 'F8FAFC' };

  // Top header bar (navy blue)
  slide.addShape('rect', {
    x: 0, y: 0, w: '100%', h: 0.85,
    fill: '1E3A8A'
  });

  // Slide Title (White text in header)
  slide.addText(title, {
    x: 0.5, y: 0.15, w: '65%', h: 0.55,
    color: 'FFFFFF', fontSize: 15, bold: true, align: 'left', wrap: true
  });

  // College header logo in top right
  if (logoBase64) {
    slide.addImage({
      data: logoBase64,
      x: 8.8, y: 0.1, w: 4.2, h: 0.65
    });
  }

  // Footer bar
  slide.addShape('line', {
    x: 0.5, y: 7.0, w: 12.33, h: 0,
    line: { color: '1E3A8A', width: 1 }
  });

  slide.addText(`Mount Zion College of Engineering and Technology | Dept of ${departmentName} | Monthly Report (06.07.2026 to 07.08.2026)`, {
    x: 0.5, y: 7.08, w: 12.33, h: 0.3,
    fontSize: 8.5, color: '64748B'
  });
}

// Create slide tables helper with custom column widths
function addSlideTable(slide, headers, rows, colWidths = null, yPos = 1.15) {
  const tableData = [
    headers.map(h => ({
      text: h,
      options: { fill: '1E3A8A', color: 'FFFFFF', bold: true, align: 'center', fontSize: 9 }
    })),
    ...rows.map(row => row.map(cell => ({
      text: String(cell !== undefined && cell !== null ? cell : '—'),
      options: { fill: 'FFFFFF', color: '1E293B', align: 'center', fontSize: 8 }
    })))
  ];

  const totalWidth = 12.33;
  const widths = colWidths || Array(headers.length).fill(totalWidth / headers.length);

  slide.addTable(tableData, {
    x: 0.5, y: yPos, w: totalWidth,
    border: { type: 'solid', color: 'CBD5E1', width: 1 },
    colW: widths,
    margin: 3
  });
}

// Main PPTX Generator for Department Monthly Reports (Sections A - H)
export async function generatePptx(summary, departmentName = 'Information Technology') {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';

  const logoBase64 = getHeaderLogoBase64();

  // ==========================================
  // SLIDE 1: Title Slide (Clean Light Layout to avoid logo blue box contrast)
  // ==========================================
  const slide1 = pptx.addSlide();
  slide1.background = { fill: 'F8FAFC' };

  // Top header logo banner card
  if (logoBase64) {
    slide1.addImage({
      data: logoBase64,
      x: 1.5, y: 0.5, w: 10.33, h: 1.3
    });
  }

  // Decorative blue separator line
  slide1.addShape('line', {
    x: 1.5, y: 2.1, w: 10.33, h: 0,
    line: { color: '1E3A8A', width: 2 }
  });

  // Main Title Box
  slide1.addText('MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY', {
    x: 0.5, y: 2.5, w: 12.33, h: 0.6,
    color: '1E3A8A', fontSize: 20, bold: true, align: 'center', wrap: true
  });

  slide1.addText('MONTHLY REPORT – ACADEMIC YEAR 2026 – 27 (ODD SEMESTER)', {
    x: 0.5, y: 3.3, w: 12.33, h: 0.5,
    color: '0F172A', fontSize: 16, bold: true, align: 'center', wrap: true
  });

  // Information Card Container
  slide1.addShape('rect', {
    x: 2.5, y: 4.2, w: 8.33, h: 2.2,
    fill: 'FFFFFF', line: { color: 'CBD5E1', width: 1 }
  });

  slide1.addText(`Name of the Department : ${departmentName}\nReporting Period Date : 06.07.2026 to 07.08.2026\nAcademic Year : 2026 – 2027 (Odd Semester)`, {
    x: 2.7, y: 4.4, w: 7.93, h: 1.8,
    color: '1E293B', fontSize: 13, align: 'center', lineSpacing: 26
  });

  // ==========================================
  // SLIDE 2: Section A - II Year Theory & Lab
  // ==========================================
  const slide2 = pptx.addSlide();
  applySlideMaster(slide2, 'A. Syllabus Completion — II YEAR (Theory & Lab)', logoBase64, departmentName);
  const iiRows = [
    ['MA25C02', 'Discrete Mathematics / Dr. Sabeena', '25 Hours', 'Unit 1 & 2 Completed'],
    ['IT25301', 'Data Structures in C / Mrs. V. Brindha Devi', '20 Hours', 'Unit 1, Unit 2 & 3.4/3.12 Completed'],
    ['IT25302', 'Computer Org & Arch / Mrs. R Saraswathi', '20 Hours', 'Unit 1 & Unit 2 Completed'],
    ['CS25303', 'Operating Systems (T+L) / Mrs. R. Sangeetha', '20h (T) / 8h (L)', 'Theory: Unit 1,2 Comp | Lab: Ex-4/8'],
    ['CS25305', 'OOSE / Mrs A Arifa Banu', '20 Hours', 'Unit 1 & 2 Completed'],
    ['CS25302', 'Java Programming / Mrs. Shalini L', '20 Hours', 'Unit 1 & 2 Completed'],
    ['IT25303', 'Data Structures Lab / Mrs. V. Brindha Devi', '20 Hours', 'EX: 6/15 | Rem: Ex: 8/15'],
    ['CS25307', 'Java Programming Lab / Mrs. L Shalini', '20 Hours', 'Ex: 5/10 | Rem: Ex: 5/10']
  ];
  addSlideTable(slide2, ['Sub. Code', 'Course Name & Instructor', 'Hours Handled', 'Completion Status'], iiRows, [1.5, 4.5, 2.0, 4.33]);

  // ==========================================
  // SLIDE 3: Section A - III Year Theory & Lab
  // ==========================================
  const slide3 = pptx.addSlide();
  applySlideMaster(slide3, 'A. Syllabus Completion — III YEAR (Theory & Lab)', logoBase64, departmentName);
  const iiiRows = [
    ['CS3591', 'Computer Networks (T+L) / Mrs. L Shalini', '15h (T) / 10h (L)', 'Theory: Unit 1,2 Comp | Lab: Ex-5/10'],
    ['IT3501', 'Full Stack Web Dev / Mrs. R Saraswathi', '20 Hours', 'Unit 1 & Unit 2 Completed'],
    ['CS3551', 'Distributed Computing / Mrs A Arifa Banu', '15 Hours', 'Unit 1 & Unit 2 Completed'],
    ['CS3691', 'Embedded Systems & IoT / Dr. P. Rajkumar', '15h (T) / 10h (L)', 'Theory: Unit 1,2 Comp | Lab: Ex-6/11'],
    ['CCS335', 'Cloud Computing (T+L) / Mrs. R. Sangeetha', '22h (T) / 8h (L)', 'Theory: Unit 1,2 & 3.3 | Lab: Ex-4/10'],
    ['CCS361', 'RPA (T+L) / Mrs. V. Brindha Devi', '18h (T) / 10h (L)', 'Theory: Unit 1,2 & 3.1 | Lab: Ex-4/13'],
    ['MX3084', 'Disaster Management / Dr. A. Nivedha', '15 Hours', 'Unit 1 & Unit 2 Completed'],
    ['IT3511', 'Full Stack Web Dev Lab / Mrs. R Saraswathi', '20 Hours', 'EX: 6/8 | Rem: 2/8 & 1 Project']
  ];
  addSlideTable(slide3, ['Sub. Code', 'Course Name & Instructor', 'Hours Handled', 'Completion Status'], iiiRows, [1.5, 4.5, 2.0, 4.33]);

  // ==========================================
  // SLIDE 4: Section A - IV Year Theory
  // ==========================================
  const slide4 = pptx.addSlide();
  applySlideMaster(slide4, 'A. Syllabus Completion — IV YEAR (Theory)', logoBase64, departmentName);
  const ivRows = [
    ['GE3791', 'Human Values and Ethics / Mrs. S. Ammu', '28 Hours', 'Unit 1,2,3 & Unit 4.1/4.5 Completed'],
    ['GE3751', 'Principles of Management / Mr. K. Muthuraman', '20 Hours', 'Unit 1,2 & 3.8/3.10 Completed'],
    ['AI3021', 'OE 2 IT in Agriculture / Ms. S. Nivetha', '25 Hours', 'Unit 1,2 & 3.6/3.8 Completed'],
    ['OME354', 'OE 3 Applied Design Thinking / Mrs A Arifa Banu', '23 Hours', 'Unit 1,2,3 & Unit 4.3/4.6 Completed'],
    ['CRA332', 'OE 4 Drone Technologies / Ms. Ramaprabha', '23 Hours', 'Unit 1,2 & 3.6/3.8 Completed']
  ];
  addSlideTable(slide4, ['Sub. Code', 'Course Name & Instructor', 'Hours Handled', 'Completion Status'], ivRows, [1.5, 4.5, 2.0, 4.33]);

  // ==========================================
  // SLIDE 5: Section B - Events Organised
  // ==========================================
  const slide5 = pptx.addSlide();
  applySlideMaster(slide5, 'B. Details of Events Organised', logoBase64, departmentName);
  const bRows = [
    ['1', '14.07.2026', 'WORKSHOP: Hands on networking', 'IV Year / 29', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
    ['2', '16.07.2026', 'SEMINAR: Cyber Security & Ethical Hacking', '90 Students', 'Mrs A Arifa Banu', 'Mr. R Thamarai Selvam, UK'],
    ['3', '24.07.2026', 'WORKSHOP: IT Infrastructure Essentials', 'IV (29) & III (61)', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
    ['4', '28.07.2026', 'WORKSHOP: Systems & Networking', 'II Year / 59', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
    ['5', '05.08–07.08', 'WORKSHOP: Cloud Computing Tech', '71 Students', 'Mrs. R Saraswathi', 'Dr. R V Nataraj, Campus Reign']
  ];
  addSlideTable(slide5, ['S.No', 'Date', 'Event Name', 'Attendance', 'Coordinator', 'Resource Person'], bRows, [0.8, 1.5, 3.5, 2.0, 2.0, 2.53]);

  // ==========================================
  // SLIDE 6: Section C - Faculty Participation
  // ==========================================
  const slide6 = pptx.addSlide();
  applySlideMaster(slide6, 'C. Details of Faculty Participation (FDP & NPTEL)', logoBase64, departmentName);
  const cRows = [
    ['1', 'Mrs. V Brindha Devi', '15.06–17.06.2026', 'New Age Teaching Techniques', 'ICT Academy - MZCET'],
    ['', 'Mrs. V Brindha Devi', '22.06–26.06.2026', 'AGENTIC AI SYSTEMS', 'Kalasalingam (KARE)'],
    ['', 'Mrs. V Brindha Devi', '08.06–12.06.2026', 'Agentic AI: MCP & Enterprise Agents', 'JBIET - ExcelR'],
    ['2', 'Mrs. A Arifa Banu', '15.06–17.06.2026', 'New Age Teaching Techniques', 'ICT Academy - MZCET'],
    ['', 'Mrs. A Arifa Banu', '22.06–26.06.2026', 'AGENTIC AI SYSTEMS', 'Kalasalingam (KARE)'],
    ['3', 'Mrs R Sangeetha', '22.06–26.06.2026', 'AGENTIC AI SYSTEMS', 'Kalasalingam (KARE)'],
    ['', 'Mrs R Sangeetha', '29.06–04.07.2026', 'AI Driven Cyber Security', 'New Prince Bhavani'],
    ['4', 'Mrs L Shalini', '22.06–26.06.2026', 'AGENTIC AI SYSTEMS', 'Kalasalingam (KARE)']
  ];
  addSlideTable(slide6, ['S.No', 'Faculty Name', 'Date', 'Event Name', 'Venue / Organizer'], cRows, [0.8, 2.8, 2.2, 3.3, 3.23]);

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
  addSlideTable(slide7, ['S.No', 'Mentor Name', 'Student Name', 'Year', 'Course Name', 'Status'], dRows, [0.8, 2.5, 2.5, 1.0, 3.5, 2.03]);

  // ==========================================
  // SLIDE 8: Section H - Work Plan (Next Month)
  // ==========================================
  const slide8 = pptx.addSlide();
  applySlideMaster(slide8, 'H. Work Plan Targets (Next Month)', logoBase64, departmentName);
  const hRows = [
    ['1', 'Certificate/VAC course', 'Min. 1 per Semester (UG & PG)', '1 per class'],
    ['2', 'Participation in internship', 'Above 50%', 'Target 50%+'],
    ['3', 'Participation in IPT', 'Above 65%', 'Target 65%+'],
    ['4', 'Industrial visit', 'Min. 1 per ACY (I & II Year)', 'Planned'],
    ['5', 'Student centric activities', 'Min. 1 per month per subject', '1 per subject'],
    ['6', '24 hours workshop', '3 per semester (UG), 1 per sem (PG)', '2 Planned'],
    ['7', 'Exam results (Internal & External)', '75% Dept, 85% Subject, 4 Ranks', 'Target 75%+'],
    ['8', 'Publication (Journal & Conf)', 'Min. 1 per Sem / Faculty', '1 Journal, 1 Conf']
  ];
  addSlideTable(slide8, ['S.No', 'Particulars', 'Requirement Target', 'To be Conducted'], hRows, [0.8, 4.5, 4.5, 2.53]);

  // ==========================================
  // SLIDE 9: Signature Slide
  // ==========================================
  const slide9 = pptx.addSlide();
  applySlideMaster(slide9, 'Signature & Endorsement', logoBase64, departmentName);

  slide9.addText(`Department of ${departmentName}`, { x: 0.5, y: 2.2, w: 12.33, h: 0.5, fontSize: 18, bold: true, color: '1E3A8A', align: 'center' });
  slide9.addText('Monthly Report Period: 06.07.2026 to 07.08.2026', { x: 0.5, y: 2.8, w: 12.33, h: 0.4, fontSize: 14, color: '475569', align: 'center' });

  slide9.addText('Signature of HoD', { x: 4.16, y: 5.5, w: 4.0, h: 0.3, align: 'center', fontSize: 12, bold: true });
  slide9.addText('________________________', { x: 4.16, y: 5.2, w: 4.0, h: 0.3, align: 'center' });

  return await pptx.write('nodebuffer');
}

export async function generateCollegeSummaryPptx(summary) {
  return await generatePptx(summary, 'Mount Zion Institutional Overall');
}


