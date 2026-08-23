import express from 'express';
import { db } from '../db.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Helper: Compute Department Monthly Summary Data
async function computeDepartmentSummaryData(departmentId, academic_year, semester, month) {
  const allReports = await db.getReports({
    department_id: Number(departmentId),
    report_type: 'monthly',
    academic_year,
    semester,
    month,
    status: 'Approved'
  });

  const staffList = await db.getDepartmentStaff(Number(departmentId));
  const totalStaff = staffList.length;
  const submittedCount = allReports.length;
  const submissionPct = totalStaff > 0 ? parseFloat(((submittedCount / totalStaff) * 100).toFixed(2)) : 0;

  let syllabusSum = 0;
  let syllabusCount = 0;
  let attendanceSum = 0;
  let attendanceCount = 0;
  let classesSum = 0;
  let eventsSum = 0;
  let fdpSum = 0;
  let researchSum = 0;
  let projectSum = 0;
  let achievementSum = 0;

  for (const report of allReports) {
    const detailed = await db.getReportById(report.id);

    // Teaching
    if (detailed.teaching_activities) {
      detailed.teaching_activities.forEach(t => {
        syllabusSum += t.syllabus_pct || 0;
        syllabusCount++;
        classesSum += t.classes_taken || 0;
      });
    }

    // Attendance
    if (detailed.student_attendance) {
      detailed.student_attendance.forEach(a => {
        attendanceSum += a.avg_attendance_pct || 0;
        attendanceCount++;
      });
    }

    // Activities counting
    if (detailed.events) eventsSum += detailed.events.length;
    if (detailed.fdp_training) fdpSum += detailed.fdp_training.length;
    if (detailed.research_activities) researchSum += detailed.research_activities.length;
    if (detailed.project_guidance) projectSum += detailed.project_guidance.length;
    if (detailed.achievements) achievementSum += detailed.achievements.length;
  }

  return {
    department_id: Number(departmentId),
    month,
    academic_year,
    semester,
    totalStaff,
    submittedReports: submittedCount,
    submissionPercentage: submissionPct,
    avgSyllabusCompletion: syllabusCount > 0 ? parseFloat((syllabusSum / syllabusCount).toFixed(2)) : 0,
    avgAttendance: attendanceCount > 0 ? parseFloat((attendanceSum / attendanceCount).toFixed(2)) : 0,
    totalClassesTaken: classesSum,
    totalEvents: eventsSum,
    totalFdps: fdpSum,
    totalResearchActivities: researchSum,
    totalProjectsGuided: projectSum,
    totalAchievements: achievementSum
  };
}

// Helper: Compute College Monthly Summary Data
async function computeCollegeSummaryData(academic_year, semester, month) {
  const depts = await db.getDepartments();
  const departmentSummaries = [];

  let totalStaff = 0;
  let totalSubmitted = 0;
  let globalSyllabusSum = 0;
  let globalSyllabusCount = 0;
  let globalAttendanceSum = 0;
  let globalAttendanceCount = 0;
  let totalClasses = 0;
  let totalEvents = 0;
  let totalFdps = 0;
  let totalResearch = 0;
  let totalProjects = 0;
  let totalAchievements = 0;

  for (const dept of depts) {
    const allReports = await db.getReports({
      department_id: dept.id,
      report_type: 'monthly',
      academic_year,
      semester,
      month,
      status: 'Approved'
    });

    const staffList = await db.getDepartmentStaff(dept.id);
    const deptStaffCount = staffList.length;
    totalStaff += deptStaffCount;
    totalSubmitted += allReports.length;

    let syllabusSum = 0;
    let syllabusCount = 0;
    let attendanceSum = 0;
    let attendanceCount = 0;
    let classesSum = 0;
    let eventsSum = 0;
    let fdpSum = 0;
    let researchSum = 0;
    let projectSum = 0;
    let achievementSum = 0;

    for (const report of allReports) {
      const detailed = await db.getReportById(report.id);
      if (detailed.teaching_activities) {
        detailed.teaching_activities.forEach(t => {
          syllabusSum += t.syllabus_pct || 0;
          syllabusCount++;
          classesSum += t.classes_taken || 0;
        });
      }
      if (detailed.student_attendance) {
        detailed.student_attendance.forEach(a => {
          attendanceSum += a.avg_attendance_pct || 0;
          attendanceCount++;
        });
      }
      if (detailed.events) eventsSum += detailed.events.length;
      if (detailed.fdp_training) fdpSum += detailed.fdp_training.length;
      if (detailed.research_activities) researchSum += detailed.research_activities.length;
      if (detailed.project_guidance) projectSum += detailed.project_guidance.length;
      if (detailed.achievements) achievementSum += detailed.achievements.length;
    }

    globalSyllabusSum += syllabusSum;
    globalSyllabusCount += syllabusCount;
    globalAttendanceSum += attendanceSum;
    globalAttendanceCount += attendanceCount;
    totalClasses += classesSum;
    totalEvents += eventsSum;
    totalFdps += fdpSum;
    totalResearch += researchSum;
    totalProjects += projectSum;
    totalAchievements += achievementSum;

    departmentSummaries.push({
      id: dept.id,
      department_name: dept.department_name,
      totalStaff: deptStaffCount,
      submittedReports: allReports.length,
      submissionPercentage: deptStaffCount > 0 ? parseFloat(((allReports.length / deptStaffCount) * 100).toFixed(2)) : 0,
      avgSyllabusCompletion: syllabusCount > 0 ? parseFloat((syllabusSum / syllabusCount).toFixed(2)) : 0,
      avgAttendance: attendanceCount > 0 ? parseFloat((attendanceSum / attendanceCount).toFixed(2)) : 0,
      totalClassesTaken: classesSum,
      totalEvents: eventsSum,
      totalFdps: fdpSum,
      totalResearchActivities: researchSum,
      totalProjectsGuided: projectSum,
      totalAchievements: achievementSum
    });
  }

  return {
    month,
    academic_year,
    semester,
    totalStaff,
    submittedReports: totalSubmitted,
    submissionPercentage: totalStaff > 0 ? parseFloat(((totalSubmitted / totalStaff) * 100).toFixed(2)) : 0,
    avgSyllabusCompletion: globalSyllabusCount > 0 ? parseFloat((globalSyllabusSum / globalSyllabusCount).toFixed(2)) : 0,
    avgAttendance: globalAttendanceCount > 0 ? parseFloat((globalAttendanceSum / globalAttendanceCount).toFixed(2)) : 0,
    totalClassesTaken: totalClasses,
    totalEvents,
    totalFdps,
    totalResearchActivities: totalResearch,
    totalProjectsGuided: totalProjects,
    totalAchievements,
    departments: departmentSummaries
  };
}

// 1. Staff Dashboard Metrics
router.get('/dashboard/staff', authenticateToken, async (req, res) => {
  try {
    const stats = await db.getStaffDashboardMetrics(req.user.id);
    const reports = await db.getReports({ staff_id: req.user.id });
    const lastSubmitted = reports.find(r => r.status === 'Approved' || r.status === 'Submitted' || r.status === 'Under Review');
    const pendingCount = reports.filter(r => r.status === 'Draft' || r.status === 'Rejected').length;

    res.json({
      metrics: stats,
      currentAcademicYear: req.user.academic_year || '2025-2026',
      currentSemester: req.user.semester || 'ODD',
      lastSubmittedReport: lastSubmitted || null,
      pendingSubmissionsCount: pendingCount
    });
  } catch (error) {
    console.error('Staff Dashboard Metrics Error:', error);
    res.status(500).json({ message: 'Failed to retrieve staff dashboard metrics' });
  }
});

// 2. HOD Dashboard Metrics
router.get('/dashboard/hod', authenticateToken, authorizeRoles('hod', 'admin'), async (req, res) => {
  const departmentId = req.user.role === 'hod' ? req.user.department_id : req.query.department_id;
  
  if (!departmentId) {
    return res.status(400).json({ message: 'Department ID is required' });
  }

  try {
    const stats = await db.getHodDashboardMetrics(Number(departmentId));
    res.json({ metrics: stats });
  } catch (error) {
    console.error('HOD Dashboard Metrics Error:', error);
    res.status(500).json({ message: 'Failed to retrieve HOD dashboard metrics' });
  }
});

// 3. Admin Dashboard Metrics
router.get('/dashboard/admin', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const stats = await db.getAdminDashboardMetrics();
    res.json({ metrics: stats });
  } catch (error) {
    console.error('Admin Dashboard Metrics Error:', error);
    res.status(500).json({ message: 'Failed to retrieve Admin dashboard metrics' });
  }
});

// 4. Department Comparisons
router.get('/comparison', authenticateToken, authorizeRoles('admin', 'hod'), async (req, res) => {
  const { academic_year, semester, month } = req.query;

  try {
    const comparisons = await db.getDepartmentComparison(academic_year, semester, month);
    res.json({ comparisons });
  } catch (error) {
    console.error('Department Comparison Error:', error);
    res.status(500).json({ message: 'Failed to compute department comparisons' });
  }
});

// 5. Department Monthly Summary Report Data JSON
router.get('/department-monthly-summary', authenticateToken, authorizeRoles('hod', 'admin'), async (req, res) => {
  const departmentId = req.user.role === 'hod' ? req.user.department_id : req.query.department_id;
  const { academic_year, semester, month } = req.query;

  if (!departmentId || !month || !academic_year || !semester) {
    return res.status(400).json({ message: 'Department ID, month, academic_year, and semester are required' });
  }

  try {
    const summary = await computeDepartmentSummaryData(departmentId, academic_year, semester, month);
    res.json({ summary });
  } catch (error) {
    console.error('Department Monthly Summary JSON Error:', error);
    res.status(500).json({ message: 'Failed to compile department monthly summary' });
  }
});

// 6. College Monthly Summary Data JSON
router.get('/college-monthly-summary', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { academic_year, semester, month } = req.query;

  if (!month || !academic_year || !semester) {
    return res.status(400).json({ message: 'Month, academic_year, and semester are required' });
  }

  try {
    const summary = await computeCollegeSummaryData(academic_year, semester, month);
    res.json({ summary });
  } catch (error) {
    console.error('College Monthly Summary JSON Error:', error);
    res.status(500).json({ message: 'Failed to compile college monthly summary' });
  }
});

// 7. Download Department Monthly Summary (Word DOCX)
router.get('/department-monthly-summary/word', authenticateToken, authorizeRoles('hod', 'admin'), async (req, res) => {
  const departmentId = req.user.role === 'hod' ? req.user.department_id : req.query.department_id;
  const { academic_year, semester, month } = req.query;

  if (!departmentId || !month || !academic_year || !semester) {
    return res.status(400).json({ message: 'Missing filter query parameters' });
  }

  try {
    const summary = await computeDepartmentSummaryData(departmentId, academic_year, semester, month);
    const dept = await db.getDepartmentById(Number(departmentId));
    const deptName = dept ? dept.department_name : 'Department';

    const { generateDepartmentSummaryDocx } = await import('../services/docxGenerator.js');
    const docxBuffer = await generateDepartmentSummaryDocx(summary, deptName);

    const cleanDept = deptName.toLowerCase().includes('information technology') ? 'IT' : deptName.replace(/[\s\.]+/g, '_');
    const year = academic_year.split('-')[0];
    const filename = `${cleanDept}_Department_Report_${month}_${year}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (error) {
    console.error('Dept Summary Word Gen Error:', error);
    res.status(500).json({ message: 'Failed to generate department summary word report' });
  }
});

// 7b. Download Department Monthly Summary (PDF)
router.get('/department-monthly-summary/pdf', authenticateToken, authorizeRoles('hod', 'admin'), async (req, res) => {
  const departmentId = req.user.role === 'hod' ? req.user.department_id : req.query.department_id;
  const { academic_year, semester, month } = req.query;

  if (!departmentId || !month || !academic_year || !semester) {
    return res.status(400).json({ message: 'Missing filter query parameters' });
  }

  try {
    const summary = await computeDepartmentSummaryData(departmentId, academic_year, semester, month);
    const dept = await db.getDepartmentById(Number(departmentId));
    const deptName = dept ? dept.department_name : 'Department';

    const { generateHodMonthlyReportPdf } = await import('../services/pdfGenerator.js');
    const pdfBuffer = await generateHodMonthlyReportPdf(summary, deptName);

    const cleanDept = deptName.toLowerCase().includes('information technology') ? 'IT' : deptName.replace(/[\s\.]+/g, '_');
    const year = academic_year.split('-')[0];
    const filename = `${cleanDept}_Department_Report_${month}_${year}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Dept Summary PDF Gen Error:', error);
    res.status(500).json({ message: 'Failed to generate department summary pdf report' });
  }
});

// 7c. Download Department Monthly Summary (Excel XLSX)
router.get('/department-monthly-summary/excel', authenticateToken, authorizeRoles('hod', 'admin'), async (req, res) => {
  const departmentId = req.user.role === 'hod' ? req.user.department_id : req.query.department_id;
  const { academic_year, semester, month } = req.query;

  if (!departmentId || !month || !academic_year || !semester) {
    return res.status(400).json({ message: 'Missing filter query parameters' });
  }

  try {
    const summary = await computeDepartmentSummaryData(departmentId, academic_year, semester, month);
    const dept = await db.getDepartmentById(Number(departmentId));
    const deptName = dept ? dept.department_name : 'Department';

    const { generateHodMonthlyReportExcel } = await import('../services/excelGenerator.js');
    const excelBuffer = await generateHodMonthlyReportExcel(summary, deptName);

    const cleanDept = deptName.toLowerCase().includes('information technology') ? 'IT' : deptName.replace(/[\s\.]+/g, '_');
    const year = academic_year.split('-')[0];
    const filename = `${cleanDept}_Department_Report_${month}_${year}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('Dept Summary Excel Gen Error:', error);
    res.status(500).json({ message: 'Failed to generate department summary excel report' });
  }
});

// 8. Download Department Monthly Summary (PowerPoint PPTX)
router.get('/department-monthly-summary/ppt', authenticateToken, authorizeRoles('hod', 'admin'), async (req, res) => {
  const departmentId = req.user.role === 'hod' ? req.user.department_id : req.query.department_id;
  const { academic_year, semester, month } = req.query;

  if (!departmentId || !month || !academic_year || !semester) {
    return res.status(400).json({ message: 'Missing filter query parameters' });
  }

  try {
    const summary = await computeDepartmentSummaryData(departmentId, academic_year, semester, month);
    const dept = await db.getDepartmentById(Number(departmentId));
    const deptName = dept ? dept.department_name : 'Department';

    const { generateDepartmentSummaryPptx } = await import('../services/pptxGenerator.js');
    const pptxBuffer = await generateDepartmentSummaryPptx(summary, deptName);

    const cleanDept = deptName.toLowerCase().includes('information technology') ? 'IT' : deptName.replace(/[\s\.]+/g, '_');
    const year = academic_year.split('-')[0];
    const filename = `${cleanDept}_Department_Report_${month}_${year}.pptx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pptxBuffer);
  } catch (error) {
    console.error('Dept Summary PPT Gen Error:', error);
    res.status(500).json({ message: 'Failed to generate department summary presentation' });
  }
});

// 9. Download College Monthly Summary (Word DOCX)
router.get('/college-monthly-summary/word', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { academic_year, semester, month } = req.query;

  if (!month || !academic_year || !semester) {
    return res.status(400).json({ message: 'Missing filter query parameters' });
  }

  try {
    const summary = await computeCollegeSummaryData(academic_year, semester, month);

    const { generateCollegeSummaryDocx } = await import('../services/docxGenerator.js');
    const docxBuffer = await generateCollegeSummaryDocx(summary);

    const year = academic_year.split('-')[0];
    const filename = `College_Monthly_Report_${month}_${year}.docx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (error) {
    console.error('College Summary Word Gen Error:', error);
    res.status(500).json({ message: 'Failed to generate college summary word report' });
  }
});

// 9b. Download College Monthly Summary (Excel XLSX)
router.get('/college-monthly-summary/excel', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { academic_year, semester, month } = req.query;

  if (!month || !academic_year || !semester) {
    return res.status(400).json({ message: 'Missing filter query parameters' });
  }

  try {
    const summary = await computeCollegeSummaryData(academic_year, semester, month);

    const { generateCollegeSummaryExcel } = await import('../services/excelGenerator.js');
    const excelBuffer = await generateCollegeSummaryExcel(summary);

    const year = academic_year.split('-')[0];
    const filename = `College_Monthly_Report_${month}_${year}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuffer);
  } catch (error) {
    console.error('College Summary Excel Gen Error:', error);
    res.status(500).json({ message: 'Failed to generate college summary excel report' });
  }
});

// 10. Download College Monthly Summary (PowerPoint PPTX)
router.get('/college-monthly-summary/ppt', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { academic_year, semester, month } = req.query;

  if (!month || !academic_year || !semester) {
    return res.status(400).json({ message: 'Missing filter query parameters' });
  }

  try {
    const summary = await computeCollegeSummaryData(academic_year, semester, month);

    const { generateCollegeSummaryPptx } = await import('../services/pptxGenerator.js');
    const pptxBuffer = await generateCollegeSummaryPptx(summary);

    const year = academic_year.split('-')[0];
    const filename = `College_Monthly_Report_${month}_${year}.pptx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pptxBuffer);
  } catch (error) {
    console.error('College Summary PPT Gen Error:', error);
    res.status(500).json({ message: 'Failed to generate college summary presentation' });
  }
});

export default router;
