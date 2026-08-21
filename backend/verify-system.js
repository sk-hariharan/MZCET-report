import { initializeDatabase } from './db.js';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const res = await fetch(fullUrl, {
    ...options,
    headers
  });
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    return { ok: res.ok, status: res.status, data, headers: res.headers };
  } else {
    const buffer = await res.arrayBuffer();
    return { ok: res.ok, status: res.status, buffer: Buffer.from(buffer), headers: res.headers };
  }
}

async function runTests() {
  console.log('======================================================');
  console.log('   MZCET FacultyReport Automated Verification Suite   ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    await initializeDatabase();

    // 1. Test Health Check
    const health = await request('http://localhost:5000/health');
    assert(health.ok && health.data?.status === 'ok', 'Server health check returns status ok');

    // 2. Test Staff Login
    const staffAuth = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'mzcet@it_coordinator', password: 'mzcet@1234' })
    });
    assert(staffAuth.ok && !!staffAuth.data?.token, 'Staff Login successful (mzcet@it_coordinator)');
    const staffToken = staffAuth.data?.token;

    // 3. Test HOD Login
    const hodAuth = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'mzcet@it_hod', password: 'mzcet@1234' })
    });
    assert(hodAuth.ok && !!hodAuth.data?.token, 'HOD Login successful (mzcet@it_hod)');
    const hodToken = hodAuth.data?.token;

    // 4. Test Admin Login
    const adminAuth = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'mzcet@admin', password: 'mzcet@1234' })
    });
    assert(adminAuth.ok && !!adminAuth.data?.token, 'Admin Login successful (mzcet@admin)');
    const adminToken = adminAuth.data?.token;

    // 5. Test Staff Profile Retrieval
    const profile = await request('/auth/profile', {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(profile.ok && profile.data?.user?.email === 'staff@mzcet.edu.in', 'Profile retrieval verified');

    // 6. Test Report Creation (Weekly Report with child sub-tables)
    const randomWeek = Math.floor(Math.random() * 8000) + 1000;
    const newWeeklyReportPayload = {
      report_type: 'weekly',
      academic_year: '2025-2026',
      semester: 'ODD',
      week_number: randomWeek,
      month: 'August',
      start_date: '2026-08-10',
      end_date: '2026-08-16',
      status: 'Draft',
      sections: {
        teaching_activities: [
          {
            subject_name: 'Distributed Cloud Systems',
            class_assigned: 'IV Year IT',
            classes_taken: 5,
            teaching_hours: 5,
            syllabus_pct: 85.0,
            lesson_plan_status: 'On Track',
            current_unit: 'Unit 4'
          },
          {
            subject_name: 'Database Engineering',
            class_assigned: 'III Year IT',
            classes_taken: 4,
            teaching_hours: 4,
            syllabus_pct: 78.0,
            lesson_plan_status: 'On Track',
            current_unit: 'Unit 3'
          }
        ],
        student_attendance: [
          {
            class_name: 'IV Year IT',
            total_students: 60,
            avg_attendance_pct: 92.5,
            students_below_75: 2,
            class_average_mark: 78.5
          }
        ],
        assessments: [
          {
            assessment_name: 'Unit Test 2',
            given_date: '2026-08-12',
            submission_count: 58,
            co_wise_performance: 'CO3: 82%, CO4: 76%'
          }
        ],
        events: [
          {
            event_name: 'National Technical Symposium TechZion 2026',
            event_date: '2026-08-14',
            event_type: 'Symposium',
            role: 'Staff Coordinator',
            students_participated: 120,
            outcome: 'Over 120 student paper submissions'
          }
        ],
        fdp_training: [
          {
            program_type: 'FDP',
            program_title: 'Generative AI & LLM Systems in Engineering',
            organizing_institution: 'MZCET / Anna University',
            duration: '5 Days',
            mode: 'Hybrid',
            application_in_teaching: 'Incorporated LLM prompts in Lab demonstrations'
          }
        ],
        research_activities: [
          {
            work_done: 'Paper on Scalable Microservices Architecture',
            journal_paper: 'International Journal of Cloud Computing',
            publication_status: 'Accepted',
            scopus_wos: 1,
            citation_count: 12
          }
        ],
        future_plans: [
          {
            planned_classes: 6,
            target_syllabus_pct: 95.0,
            assignments_planned: 'Assignment 4 on Kubernetes Orchestration',
            target_to_achieve: 'Complete Unit 4 and conduct Quiz 3'
          }
        ],
        additional_remarks: [
          {
            overall_summary: 'All syllabus portions on track. Hands-on labs completed successfully.',
            major_contributions: 'Organized Department Symposium TechZion 2026.'
          }
        ]
      }
    };

    const createReportRes = await request('/reports', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${staffToken}` },
      body: JSON.stringify(newWeeklyReportPayload)
    });
    if (!createReportRes.ok) {
      console.log('Create report error details:', createReportRes.status, createReportRes.data);
    }

    assert(createReportRes.ok && createReportRes.data?.report?.id, `Weekly Report created successfully (ID: ${createReportRes.data?.report?.id})`);
    const reportId = createReportRes.data?.report?.id;

    // 7. Test Report Detail Retrieval
    const getReportRes = await request(`/reports/${reportId}`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(
      getReportRes.ok && 
      getReportRes.data?.report?.teaching_activities?.length === 2 &&
      getReportRes.data?.report?.events?.length === 1,
      'Report retrieved with complete relational sub-tables'
    );

    // 8. Test State Transition: Draft -> Submitted
    const submitRes = await request(`/reports/${reportId}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${staffToken}` },
      body: JSON.stringify({ status: 'Submitted' })
    });
    assert(submitRes.ok && submitRes.data?.report?.status === 'Submitted', 'Report transition: Draft -> Submitted');

    // 9. Test State Transition: HOD Reject with Comments
    const rejectRes = await request(`/reports/${reportId}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${hodToken}` },
      body: JSON.stringify({ status: 'Rejected', review_comments: 'Please verify the remedial class topic list.' })
    });
    assert(rejectRes.ok && rejectRes.data?.report?.status === 'Rejected', 'HOD Review: Report Rejected with feedback comment');

    // 10. Test State Transition: Staff Resubmit
    const resubmitRes = await request(`/reports/${reportId}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${staffToken}` },
      body: JSON.stringify({ status: 'Resubmitted' })
    });
    assert(resubmitRes.ok && resubmitRes.data?.report?.status === 'Resubmitted', 'Staff Resubmit: Status transitioned to Resubmitted');

    // 11. Test State Transition: HOD Final Approval
    const approveRes = await request(`/reports/${reportId}/status`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${hodToken}` },
      body: JSON.stringify({ status: 'Approved', review_comments: 'Excellent work and documentation.' })
    });
    assert(approveRes.ok && approveRes.data?.report?.status === 'Approved', 'HOD Final Approval: Report status Approved');

    // 12. Test Word Document Generation (DOCX)
    const docxRes = await request(`/reports/${reportId}/word`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(docxRes.ok && docxRes.buffer && docxRes.buffer.length > 500, `Word DOCX Report generated successfully (${docxRes.buffer?.length} bytes)`);

    // 13. Test PowerPoint Presentation Generation (PPTX)
    const pptxRes = await request(`/reports/${reportId}/ppt`, {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(pptxRes.ok && pptxRes.buffer && pptxRes.buffer.length > 500, `PowerPoint PPTX Report generated successfully (${pptxRes.buffer?.length} bytes)`);

    // 14. Test Staff Analytics Dashboard
    const staffAnalytics = await request('/analytics/dashboard/staff', {
      headers: { 'Authorization': `Bearer ${staffToken}` }
    });
    assert(staffAnalytics.ok && staffAnalytics.data?.metrics?.total >= 1, 'Staff Dashboard Analytics metrics calculated');

    // 15. Test HOD Analytics Dashboard
    const hodAnalytics = await request('/analytics/dashboard/hod?department_id=1', {
      headers: { 'Authorization': `Bearer ${hodToken}` }
    });
    assert(hodAnalytics.ok && hodAnalytics.data?.metrics?.totalStaff >= 1, 'HOD Dashboard Analytics metrics calculated');

    // 16. Test Admin Analytics Dashboard
    const adminAnalytics = await request('/analytics/dashboard/admin', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminAnalytics.ok && adminAnalytics.data?.metrics?.totalDepartments >= 1, 'Admin Institutional Dashboard metrics calculated');

    // 17. Test Department Comparison
    const comparison = await request('/analytics/comparison?academic_year=2025-2026&semester=ODD&month=August', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(comparison.ok && Array.isArray(comparison.data?.comparisons), 'Comparative department analysis aggregates computed');

    // 18. Test College Monthly Word Summary Export
    const collegeWordRes = await request('/analytics/college-monthly-summary/word?academic_year=2025-2026&semester=ODD&month=August', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(collegeWordRes.ok && collegeWordRes.buffer?.length > 500, `College Monthly Word Summary generated (${collegeWordRes.buffer?.length} bytes)`);

    // 19. Test College Monthly PPT Summary Export
    const collegePptRes = await request('/analytics/college-monthly-summary/ppt?academic_year=2025-2026&semester=ODD&month=August', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(collegePptRes.ok && collegePptRes.buffer?.length > 500, `College Monthly PPT Summary generated (${collegePptRes.buffer?.length} bytes)`);

    console.log('\n======================================================');
    console.log(` Verification Completed: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('Fatal Verification Error:', error);
    process.exit(1);
  }
}

runTests();
