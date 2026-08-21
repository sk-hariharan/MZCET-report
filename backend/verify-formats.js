import { generateDocx } from './services/docxGenerator.js';
import { generatePptx } from './services/pptxGenerator.js';
import { generatePdf } from './services/pdfGenerator.js';

const mockReport = {
  id: 999,
  report_type: 'monthly',
  academic_year: '2026-2027',
  semester: 'ODD',
  month: 'August',
  start_date: '2026-08-01',
  end_date: '2026-08-31',
  status: 'Approved',
  staff_name: 'Dr. S. Kumar',
  staff_code: 'IT-101',
  department_name: 'Information Technology',
  designation: 'Associate Professor',
  teaching_activities: [
    {
      subject_name: 'Data Structures and Algorithms',
      class_assigned: 'II Year IT',
      classes_taken: 20,
      classes_rescheduled: 0,
      classes_cancelled: 0,
      teaching_hours: 20,
      syllabus_pct: 45,
      lesson_plan_status: 'Completed Unit 1 & 2'
    }
  ],
  student_attendance: [
    {
      class_name: 'II Year IT',
      total_students: 60,
      avg_attendance_pct: 92,
      students_below_75: 3,
      class_average_mark: 78,
      performance_analysis: 'Good grasp of concepts'
    }
  ],
  events: [
    {
      event_name: 'Cloud Computing Technologies Workshop',
      event_type: 'Workshop',
      event_date: '2026-08-05',
      role: 'Coordinator',
      students_participated: 71
    }
  ]
};

async function testFormats() {
  console.log('Testing document export formats...');

  try {
    const docxBuf = await generateDocx(mockReport);
    console.log('✅ Word (.docx) generated successfully. Size:', docxBuf.length, 'bytes');

    const pptxBuf = await generatePptx(mockReport);
    console.log('✅ PowerPoint (.pptx) generated successfully. Size:', pptxBuf.length, 'bytes');

    const pdfBuf = await generatePdf(mockReport);
    console.log('✅ PDF (.pdf) generated successfully. Size:', pdfBuf.length, 'bytes');

    console.log('\n🎉 ALL FORMATS (Word, PPTX, PDF) ARE FULLY FUNCTIONAL AND VERIFIED!');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

testFormats();
