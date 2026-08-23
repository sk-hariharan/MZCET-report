import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ImageRun,
  TextRun,
  Header,
  Footer,
  BorderStyle,
  PageNumber
} from 'docx';
import fs from 'fs';
import path from 'path';

// Helper: Try to read Mount Zion College top header logo image
function getHeaderLogoBuffer() {
  const logoPaths = [
    'c:\\Users\\HARIHARAN S\\OneDrive\\Desktop\\Report-Automation\\frontend\\public\\pdf word top logo.png',
    path.resolve('frontend/public/pdf word top logo.png'),
    path.resolve('../frontend/public/pdf word top logo.png'),
    path.resolve('public/pdf word top logo.png'),
    path.resolve('pdf word top logo.png')
  ];

  for (const logoPath of logoPaths) {
    if (fs.existsSync(logoPath)) {
      try {
        return fs.readFileSync(logoPath);
      } catch (err) {
        console.error('Error reading header logo file:', err);
      }
    }
  }
  return null;
}

// Table styling helper
function createStyledTable(headers, rows) {
  const tableRows = [];

  // Header Row
  tableRows.push(
    new TableRow({
      children: headers.map(h => new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 18 })],
            alignment: AlignmentType.CENTER
          })
        ],
        shading: { fill: '1E3A8A' }, // MZCET Navy Blue
        margins: { top: 100, bottom: 100, left: 100, right: 100 }
      }))
    })
  );

  // Data Rows
  if (!rows || rows.length === 0) {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'No records submitted for this section.', italic: true, size: 18 })],
                alignment: AlignmentType.CENTER
              })
            ],
            columnSpan: headers.length,
            margins: { top: 80, bottom: 80, left: 100, right: 100 }
          })
        ]
      })
    );
  } else {
    rows.forEach(row => {
      tableRows.push(
        new TableRow({
          children: row.map(cellText => new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(cellText !== undefined && cellText !== null ? cellText : '—'), size: 17 })]
              })
            ],
            margins: { top: 80, bottom: 80, left: 100, right: 100 }
          }))
        })
      );
    });
  }

  return new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' }
    }
  });
}

// Section Title Helper
function createSectionTitle(title) {
  return new Paragraph({
    children: [
      new TextRun({ text: title, bold: true, color: '1E3A8A', size: 22 })
    ],
    spacing: { before: 200, after: 100 },
    keepWithNext: true
  });
}

// Sub-section Title Helper
function createSubSectionTitle(title) {
  return new Paragraph({
    children: [
      new TextRun({ text: title, bold: true, color: '0F172A', size: 19 })
    ],
    spacing: { before: 140, after: 80 },
    keepWithNext: true
  });}

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

// Main DOCX Generator for individual faculty reports
export async function generateDocx(report) {
  const headerLogoBuffer = getHeaderLogoBuffer();
  const children = [];

  // Deduplicate section arrays independently
  const teaching_activities = removeDuplicates(report.teaching_activities || [], ['subject_name', 'class_assigned']);
  const student_attendance = removeDuplicates(report.student_attendance || [], ['class_name']);
  const assessments = removeDuplicates(report.assessments || [], ['assessment_name', 'given_date']);
  const remedial_activities = removeDuplicates(report.remedial_activities || [], ['class_name', 'date_conducted']);
  const mentoring = removeDuplicates(report.mentoring || [], ['meeting_date', 'mentored_count']);
  const project_guidance = removeDuplicates(report.project_guidance || [], ['project_title']);
  const department_activities = removeDuplicates(report.department_activities || [], ['academic_planning']);
  const events = removeDuplicates(report.events || [], ['event_name', 'event_date']);
  const fdp_training = removeDuplicates(report.fdp_training || [], ['program_title', 'start_date']);
  const research_activities = removeDuplicates(report.research_activities || [], ['journal_paper', 'conference_paper', 'research_proposal', 'work_done']);
  const achievements = removeDuplicates(report.achievements || [], ['achievement_title', 'description']);
  const administrative_activities = removeDuplicates(report.administrative_activities || [], ['exam_duty', 'committee_responsibility']);
  const lab_activities = removeDuplicates(report.lab_activities || [], ['laboratory_handled']);
  const meetings = removeDuplicates(report.meetings || [], ['title', 'meeting_date']);
  const issues = removeDuplicates(report.issues || [], ['academic_issues', 'technical_issues']);
  const future_plans = removeDuplicates(report.future_plans || [], ['particulars', 'target_to_achieve']);
  const additional_remarks = removeDuplicates(report.additional_remarks || [], ['overall_summary']);

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${(report.report_type || 'FACULTY').toUpperCase()} ACTIVITY REPORT`, bold: true, color: '1E3A8A', size: 24 })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 120 }
    })
  );

  // Staff Profile Table
  const profileTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Staff Name:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: report.staff_name || 'N/A', size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Staff ID / Code:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: report.staff_code || 'N/A', size: 18 })] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Department:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: report.department_name || 'N/A', size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Designation:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: report.designation || 'N/A', size: 18 })] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Reporting Period:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.month || ''} ${report.week_number ? ' - Week ' + report.week_number : ''}`, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Period Dates:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.start_date || 'N/A'} to ${report.end_date || 'N/A'}`, size: 18 })] })] })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Academic Year:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: report.academic_year || 'N/A', size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Semester & Status:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.semester || 'N/A'} (${report.status || 'Draft'})`, size: 18 })] })] })
        ]
      })
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' }
    }
  });

  children.push(profileTable);
  children.push(new Paragraph({ spacing: { after: 180 } }));

  // 1. Teaching Activities
  children.push(createSectionTitle('1. Teaching / Academic Activities'));
  const teachingHeaders = ['Subject Handled', 'Class Assigned', 'Taken/Resch/Cancel', 'Teaching Hours', 'Syllabus Comp. %', 'Lesson Plan Status'];
  const teachingRows = teaching_activities.map(t => [
    t.subject_name,
    t.class_assigned && t.class_assigned.includes(' | ')
      ? `${t.class_assigned.split(' | ')[1]} - ${t.class_assigned.split(' | ')[2]} (${t.class_assigned.split(' | ')[0]})`
      : t.class_assigned || '—',
    `${t.classes_taken || 0} / ${t.classes_rescheduled || 0} / ${t.classes_cancelled || 0}`,
    t.teaching_hours,
    `${t.syllabus_pct || 0}%`,
    t.lesson_plan_status
  ]);
  children.push(createStyledTable(teachingHeaders, teachingRows));

  // 2. Student Attendance & Performance
  children.push(createSectionTitle('2. Student Attendance & Performance'));
  const attHeaders = ['Class Name', 'Total Students', 'Avg Attendance %', 'Below 75% Count', 'Class Average Mark', 'Performance Analysis'];
  const attRows = student_attendance.map(a => [
    a.class_name,
    a.total_students,
    `${a.avg_attendance_pct}%`,
    a.students_below_75,
    a.class_average_mark,
    a.performance_analysis
  ]);
  children.push(createStyledTable(attHeaders, attRows));

  // 3. Assignment & Assessment
  children.push(createSectionTitle('3. Assignment & Assessment'));
  const assHeaders = ['Assessment Name', 'Date Given', 'Submissions', 'Evaluation Comp.', 'CO-wise Performance', 'Corrective Action'];
  const assRows = assessments.map(a => [
    a.assessment_name,
    a.given_date,
    a.submission_count,
    a.evaluation_completed ? 'Yes' : 'No',
    a.co_wise_performance,
    a.corrective_action
  ]);
  children.push(createStyledTable(assHeaders, assRows));

  // 4. Remedial Activities
  children.push(createSectionTitle('4. Remedial Activities'));
  const remHeaders = ['Class Name', 'Date Conducted', 'Attended Count', 'Topics Covered', 'Slow Learner Support', 'Improvement Remarks'];
  const remRows = remedial_activities.map(r => [
    r.class_name,
    r.date_conducted,
    r.students_attended,
    r.topics_covered,
    r.slow_learner_support,
    r.improvement_remarks
  ]);
  children.push(createStyledTable(remHeaders, remRows));

  // 5. Student Mentoring
  children.push(createSectionTitle('5. Student Mentoring'));
  const mentHeaders = ['Mentored Count', 'Meeting Date', 'Academic Issues Discussed', 'Attendance Issues', 'Career Guidance', 'Mentoring Outcome'];
  const mentRows = mentoring.map(m => [
    m.mentored_count,
    m.meeting_date,
    m.academic_issues,
    m.attendance_issues,
    m.career_guidance,
    m.mentoring_outcome
  ]);
  children.push(createStyledTable(mentHeaders, mentRows));

  // 6. Project Guidance
  children.push(createSectionTitle('6. Project Guidance'));
  const projHeaders = ['Project Title', 'Students Guided', 'Review Details', 'Progress %', 'Technical Guidance', 'Completion Status'];
  const projRows = project_guidance.map(p => [
    p.project_title,
    p.students_guided,
    `Review #${p.review_number || 1} (${p.review_conducted || 'Done'})`,
    `${p.progress_pct || 0}%`,
    p.technical_guidance,
    p.completion_status
  ]);
  children.push(createStyledTable(projHeaders, projRows));

  // 7. Department Activities
  children.push(createSectionTitle('7. Department Activities'));
  const deptHeaders = ['Meetings (Attended/Conducted)', 'Academic Planning', 'NBA/NAAC Accreditation', 'Lab Maintenance', 'Workload & Timetable', 'Documentation'];
  const deptRows = department_activities.map(d => [
    `${d.meetings_attended || 0} / ${d.meetings_conducted || 0}`,
    d.academic_planning,
    d.accreditation_work,
    d.lab_maintenance,
    `${d.timetable_prep || ''} ${d.workload_prep || ''}`.trim() || 'N/A',
    d.documentation
  ]);
  children.push(createStyledTable(deptHeaders, deptRows));

  // 8. Events & Co-Curricular Activities
  children.push(createSectionTitle('8. Events & Co-Curricular Activities'));
  const eventHeaders = ['Event Name', 'Date', 'Type', 'Role', 'Students Participated', 'Outcome / Description'];
  const eventRows = events.map(e => [
    e.event_name,
    e.event_date,
    e.event_type,
    e.role,
    e.students_participated,
    `${e.outcome || ''} - ${e.description || ''}`
  ]);
  children.push(createStyledTable(eventHeaders, eventRows));

  // 9. FDP, Workshops & Trainings
  children.push(createSectionTitle('9. FDP, Workshops & Trainings'));
  const fdpHeaders = ['Program Type', 'Program Title', 'Organizing Institution', 'Duration / Mode', 'Role', 'Skill Gained & Application'];
  const fdpRows = fdp_training.map(f => [
    f.program_type,
    f.program_title,
    f.organizing_institution,
    `${f.duration || ''} (${f.mode || 'Offline'})`,
    f.role,
    `Gained: ${f.skills_gained || 'N/A'}. Applied: ${f.application_in_teaching || 'N/A'}`
  ]);
  children.push(createStyledTable(fdpHeaders, fdpRows));

  // 10. Research Activities
  children.push(createSectionTitle('10. Research Activities'));
  const resHeaders = ['Journal / Conf Paper', 'Research Work Description', 'Status', 'Patent / Book Info', 'Scopus / WoS', 'Citations'];
  const resRows = research_activities.map(r => [
    `${r.journal_paper || ''} ${r.conference_paper || ''}`.trim() || 'N/A',
    r.work_done,
    r.publication_status,
    `${r.patent || ''} ${r.book || ''} ${r.book_chapter || ''}`.trim() || 'None',
    r.scopus_wos ? 'Yes' : 'No',
    r.citation_count
  ]);
  children.push(createStyledTable(resHeaders, resRows));

  // 11. Achievements
  children.push(createSectionTitle('11. Achievements & Recognitions'));
  const achHeaders = ['Achievement Title', 'Type', 'Category', 'Date', 'Level', 'Description / Recognition'];
  const achRows = achievements.map(a => [
    a.achievement_title,
    a.achievement_type,
    a.category,
    a.date_received,
    a.level,
    `${a.description || ''} (${a.recognition || ''})`
  ]);
  children.push(createStyledTable(achHeaders, achRows));

  // 12. Administrative Activities
  children.push(createSectionTitle('12. Administrative Activities'));
  const adminHeaders = ['Exam / Invigilation Duties', 'Admission / Scholarship', 'Data / Atten. Verification', 'Committee Responsibilities', 'Other Admin Tasks'];
  const adminRows = administrative_activities.map(a => [
    `Exam: ${a.exam_duty || 'N/A'}. Invigilation: ${a.invigilation_duty || 'N/A'}. Valuation: ${a.valuation_duty || 'N/A'}`,
    `Admission: ${a.admission_work || 'N/A'}. Scholarship: ${a.scholarship_verification || 'N/A'}`,
    `Data: ${a.student_data_verification || 'N/A'}. Attendance: ${a.attendance_verification || 'N/A'}`,
    a.committee_responsibility || 'None',
    a.other_duties || 'None'
  ]);
  children.push(createStyledTable(adminHeaders, adminRows));

  // 13. Lab / Infrastructure Activities
  children.push(createSectionTitle('13. Laboratory & Infrastructure Activities'));
  const labHeaders = ['Laboratory Handled', 'Classes Conducted', 'Software Installed', 'Maintenance Done', 'Requirements / Suggestions'];
  const labRows = lab_activities.map(l => [
    l.laboratory_handled,
    l.classes_conducted,
    l.software_installation,
    `Equipment Check: ${l.equipment_checked || 'N/A'}. Maintenance: ${l.maintenance_work || 'N/A'}`,
    `Reqs: ${l.new_equipment_req || 'N/A'}. Suggestion: ${l.suggestions || 'N/A'}`
  ]);
  children.push(createStyledTable(labHeaders, labRows));

  // 14. Meetings
  children.push(createSectionTitle('14. Meetings Attended / Conducted'));
  const meetHeaders = ['Meeting Title', 'Date / Type', 'Agenda', 'Decisions Taken', 'Action Items & Completed'];
  const meetRows = meetings.map(m => [
    m.title,
    `${m.meeting_date || ''} (${m.meeting_type || ''})`,
    m.agenda,
    m.decisions_taken,
    `Actions: ${m.action_items || ''}. Completed: ${m.action_completed || ''}`
  ]);
  children.push(createStyledTable(meetHeaders, meetRows));

  // 15. Issues & Challenges
  children.push(createSectionTitle('15. Issues & Challenges'));
  const issueHeaders = ['Academic / Student Issues', 'Attendance / Technical Issues', 'Infrastructure / Lab Issues', 'Other Challenges', 'Support Required'];
  const issueRows = issues.map(i => [
    `Academic: ${i.academic_issues || 'None'}. Student: ${i.student_issues || 'None'}`,
    `Attendance: ${i.attendance_issues || 'None'}. Technical: ${i.technical_issues || 'None'}`,
    `Infra: ${i.infrastructure_issues || 'None'}. Lab: ${i.laboratory_issues || 'None'}`,
    i.other_challenges || 'None',
    `Action Taken: ${i.action_taken || 'N/A'}. Support: ${i.support_required || 'N/A'}`
  ]);
  children.push(createStyledTable(issueHeaders, issueRows));

  // 16. Future Plans
  children.push(createSectionTitle('16. Future Period Plan'));
  const planHeaders = ['Planned Classes / Syllabus %', 'Assignments / Internal Exams', 'Remedial / Mentoring Plans', 'Planned Events / FDPs / Research', 'Targets to Achieve'];
  const planRows = future_plans.map(p => [
    `Classes: ${p.planned_classes || 0}. Syllabus Target: ${p.target_syllabus_pct || 0}%`,
    `Assignments: ${p.assignments_planned || 'None'}. Internals: ${p.internal_assessments || 'None'}`,
    `Remedial: ${p.remedial_classes || 'None'}. Mentoring: ${p.mentoring_planned || 'None'}`,
    `Events: ${p.events_planned || 'None'}. FDP: ${p.fdp_workshops || 'None'}. Research: ${p.research_work || 'None'}`,
    p.target_to_achieve
  ]);
  children.push(createStyledTable(planHeaders, planRows));

  // 17. Additional Remarks
  children.push(createSectionTitle('17. Additional Remarks & Overall Summary'));
  const remarksHeaders = ['Overall Performance Summary', 'Major Contributions', 'Important Updates', 'Suggestions & Recommendations'];
  const remarksRows = additional_remarks.map(r => [
    r.overall_summary,
    r.major_contributions,
    r.important_updates,
    `Suggestions: ${r.suggestions || 'None'}. Recs: ${r.recommendations || 'None'}`
  ]);
  children.push(createStyledTable(remarksHeaders, remarksRows));

  // 18. Supporting Documents
  children.push(createSectionTitle('18. Supporting Documents Link List'));
  const docHeaders = ['Document Name', 'Upload Date', 'File URL Link'];
  const docRows = (report.documents || []).map(d => [
    d.file_name,
    d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : '—',
    d.file_path
  ]);
  children.push(createStyledTable(docHeaders, docRows));

  // 19. HOD Review & Approval Status Signatures
  children.push(createSectionTitle('19. Review & Approval Signatures'));
  const auditHeaders = ['Action Time', 'Action Done', 'Reviewed By', 'Reviewer Comments'];
  const auditRows = (report.audit_logs || []).map(a => [
    a.created_at ? new Date(a.created_at).toLocaleString() : '—',
    a.action,
    a.actor_name,
    a.review_comments || 'N/A'
  ]);
  children.push(createStyledTable(auditHeaders, auditRows));

  // Signatures
  children.push(new Paragraph({ spacing: { before: 400 } }));
  children.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: '________________________', bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: 'Faculty Signature', bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: `Name: ${report.staff_name || ''}` })] }),
                new Paragraph({ children: [new TextRun({ text: `Date: ${new Date(report.submitted_at || Date.now()).toLocaleDateString()}` })] })
              ],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
            }),
            new TableCell({
              children: [
                new Paragraph({ children: [new TextRun({ text: '________________________', bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: 'HOD Signature / Approval', bold: true })] }),
                new Paragraph({ children: [new TextRun({ text: `Name: ${report.hod_name || 'Department HOD'}` })] }),
                new Paragraph({ children: [new TextRun({ text: `Date: ${report.approved_at ? new Date(report.approved_at).toLocaleDateString() : 'Pending'}` })] })
              ],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
            })
          ]
        })
      ],
      width: { size: 100, type: WidthType.PERCENTAGE }
    })
  );

  const headerChildren = [];
  if (headerLogoBuffer) {
    headerChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: headerLogoBuffer,
            transformation: { width: 520, height: 48 },
            floating: false
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      })
    );
  } else {
    headerChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Mount Zion College of Engineering & Technology - Faculty Report', color: '1E3A8A', bold: true, size: 16 })
        ],
        alignment: AlignmentType.RIGHT
      })
    );
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
      headers: { default: new Header({ children: headerChildren }) },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: 'Page ' }),
                new TextRun({ children: [PageNumber.CURRENT] }),
                new TextRun({ text: ' | MZCET FacultyReport | Staff: ' }),
                new TextRun({ text: `${report.staff_name || ''} (${report.department_name || ''})` })
              ],
              alignment: AlignmentType.CENTER
            })
          ]
        })
      },
      children
    }]
  });

  return await Packer.toBuffer(doc);
}

// Generate Department Monthly Summary Word Document (Matching PDF & Excel Table Format)
export async function generateDepartmentSummaryDocx(summary, departmentName) {
  const headerLogoBuffer = getHeaderLogoBuffer();
  const children = [];

  const deptToDisplay = summary?.department_name || departmentName || 'Information Technology';
  const startDate = summary?.start_date || '2026-07-06';
  const endDate = summary?.end_date || '2026-08-07';
  const academicYear = summary?.academic_year || '2026-2027';
  const semester = summary?.semester || 'ODD';

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `MONTHLY REPORT – ACADEMIC YEAR ${academicYear.replace('-', ' – ')} (${semester.toUpperCase()} SEMESTER)`, bold: true, color: '1E3A8A', size: 22 })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 100 }
    })
  );

  const metaTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Name of Department:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: deptToDisplay, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Reporting Period:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${startDate} to ${endDate}`, size: 18 })] })] })
        ]
      })
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      left: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
      right: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' }
    }
  });
  children.push(metaTable);
  children.push(new Paragraph({ spacing: { after: 140 } }));

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
  // Section A. Syllabus Completion (Theory and Laboratory)
  // ---------------------------------------------------------
  children.push(createSectionTitle('A. Details of Syllabus completion (Theory and Lab)'));

  children.push(createSubSectionTitle('Syllabus Completion — Theory Courses'));
  const theoryItems = teachingList.filter(t => (t.course_type || '').toLowerCase() !== 'laboratory');
  const theoryHeaders = ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Unit Taken (TLP No./Total TLP)'];
  const theoryRows = theoryItems.map(t => [
    `${t.subject_name || 'Subject'}${t.instructor_name ? ' / ' + t.instructor_name : ''}`,
    t.teaching_hours ? `${t.teaching_hours} Hours` : `${t.classes_taken || 0} Hours`,
    t.current_unit || `Unit Completion: ${t.syllabus_pct || 0}%`
  ]);
  children.push(createStyledTable(theoryHeaders, theoryRows));

  children.push(createSubSectionTitle('Syllabus Completion — Laboratory Courses'));
  const labItems = teachingList.filter(t => (t.course_type || '').toLowerCase() === 'laboratory');
  const labHeaders = ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Exp. Completed / Hours taken', 'Remaining Exp. / Hours required'];
  const labRows = labItems.map(l => [
    `${l.subject_name || 'Lab Course'}${l.instructor_name ? ' / ' + l.instructor_name : ''}`,
    l.teaching_hours ? `${l.teaching_hours} Hours` : `${l.classes_taken || 0} Hours`,
    l.exp_completed || 'Completed',
    l.exp_remaining || 'Remaining'
  ]);
  children.push(createStyledTable(labHeaders, labRows));

  // ---------------------------------------------------------
  // Section B. Details of events organised
  // ---------------------------------------------------------
  children.push(createSectionTitle('B. Details of events organised (IV/Conference/Workshop/Seminar/Symposium/Other)'));
  const eventsHeaders = ['S.No', 'Date of Event', 'Name of Event', 'Year / Students', 'Internal Coordinator', 'Resource Person Details'];
  const eventRows = eventsList.map((e, idx) => [
    String(idx + 1),
    e.event_date || '—',
    e.event_name || '—',
    e.students_participated || '—',
    e.role || deptToDisplay || '—',
    e.description || '—'
  ]);
  children.push(createStyledTable(eventsHeaders, eventRows));

  // ---------------------------------------------------------
  // Section C. Details of Faculty Participation
  // ---------------------------------------------------------
  children.push(createSectionTitle('C. Details of Faculty Participation — Workshop / Seminar / FDP'));
  const fdpHeaders = ['S.No', 'Name of Faculty', 'Date of Event', 'Name of Event', 'Details of Event (Venue)'];
  const fdpRows = fdpList.map((f, idx) => [
    String(idx + 1),
    f.role || 'Faculty Member',
    f.start_date || '—',
    f.program_title || '—',
    `${f.organizing_institution || ''} (${f.mode || 'Offline'})`
  ]);
  children.push(createStyledTable(fdpHeaders, fdpRows));

  children.push(createSectionTitle('C. Details of Faculty Participation — NPTEL Course'));
  const fNptelHeaders = ['S.No', 'Name of Faculty', 'Date (From – To)', 'Name of Course', 'Status / Result'];
  const fNptelRows = facultyNptelList.map((fn, idx) => [
    String(idx + 1),
    fn.recognition || 'Faculty Member',
    fn.description || '—',
    fn.achievement_title || '—',
    fn.level || 'Registered'
  ]);
  children.push(createStyledTable(fNptelHeaders, fNptelRows));

  // ---------------------------------------------------------
  // Section D. Details of Student Participation & NPTEL
  // ---------------------------------------------------------
  children.push(createSectionTitle('D. Details of Student Participation & NPTEL'));
  const sNptelHeaders = ['S.No', 'Name of Mentor', 'Name of Student', 'Category', 'Name of Course / Event', 'Status / Prize'];
  const sPartRows = studentPartList.map((sp, idx) => [
    String(idx + 1),
    sp.recognition || 'Mentor',
    sp.description || 'Student',
    sp.achievement_type === 'Student Event' ? 'Event' : 'NPTEL',
    sp.achievement_title || '—',
    sp.level || 'Registered'
  ]);
  children.push(createStyledTable(sNptelHeaders, sPartRows));

  // ---------------------------------------------------------
  // Section G. Details of Research Activity
  // ---------------------------------------------------------
  children.push(createSectionTitle('G. Details of Research Activity (Publication, Conference, Research proposal)'));
  const researchHeaders = ['Category', 'Name of Faculty', 'Title & Venue Details', 'Status'];
  const researchRows = researchList.map(r => [
    r.work_done || 'Research',
    r.progress_remarks || 'IT Faculty Team',
    r.journal_paper || r.conference_paper || r.research_proposal || r.work_done || 'Details',
    r.publication_status || 'In Progress'
  ]);
  children.push(createStyledTable(researchHeaders, researchRows));

  // ---------------------------------------------------------
  // Section H. Work Plan
  // ---------------------------------------------------------
  children.push(createSectionTitle('H. Work Plan (Next Month Department Targets)'));
  const kpiHeaders = ['S.No', 'Particulars', 'Requirement Target', 'Conducted', 'To be Conducted'];
  const workPlanRows = workPlanList.map((wp, idx) => [
    String(wp.sno || (idx + 1)),
    wp.particulars || wp.target_to_achieve || '—',
    wp.requirement || '—',
    wp.conducted || '0',
    wp.to_be_conducted || 'Planned'
  ]);
  children.push(createStyledTable(kpiHeaders, workPlanRows));

  // Signature Line
  children.push(new Paragraph({ spacing: { before: 360 } }));
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Signature of HoD : ___________________________', bold: true, size: 18 })
      ],
      alignment: AlignmentType.RIGHT
    })
  );

  const headerChildren = [];
  if (headerLogoBuffer) {
    headerChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: headerLogoBuffer,
            transformation: { width: 520, height: 48 },
            floating: false
          })
        ],
        alignment: AlignmentType.CENTER
      })
    );
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
      headers: { default: new Header({ children: headerChildren }) },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: `Mount Zion College of Engineering and Technology • ${deptToDisplay} Department Monthly Report • Page ` }),
                new TextRun({ children: [PageNumber.CURRENT] })
              ],
              alignment: AlignmentType.CENTER
            })
          ]
        })
      },
      children
    }]
  });

  return await Packer.toBuffer(doc);
}

export async function generateCollegeSummaryDocx(summary) {
  return await generateDepartmentSummaryDocx(summary, 'Mount Zion Institutional Overall');
}

