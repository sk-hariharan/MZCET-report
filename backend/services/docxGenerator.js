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
  });
}

// Main DOCX Generator for individual faculty reports
export async function generateDocx(report) {
  const headerLogoBuffer = getHeaderLogoBuffer();
  const children = [];

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
  const teachingRows = (report.teaching_activities || []).map(t => [
    t.subject_name,
    t.class_assigned,
    `${t.classes_taken || 0} / ${t.classes_rescheduled || 0} / ${t.classes_cancelled || 0}`,
    t.teaching_hours,
    `${t.syllabus_pct || 0}%`,
    t.lesson_plan_status
  ]);
  children.push(createStyledTable(teachingHeaders, teachingRows));

  // 2. Student Attendance & Performance
  children.push(createSectionTitle('2. Student Attendance & Performance'));
  const attHeaders = ['Class Name', 'Total Students', 'Avg Attendance %', 'Below 75% Count', 'Class Average Mark', 'Performance Analysis'];
  const attRows = (report.student_attendance || []).map(a => [
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
  const assRows = (report.assessments || []).map(a => [
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
  const remRows = (report.remedial_activities || []).map(r => [
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
  const mentRows = (report.mentoring || []).map(m => [
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
  const projRows = (report.project_guidance || []).map(p => [
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
  const deptRows = (report.department_activities || []).map(d => [
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
  const eventRows = (report.events || []).map(e => [
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
  const fdpRows = (report.fdp_training || []).map(f => [
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
  const resRows = (report.research_activities || []).map(r => [
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
  const achRows = (report.achievements || []).map(a => [
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
  const adminRows = (report.administrative_activities || []).map(a => [
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
  const labRows = (report.lab_activities || []).map(l => [
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
  const meetRows = (report.meetings || []).map(m => [
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
  const issueRows = (report.issues || []).map(i => [
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
  const planRows = (report.future_plans || []).map(p => [
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
  const remarksRows = (report.additional_remarks || []).map(r => [
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

// Generate Department Monthly Summary Word Document (HOD Template A through H)
export async function generateDepartmentSummaryDocx(summary, departmentName) {
  const headerLogoBuffer = getHeaderLogoBuffer();
  const children = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'MONTHLY REPORT – ACADEMIC YEAR 2026 – 27 (ODD SEMESTER)', bold: true, color: '1E3A8A', size: 24 })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 60 }
    })
  );

  const metaTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Name of the Department:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: departmentName || 'Information Technology', size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Date Period:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${summary.start_date || '06.07.2026'} to ${summary.end_date || '07.08.2026'}`, size: 18 })] })] })
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

  // A. Details of Syllabus completion (Theory and Lab)
  children.push(createSectionTitle('A. Details of Syllabus completion (Theory and Lab)'));

  // II YEAR
  children.push(createSubSectionTitle('Class: II YEAR'));
  children.push(createSubSectionTitle('Theory Courses'));
  const iiTheoryHeaders = ['Sub. Code & Name of Course / Handled by', 'Total Hours Handled as on Aug 7, 2026', 'Unit Taken (TLP No./Total TLP)'];
  const iiTheoryRows = [
    ['MA25C02 - Discrete Mathematics / Dr. Sabeena', '25 Hours', 'Unit 1 & 2 Completed'],
    ['IT25301 - Data Structures and Algorithms in C / Mrs. V. Brindha Devi', '20 Hours', 'Unit 1, Unit 2 & 3.4/3.12 Completed'],
    ['IT25302 - Computer Organization & Architecture / Mrs. R Saraswathi', '20 Hours', 'Unit 1 & Unit 2 Completed'],
    ['CS25303 - Operating Systems (T+L) / Mrs. R. Sangeetha', '20 Hours (Theory)\n8 Hours (Lab)', 'Theory: Unit 1, 2 & 3.1/3.9 Completed\nLab: Ex-4/8 Completed'],
    ['CS25305 - Object Oriented Software Engineering / Mrs A Arifa Banu', '20 Hours', 'Unit 1 & 2 Completed'],
    ['CS25302 - Java Programming / Mrs. Shalini L', '20 Hours', 'Unit 1 & 2 Completed']
  ];
  children.push(createStyledTable(iiTheoryHeaders, iiTheoryRows));

  children.push(createSubSectionTitle('Laboratory Courses'));
  const iiLabHeaders = ['Sub. Code & Name of Course / Handled by', 'Total Hours Handled as on Aug 7, 2026', 'Exp. Completed / Hours taken', 'Remaining Exp. / Hours required'];
  const iiLabRows = [
    ['IT25303 - Data Structures & Algorithms in C Lab / Mrs. V. Brindha Devi', '20 Hours', 'EX: 6/15', 'Ex: 8/15'],
    ['CS25307 - Java Programming Laboratory / Mrs. L Shalini', '20 Hours', 'Ex: 5/10', 'Ex: 5/10']
  ];
  children.push(createStyledTable(iiLabHeaders, iiLabRows));

  // III YEAR
  children.push(createSubSectionTitle('Class: III YEAR'));
  children.push(createSubSectionTitle('Theory Courses'));
  const iiiTheoryHeaders = ['Sub. Code & Name of Course / Handled by', 'Total Hours Handled as on Aug 7, 2026', 'Unit Taken (TLP No./Total TLP)'];
  const iiiTheoryRows = [
    ['CS3591 - Computer Networks (T+L) / Mrs. L Shalini', '15 Hours (Theory)\n10 Hours (Lab)', 'Theory: Unit 1, 2 Completed\nLab: Ex-5/10 Completed'],
    ['IT3501 - Full Stack Web Development / Mrs. R Saraswathi', '20 Hours', 'Unit 1 & Unit 2 Completed'],
    ['CS3551 - Distributed Computing / Mrs A Arifa Banu', '15 Hours', 'Unit 1 & Unit 2 Completed'],
    ['CS3691 - Embedded Systems and IoT (T+L) / Dr. P. Rajkumar', '15 Hours (Theory)\n10 Hours (Lab)', 'Theory: Unit 1 & Unit 2 Completed\nLab: Ex-6/11 Completed'],
    ['CCS335 - Cloud Computing (T+L) / Mrs. R. Sangeetha', '22 Hours (Theory)\n8 Hours (Lab)', 'Theory: Unit 1, 2 & 3.3/3.11 Completed\nLab: Ex-4/10 Completed'],
    ['CCS361 - Robotic Process Automation (T+L) / Mrs. V. Brindha Devi', '18 Hours (Theory)\n10 Hours (Lab)', 'Theory: Unit 1, Unit 2 & 3.1/3.7 Completed\nLab: Ex-4/13 Completed'],
    ['MX3084 - Disaster Risk Reduction and Management / Dr. A. Nivedha', '15 Hours', 'Unit 1 & Unit 2 Completed']
  ];
  children.push(createStyledTable(iiiTheoryHeaders, iiiTheoryRows));

  children.push(createSubSectionTitle('Laboratory Courses'));
  const iiiLabHeaders = ['Sub. Code & Name of Course / Handled by', 'Total Hours Handled as on Aug 7, 2026', 'Exp. Completed / Hours taken', 'Remaining Exp. / Hours required'];
  const iiiLabRows = [
    ['IT3511 - Full Stack Web Development Lab / Mrs. R Saraswathi', '20 Hours', 'EX: 6/8', '2/8 & 1 Project']
  ];
  children.push(createStyledTable(iiiLabHeaders, iiiLabRows));

  // IV YEAR
  children.push(createSubSectionTitle('Class: IV YEAR'));
  children.push(createSubSectionTitle('Theory Courses'));
  const ivTheoryHeaders = ['Sub. Code & Name of Course / Handled by', 'Total Hours Handled as on Aug 7, 2026', 'Unit Taken (TLP No./Total TLP)'];
  const ivTheoryRows = [
    ['GE3791 - Human Values and Ethics / Mrs. S. Ammu', '28 Hours', 'Unit 1, 2, 3 & Unit 4.1/4.5 Completed'],
    ['GE3751 - Principles of Management / Mr. K. Muthuraman', '20 Hours', 'Unit 1, 2 & 3.8/3.10 Completed'],
    ['AI3021 - OE 2 IT in Agriculture System / Ms. S. Nivetha', '25 Hours', 'Unit 1, 2 & 3.6/3.8 Completed'],
    ['OME354 - OE 3 Applied Design Thinking / Mrs A Arifa Banu', '23 Hours', 'Unit 1, 2, 3 & Unit 4.3/4.6 Completed'],
    ['CRA332 - OE 4 Drone Technologies / Ms. Ramaprabha', '23 Hours', 'Unit 1, 2 & 3.6/3.8 Completed']
  ];
  children.push(createStyledTable(ivTheoryHeaders, ivTheoryRows));

  // B. Details of events organised
  children.push(createSectionTitle('B. Details of events organised (IV/Conference/Workshop/ Seminar/Symposium/Other Events)'));
  const eventsHeaders = ['S.No', 'Date of Event', 'Name of Event', 'Year / No. of Students Attended', 'Name of Internal Coordinator', 'Name & Detail of Resource Person'];
  const eventsRows = [
    ['1', '14.07.2026', 'WORKSHOP: Hands on networking', 'IV Year / 29 Students', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
    ['2', '16.07.2026', 'SEMINAR: Career Roadmap for Cyber Security & Ethical Hacking', '90 Students', 'Mrs A Arifa Banu', 'Mr. R Thamarai Selvam, Certified Ethical Hacker, UK'],
    ['3', '24.07.2026', 'WORKSHOP: IT Infrastructure Essentials', 'IV Year (29) & III Year (61)', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
    ['4', '28.07.2026', 'WORKSHOP: Infrastructure & Systems', 'II Year / 59 Students', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
    ['5', '05.08.2026 to 07.08.2026', 'WORKSHOP: Cloud Computing Technologies', '71 Students', 'Mrs. R Saraswathi', 'Dr. R V Nataraj, Director, Campus Reign Software']
  ];
  children.push(createStyledTable(eventsHeaders, eventsRows));

  // C. Details of Faculty Participation
  children.push(createSectionTitle('C. Details of Faculty Participation (NPTEL Course/Workshop/ Seminar/FDP)'));
  children.push(createSubSectionTitle('Workshop / Seminar / FDP'));
  const fdpHeaders = ['S.No', 'Name of Faculty', 'Date of Event', 'Name of Event', 'Details of Event (Venue)'];
  const fdpRows = [
    ['1', 'Mrs. V Brindha Devi', '15.06.2026 – 17.06.2026', 'New Age Teaching Techniques', 'ICT Academy - MZCET (Autonomous)'],
    ['', 'Mrs. V Brindha Devi', '22.06.2026 – 26.06.2026', 'AGENTIC AI SYSTEMS: From LLMs to Tiny LM', 'Kalasalingam Academy of Research and Education'],
    ['', 'Mrs. V Brindha Devi', '08.06.2026 – 12.06.2026', 'Agentic AI: MCP, A2A & Enterprise AI Agents', 'JB Institute of Engg - ExcelR'],
    ['2', 'Mrs. A Arifa Banu', '15.06.2026 – 17.06.2026', 'New Age Teaching Techniques', 'ICT Academy - MZCET (Autonomous)'],
    ['', 'Mrs. A Arifa Banu', '22.06.2026 – 26.06.2026', 'AGENTIC AI SYSTEMS: From LLMs to Tiny LM', 'Kalasalingam Academy of Research and Education'],
    ['3', 'Mrs R Sangeetha', '22.06.2026 – 26.06.2026', 'AGENTIC AI SYSTEMS: From LLMs to Tiny LM', 'Kalasalingam Academy of Research and Education'],
    ['', 'Mrs R Sangeetha', '29.06.2026 – 04.07.2026', 'AI Driven Cyber Security', 'New Prince Bhavani College of Engineering'],
    ['4', 'Mrs L Shalini', '22.06.2026 – 26.06.2026', 'AGENTIC AI SYSTEMS: From LLMs to Tiny LM', 'Kalasalingam Academy of Research and Education']
  ];
  children.push(createStyledTable(fdpHeaders, fdpRows));

  children.push(createSubSectionTitle('NPTEL Course (Faculty)'));
  const fNptelHeaders = ['S.No', 'Name of Faculty', 'Date (From – To)', 'Name of Course', 'Status / Result'];
  const fNptelRows = [
    ['1', 'Mrs. R Saraswathi', '20.07.2026 – 09.10.2026', 'Computer Architecture and Organization', 'Registered'],
    ['2', 'Mrs. V Brindha Devi', '20.07.2026 – 09.10.2026', 'Mind Body and Wellness', 'Registered']
  ];
  children.push(createStyledTable(fNptelHeaders, fNptelRows));

  // D. Details of Student Participation
  children.push(createSectionTitle('D. Details of Student Participation (NPTEL Course)'));
  const sNptelHeaders = ['S.No', 'Name of Mentor', 'Name of Student', 'Year', 'Name of Course', 'Status'];
  const sNptelRows = [
    ['1', 'Mrs A Arifa Banu', 'Aahela Parveen', 'IV', 'Data Analytics with Python', 'Elite'],
    ['2', 'Mrs V Brindha Devi', 'J Nandhini', 'III', 'Cloud Computing', 'Elite with Silver'],
    ['3', 'Mrs R Saraswathi', 'C Ramya', 'III', 'Cloud Computing', 'Elite'],
    ['4', 'Mrs V Brindha Devi', 'S Sudharsana Devi', 'III', 'Cloud Computing', 'Elite'],
    ['5', 'Dr Rajkumar', 'S Seran', 'III', 'Cloud Computing', 'Pass'],
    ['6', 'Dr Rajkumar', 'S Pragadeesh', 'III', 'Cloud Computing', 'Elite'],
    ['7', 'Mr K Muthu Raman', 'T Dinesh', 'II Year', 'Data Structures Using Python', 'Payment finished'],
    ['8', 'Mrs R Saraswathi', 'R Joyslin Robena', 'II Year', 'Data Structures Using Python', 'Payment finished'],
    ['9', 'Mrs V Brindha Devi', 'A Saniya Aasmin', 'II Year', 'Data Structures Using Python', 'Payment finished'],
    ['10', 'Mrs R Sangeetha', 'J Rahmath Fahmidha', 'II Year', 'Data Structures Using Python', 'Payment finished'],
    ['11', 'Mrs A Arifa Banu', 'M Deepika', 'II Year', 'Data Structures Using Python', 'Registered'],
    ['12', '(Pending)', 'M Subabharathi', 'II Year', 'Data Structures Using Python', 'Registered']
  ];
  children.push(createStyledTable(sNptelHeaders, sNptelRows));
  children.push(new Paragraph({ children: [new TextRun({ text: 'Note: Separate detailed tables attached for Internship.', italic: true, size: 16 })], spacing: { after: 100 } }));

  // E & F. Feedback and CCM
  children.push(createSectionTitle('E. Details of Academic Feedback - I'));
  children.push(new Paragraph({ children: [new TextRun({ text: 'Note: Separate detailed table attached for Academic Feedback - I.', italic: true, size: 16 })], spacing: { after: 100 } }));

  children.push(createSectionTitle('F. Details of Class Committee Meeting (CCM)'));
  children.push(new Paragraph({ children: [new TextRun({ text: 'Note: Separate detailed table attached for Class Committee Meeting (CCM).', italic: true, size: 16 })], spacing: { after: 100 } }));

  // G. Details of Research Activity
  children.push(createSectionTitle('G. Details of Research Activity (Publication, Conference, Research Proposal)'));
  const resHeaders = ['Category', 'Name of Faculty', 'Title & Venue Details', 'Status'];
  const resRows = [
    ['Journal', 'IT Faculty Team', 'Submitted / Published Papers', 'In Progress'],
    ['Conference', 'IT Faculty Team', 'National / International Conference Submissions', 'In Progress'],
    ['Research Proposal', 'IT Faculty Team', 'Funding Proposals to Agencies', 'In Progress']
  ];
  children.push(createStyledTable(resHeaders, resRows));

  // H. Work Plan (Next Month)
  children.push(createSectionTitle('H. Work Plan (Next Month)'));
  const kpiHeaders = ['S.No', 'Particulars', 'Requirement Target', 'Conducted during 2026-27 Odd', 'To be Conducted'];
  const kpiRows = [
    ['1', 'Certificate/VAC course', 'Min. 1 per Semester (UG & PG)', '0', '1 per class'],
    ['2', 'Participation in certificate course', 'Above 50%', 'Ongoing', 'Target 50%+'],
    ['3', 'Participation in internship', 'Above 50%', 'Ongoing', 'Target 50%+'],
    ['4', 'Participation in IPT', 'Above 65%', 'Ongoing', 'Target 65%+'],
    ['5', 'Industrial visit', 'Min. 1 per ACY (I & II Year)', '0', 'Planned'],
    ['6', 'Student centric activities', 'Min. 1 activity per month per subject', 'Conducted', '1 per subject'],
    ['7', '24 hours workshop', '3 per semester (UG), 1 per sem (PG)', '1 Conducted', '2 Planned'],
    ['8', 'Symposium/Conference', 'Min. 1 per ACY', '0', 'Planned'],
    ['9', 'Project expo', 'Min. 1 per ACY', '0', 'Planned'],
    ['10', 'Technical competitions', 'Min. 5 per semester', 'Conducted', '5 Planned'],
    ['11', 'Exam results (Internal & External)', '75% Dept, 85% Subject, 4 Rank Holders', 'On Track', 'Target 75%+'],
    ['12', 'Publication (Journal & Conference)', 'Min. 1 per Sem / Faculty', 'In Progress', '1 Journal, 1 Conf'],
    ['13', 'MoU with industry', 'Min. 2 New MoUs / 2 activities per MoU', 'Active', '2 Activities'],
    ['14', 'Placement', 'Above 80%', 'On Track', 'Target 80%+'],
    ['15', 'Staff participation (Workshop/FDP)', 'Min. 2 per ACY by each faculty (>5 days)', '2/2 (Completed)', 'Planned'],
    ['16', 'NPTEL courses', 'One per faculty / 3 students per mentor', 'Active (Faculty: 4)', 'Mentor assigned'],
    ['17', 'Students participation in events', '10 per class per semester', 'Active', '10 per class']
  ];
  children.push(createStyledTable(kpiHeaders, kpiRows));

  // Signature
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
                new TextRun({ text: `Mount Zion College of Engineering and Technology • ${departmentName} Department Monthly Report • Page ` }),
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

