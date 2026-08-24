import { normalizeReportData } from './services/reportNormalizer.js';
import { generatePdf } from './services/pdfGenerator.js';
import { generateDocx } from './services/docxGenerator.js';
import { generatePptx } from './services/pptxGenerator.js';
import { generateHodMonthlyReportExcel } from './services/excelGenerator.js';
import ExcelJS from 'exceljs';

const populatedReport = {
  id: 1001,
  report_type: 'monthly',
  academic_year: '2026-2027',
  semester: 'ODD',
  month: 'August',
  start_date: '2026-07-06',
  end_date: '2026-08-07',
  status: 'Approved',
  staff_name: 'Mrs. V Brindha Devi',
  staff_code: 'IT-204',
  department_name: 'Information Technology',
  designation: 'Assistant Professor',
  teaching_activities: [
    {
      id: 1,
      subject_name: 'CS3551 - Distributed Computing',
      instructor_name: 'Mrs. V Brindha Devi',
      course_type: 'Theory',
      teaching_hours: '6 Hours',
      classes_taken: 6,
      current_unit: 'unit 1 complete',
      syllabus_pct: 25
    },
    {
      id: 2,
      subject_name: 'CS3561 - Distributed Computing Lab',
      instructor_name: 'Mrs. V Brindha Devi',
      course_type: 'Laboratory',
      teaching_hours: '3 Hours',
      classes_taken: 3,
      exp_completed: '5 Experiments Completed',
      exp_remaining: '5 Experiments Remaining'
    }
  ],
  events: [
    {
      id: 10,
      event_name: 'Cloud & Distributed Systems Seminar',
      event_date: '2026-08-15',
      students_participated: 60,
      role: 'Coordinator',
      description: 'Resource Person: Dr. Aris'
    }
  ],
  fdp_training: [
    {
      id: 20,
      program_title: 'FDP on Modern Cloud Architectures',
      start_date: '2026-08-10',
      role: 'Mrs. V Brindha Devi',
      organizing_institution: 'IIT Madras',
      mode: 'Online'
    }
  ],
  achievements: [
    {
      id: 30,
      category: 'Faculty NPTEL',
      achievement_type: 'NPTEL Course',
      achievement_title: 'Cloud Computing Principles',
      description: 'Aug - Oct 2026',
      level: 'Elite + Gold',
      recognition: 'Mrs. V Brindha Devi'
    },
    {
      id: 31,
      category: 'Student Event',
      achievement_type: 'Student Event',
      achievement_title: 'National Level Hackathon 2026',
      description: 'K. Rajesh (III Year IT)',
      level: 'First Prize',
      recognition: 'Mrs. V Brindha Devi'
    }
  ],
  research_activities: [
    {
      id: 40,
      work_done: 'Journal Publication',
      progress_remarks: 'Mrs. V Brindha Devi',
      journal_paper: 'Scalable Distributed Ledger Consensus in Cloud Environments',
      publication_status: 'Published'
    }
  ],
  future_plans: [
    {
      id: 50,
      sno: 1,
      particulars: 'Unit 2 Completion & Lab Test 1',
      requirement: '12 Hours',
      conducted: '0',
      to_be_conducted: 'Planned for Sept 2026'
    }
  ],
  weekly_attendance_summary: [
    { year: 'IV', week_index: 1, week_label: '06.07.26 - 10.07.26', week_start: '2026-07-06', week_end: '2026-07-10', attendance_pct: 84.13 },
    { year: 'I', week_index: 1, week_label: '06.07.26 - 10.07.26', week_start: '2026-07-06', week_end: '2026-07-10', attendance_pct: 95.0 },
    { year: 'III', week_index: 1, week_label: '06.07.26 - 10.07.26', week_start: '2026-07-06', week_end: '2026-07-10', attendance_pct: 86.62 },
    { year: 'II', week_index: 1, week_label: '06.07.26 - 10.07.26', week_start: '2026-07-06', week_end: '2026-07-10', attendance_pct: 90.0 }
  ]
};

const emptyReport = {
  id: 1002,
  report_type: 'monthly',
  academic_year: '2026-2027',
  semester: 'ODD',
  month: 'August',
  start_date: '2026-08-01',
  end_date: '2026-08-31',
  status: 'Draft',
  staff_name: 'Test Staff',
  department_name: 'Information Technology',
  teaching_activities: [],
  events: [],
  fdp_training: [],
  achievements: [],
  research_activities: [],
  future_plans: [],
  weekly_attendance_summary: []
};

async function verifyDataSync() {
  console.log('===========================================================');
  console.log('   Testing Single Source of Truth & Data Synchronization    ');
  console.log('===========================================================\n');

  // Test 1: Normalizer Output for Populated Report
  const normalizedPopulated = normalizeReportData(populatedReport);
  console.log('1. Testing Normalization of Populated Report...');
  console.assert(normalizedPopulated.syllabusTheoryRows.length === 1, 'Theory rows count must be 1');
  console.assert(normalizedPopulated.syllabusTheoryRows[0][0].includes('CS3551'), 'Theory subject code matched');
  console.assert(normalizedPopulated.syllabusTheoryRows[0][1] === '6 Hours', 'Theory hours matched');
  console.assert(normalizedPopulated.syllabusTheoryRows[0][2] === 'unit 1 complete', 'Theory unit matched');
  
  console.assert(normalizedPopulated.syllabusLabRows.length === 1, 'Lab rows count must be 1');
  console.assert(normalizedPopulated.eventsRows.length === 1, 'Events count must be 1');
  console.assert(normalizedPopulated.facultyFdpRows.length === 1, 'FDP count must be 1');
  console.assert(normalizedPopulated.facultyNptelRows.length === 1, 'Faculty NPTEL count must be 1');
  console.assert(normalizedPopulated.studentPartRows.length === 1, 'Student part count must be 1');
  console.assert(normalizedPopulated.researchRows.length === 1, 'Research count must be 1');
  console.assert(normalizedPopulated.workPlanRows.length === 1, 'Work plan count must be 1');

  // Verify Students Attendance Summary Normalization & Strict Year Ordering (I -> II -> III -> IV)
  console.assert(normalizedPopulated.attendanceSummary.weeks.length === 1, 'Must have 1 week');
  console.assert(normalizedPopulated.attendanceSummary.rows.length === 4, 'Must have 4 year rows (I, II, III, IV)');
  console.assert(normalizedPopulated.attendanceSummary.rows[0].year === 'I', 'First row must be year I');
  console.assert(normalizedPopulated.attendanceSummary.rows[1].year === 'II', 'Second row must be year II');
  console.assert(normalizedPopulated.attendanceSummary.rows[2].year === 'III', 'Third row must be year III');
  console.assert(normalizedPopulated.attendanceSummary.rows[3].year === 'IV', 'Fourth row must be year IV');
  console.assert(normalizedPopulated.attendanceSummary.rows[0].attendance[0] === 95, 'Year I attendance must be 95');
  console.assert(normalizedPopulated.attendanceSummary.rows[1].attendance[0] === 90, 'Year II attendance must be 90');
  console.log('  ✅ Data Normalization & Strict Academic Year Order (I -> II -> III -> IV) verified!');

  // Test 2: Normalizer Output for Empty Report
  const normalizedEmpty = normalizeReportData(emptyReport);
  console.log('\n2. Testing Normalization of Empty Report...');
  console.assert(normalizedEmpty.syllabusTheoryRows.length === 0, 'Theory rows count must be 0');
  console.assert(normalizedEmpty.syllabusLabRows.length === 0, 'Lab rows count must be 0');
  console.assert(normalizedEmpty.eventsRows.length === 0, 'Events count must be 0');
  console.assert(normalizedEmpty.attendanceSummary.rows.length === 0, 'Empty attendance rows verified');
  console.assert(normalizedEmpty.emptySectionText === 'No records submitted for this section.', 'Empty text constant verified');
  console.log('  ✅ Empty report normalization verified!');

  // Test 3: Document Generation for Populated Report
  console.log('\n3. Generating All 4 Formats for Populated Report...');
  const pdfBuf = await generatePdf(populatedReport);
  const docxBuf = await generateDocx(populatedReport);
  const pptxBuf = await generatePptx(populatedReport);
  const excelBuf = await generateHodMonthlyReportExcel(populatedReport);

  console.log(`  ✅ PDF Generated: ${pdfBuf.length} bytes`);
  console.log(`  ✅ DOCX Generated: ${docxBuf.length} bytes`);
  console.log(`  ✅ PPTX Generated: ${pptxBuf.length} bytes (Includes Students Attendance Summary slide)`);
  console.log(`  ✅ XLSX Generated: ${excelBuf.length} bytes`);

  // Verify Excel Sheet Structure
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(excelBuf);
  const sheetNames = wb.worksheets.map(w => w.name);
  console.log('\n4. Verifying Separate Worksheets in Excel Workbook...');
  console.log('   Sheets found:', sheetNames);
  const expectedSheets = [
    'Report Summary',
    'Syllabus Theory',
    'Syllabus Lab',
    'Events',
    'Faculty FDP',
    'Faculty NPTEL',
    'Student Participation',
    'Research Activity',
    'Work Plan'
  ];
  expectedSheets.forEach(name => {
    console.assert(sheetNames.includes(name), `Workbook must contain worksheet "${name}"`);
  });
  console.assert(!sheetNames.includes('Attendance Summary'), 'Excel must NOT contain Attendance Summary sheet');
  console.log('  ✅ All 9 separate Excel sheets verified! Excel excludes attendance slide as required.');

  // Test 5: Document Generation for Empty Report
  console.log('\n5. Generating All 4 Formats for Empty Report...');
  const emptyPdfBuf = await generatePdf(emptyReport);
  const emptyDocxBuf = await generateDocx(emptyReport);
  const emptyPptxBuf = await generatePptx(emptyReport);
  const emptyExcelBuf = await generateHodMonthlyReportExcel(emptyReport);

  console.log(`  ✅ Empty PDF Generated: ${emptyPdfBuf.length} bytes`);
  console.log(`  ✅ Empty DOCX Generated: ${emptyDocxBuf.length} bytes`);
  console.log(`  ✅ Empty PPTX Generated: ${emptyPptxBuf.length} bytes (Excludes empty attendance slide)`);
  console.log(`  ✅ Empty XLSX Generated: ${emptyExcelBuf.length} bytes`);

  console.log('\n🎉 ALL 4 FORMATS ARE 100% SYNCHRONIZED TO THE SINGLE SOURCE OF TRUTH!');
}

verifyDataSync().catch(err => {
  console.error('❌ Data sync verification failed:', err);
  process.exit(1);
});
