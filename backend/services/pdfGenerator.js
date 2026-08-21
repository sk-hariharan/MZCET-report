import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Helper: Try to locate top header logo image path
function getHeaderLogoPath() {
  const logoPaths = [
    'c:\\Users\\HARIHARAN S\\OneDrive\\Desktop\\Report-Automation\\frontend\\public\\pdf word top logo.png',
    path.resolve('frontend/public/pdf word top logo.png'),
    path.resolve('../frontend/public/pdf word top logo.png'),
    path.resolve('public/pdf word top logo.png'),
    path.resolve('pdf word top logo.png')
  ];

  for (const p of logoPaths) {
    if (fs.existsSync(p)) {
      return p;
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

// PDF Generator function for Department Monthly Reports
export function generateHodMonthlyReportPdf(summary, departmentName = 'Information Technology') {
  return new Promise((resolve, reject) => {
    try {
      const headerLogoPath = getHeaderLogoPath();
      const primaryColor = '#1E3A8A'; // MZCET Navy Blue
      const borderColor = '#CBD5E1';

      const doc = new PDFDocument({
        margin: 36,
        size: 'A4',
        bufferPages: true
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const totalWidth = doc.page.width - 72; // 523.28 pt

      // Draw top header banner image on every page
      const drawTopHeader = () => {
        if (headerLogoPath) {
          doc.image(headerLogoPath, 36, 12, { width: totalWidth, height: 58 });
        } else {
          doc
            .font('Helvetica-Bold')
            .fontSize(11)
            .fillColor(primaryColor)
            .text('MOUNT ZION COLLEGE OF ENGINEERING AND TECHNOLOGY', 36, 18, { align: 'center' });
        }
      };

      drawTopHeader();
      doc.on('pageAdded', () => drawTopHeader());

      let yPos = 78;

      // Document Title
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(primaryColor)
        .text('MONTHLY REPORT – ACADEMIC YEAR 2026 – 27 (ODD SEMESTER)', 36, yPos, { align: 'center' });

      yPos += 20;

      // Metadata card
      const startX = 36;
      doc.rect(startX, yPos, totalWidth, 22).fillAndStroke('#F8FAFC', borderColor);
      doc.fillColor('#1E293B').fontSize(8.5).font('Helvetica-Bold');

      const deptToDisplay = summary?.department_name || departmentName;
      doc.text('Name of Department:', startX + 10, yPos + 6);
      doc.font('Helvetica').text(deptToDisplay, startX + 115, yPos + 6);

      doc.font('Helvetica-Bold').text('Reporting Period:', startX + 280, yPos + 6);
      doc.font('Helvetica').text(`${summary?.start_date || '06.07.2026'} to ${summary?.end_date || '07.08.2026'}`, startX + 375, yPos + 6);

      doc.y = yPos + 30;

      // Dynamic Table Drawer with exact column ratios and dynamic row height
      const drawTable = (title, headers, rows, colPcts) => {
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
          doc.y = 78;
        }

        doc.font('Helvetica-Bold').fontSize(9.5).fillColor(primaryColor).text(title, 36, doc.y);
        doc.y += 12;

        const tableX = 36;
        let curY = doc.y;

        const colWidths = colPcts
          ? colPcts.map(p => p * totalWidth)
          : headers.map(() => totalWidth / headers.length);

        // Header Row Height
        doc.font('Helvetica-Bold').fontSize(8);
        let headerH = 18;
        headers.forEach((h, i) => {
          const textH = doc.heightOfString(h, { width: colWidths[i] - 6, align: 'center' });
          if (textH + 8 > headerH) headerH = textH + 8;
        });

        doc.rect(tableX, curY, totalWidth, headerH).fill(primaryColor);
        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);

        let hX = tableX;
        headers.forEach((h, i) => {
          doc.text(h, hX + 3, curY + (headerH - doc.heightOfString(h, { width: colWidths[i] - 6, align: 'center' })) / 2, {
            width: colWidths[i] - 6,
            align: 'center'
          });
          hX += colWidths[i];
        });

        curY += headerH;

        if (!rows || rows.length === 0) {
          doc.rect(tableX, curY, totalWidth, 18).fillAndStroke('#FFFFFF', borderColor);
          doc.fillColor('#64748B').font('Helvetica-Oblique').fontSize(8);
          doc.text('No records submitted for this section.', tableX + 6, curY + 5, { align: 'center' });
          curY += 18;
        } else {
          rows.forEach((row, rIdx) => {
            doc.font('Helvetica').fontSize(8);
            let maxRowH = 18;
            row.forEach((cellText, cIdx) => {
              const txt = String(cellText !== undefined && cellText !== null ? cellText : '—');
              const textH = doc.heightOfString(txt, { width: colWidths[cIdx] - 6, align: 'center' });
              if (textH + 8 > maxRowH) maxRowH = textH + 8;
            });

            if (curY + maxRowH > doc.page.height - 40) {
              doc.addPage();
              curY = 78;
            }

            const rowBg = rIdx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
            doc.rect(tableX, curY, totalWidth, maxRowH).fillAndStroke(rowBg, borderColor);
            doc.fillColor('#1E293B').font('Helvetica').fontSize(8);

            let rX = tableX;
            row.forEach((cellText, cIdx) => {
              const txt = String(cellText !== undefined && cellText !== null ? cellText : '—');
              const textH = doc.heightOfString(txt, { width: colWidths[cIdx] - 6, align: 'center' });
              const textY = curY + (maxRowH - textH) / 2;
              doc.text(txt, rX + 3, textY, {
                width: colWidths[cIdx] - 6,
                align: 'center'
              });
              rX += colWidths[cIdx];
            });

            curY += maxRowH;
          });
        }

        doc.y = curY + 12;
      };

      // Extract isolated section arrays
      const teachingList = removeDuplicates(summary?.teaching_activities || [], ['subject_name', 'class_assigned']);
      const eventsList = removeDuplicates(summary?.events || [], ['event_date', 'event_name']);
      const fdpList = removeDuplicates(summary?.fdp_training || [], ['start_date', 'program_title']);
      
      const achievements = summary?.achievements || [];
      const facultyNptelList = removeDuplicates(achievements.filter(a => a.category === 'Faculty NPTEL' || a.achievement_type === 'NPTEL Course'), ['achievement_title', 'description']);
      const studentPartList = removeDuplicates(achievements.filter(a => a.category === 'Student NPTEL' || a.category === 'Student Event' || a.achievement_type === 'Student NPTEL' || a.achievement_type === 'Student Event'), ['achievement_title', 'description']);
      
      const researchList = removeDuplicates(summary?.research_activities || [], ['journal_paper', 'conference_paper', 'research_proposal', 'work_done']);
      const workPlanList = removeDuplicates(summary?.future_plans || [], ['particulars', 'sno']);

      // ---------------------------------------------------------
      // A. Syllabus Completion (Theory and Laboratory)
      // ---------------------------------------------------------
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(primaryColor).text('A. Details of Syllabus completion (Theory and Lab)', 36, doc.y);
      doc.y += 14;

      const theoryRatios = [0.45, 0.20, 0.35];
      const labRatios = [0.42, 0.18, 0.20, 0.20];

      const theoryItems = teachingList.filter(t => (t.course_type || '').toLowerCase() !== 'laboratory');
      const labItems = teachingList.filter(t => (t.course_type || '').toLowerCase() === 'laboratory');

      const theoryRows = theoryItems.map(t => [
        `${t.subject_name || 'Subject'}${t.instructor_name ? ' / ' + t.instructor_name : ''}`,
        t.teaching_hours ? `${t.teaching_hours} Hours` : `${t.classes_taken || 0} Hours`,
        t.current_unit || `Unit Completion: ${t.syllabus_pct || 0}%`
      ]);

      drawTable(
        'Syllabus Completion — Theory Courses',
        ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Unit Taken (TLP No./Total TLP)'],
        theoryRows,
        theoryRatios
      );

      const labRows = labItems.map(l => [
        `${l.subject_name || 'Lab Course'}${l.instructor_name ? ' / ' + l.instructor_name : ''}`,
        l.teaching_hours ? `${l.teaching_hours} Hours` : `${l.classes_taken || 0} Hours`,
        l.exp_completed || 'Completed',
        l.exp_remaining || 'Remaining'
      ]);

      drawTable(
        'Syllabus Completion — Laboratory Courses',
        ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Exp. Completed / Hours taken', 'Remaining Exp. / Hours required'],
        labRows,
        labRatios
      );

      // ---------------------------------------------------------
      // B. Events Organised
      // ---------------------------------------------------------
      const eventsRatios = [0.06, 0.14, 0.30, 0.16, 0.16, 0.18];
      const eventRows = eventsList.map((e, idx) => [
        String(idx + 1),
        e.event_date || '—',
        e.event_name || '—',
        e.students_participated || '—',
        e.role || summary?.staff_name || '—',
        e.description || '—'
      ]);

      drawTable(
        'B. Details of events organised (IV/Conference/Workshop/Seminar/Symposium/Other)',
        ['S.No', 'Date of Event', 'Name of Event', 'Year / Students', 'Internal Coordinator', 'Resource Person Details'],
        eventRows,
        eventsRatios
      );

      // ---------------------------------------------------------
      // C. Faculty Participation — FDP / Workshop
      // ---------------------------------------------------------
      const fdpRatios = [0.06, 0.22, 0.18, 0.28, 0.26];
      const fdpRows = fdpList.map((f, idx) => [
        String(idx + 1),
        f.role || summary?.staff_name || 'Faculty Member',
        f.start_date || '—',
        f.program_title || '—',
        `${f.organizing_institution || ''} (${f.mode || 'Offline'})`
      ]);

      drawTable(
        'C. Details of Faculty Participation — Workshop / Seminar / FDP',
        ['S.No', 'Name of Faculty', 'Date of Event', 'Name of Event', 'Details of Event (Venue)'],
        fdpRows,
        fdpRatios
      );

      // ---------------------------------------------------------
      // C. Faculty Participation — NPTEL Course
      // ---------------------------------------------------------
      const fNptelRatios = [0.06, 0.24, 0.20, 0.32, 0.18];
      const fNptelRows = facultyNptelList.map((fn, idx) => [
        String(idx + 1),
        fn.recognition || summary?.staff_name || 'Faculty Member',
        fn.description || '—',
        fn.achievement_title || '—',
        fn.level || 'Registered'
      ]);

      drawTable(
        'C. Details of Faculty Participation — NPTEL Course',
        ['S.No', 'Name of Faculty', 'Date (From – To)', 'Name of Course', 'Status / Result'],
        fNptelRows,
        fNptelRatios
      );

      // ---------------------------------------------------------
      // D. Student Participation & NPTEL
      // ---------------------------------------------------------
      const sNptelRatios = [0.06, 0.20, 0.20, 0.10, 0.26, 0.18];
      const sPartRows = studentPartList.map((sp, idx) => [
        String(idx + 1),
        sp.recognition || summary?.staff_name || 'Mentor',
        sp.description || 'Student',
        sp.achievement_type === 'Student Event' ? 'Event' : 'NPTEL',
        sp.achievement_title || '—',
        sp.level || 'Registered'
      ]);

      drawTable(
        'D. Details of Student Participation & NPTEL',
        ['S.No', 'Name of Mentor', 'Name of Student', 'Category', 'Name of Course / Event', 'Status / Prize'],
        sPartRows,
        sNptelRatios
      );

      // ---------------------------------------------------------
      // G. Research Activity
      // ---------------------------------------------------------
      const researchRows = researchList.map(r => [
        r.work_done || 'Research',
        r.progress_remarks || summary?.staff_name || 'IT Faculty Team',
        r.journal_paper || r.conference_paper || r.research_proposal || r.work_done || 'Details',
        r.publication_status || 'In Progress'
      ]);

      drawTable(
        'G. Details of Research Activity (Publication, Conference, Research proposal)',
        ['Category', 'Name of Faculty', 'Title & Venue Details', 'Status'],
        researchRows,
        [0.20, 0.22, 0.40, 0.18]
      );

      // ---------------------------------------------------------
      // H. Work Plan (Next Month)
      // ---------------------------------------------------------
      const kpiRatios = [0.06, 0.34, 0.28, 0.16, 0.16];
      const workPlanRows = workPlanList.map((wp, idx) => [
        String(wp.sno || (idx + 1)),
        wp.particulars || wp.target_to_achieve || '—',
        wp.requirement || '—',
        wp.conducted || '0',
        wp.to_be_conducted || 'Planned'
      ]);

      drawTable(
        'H. Work Plan (Next Month Department Targets)',
        ['S.No', 'Particulars', 'Requirement Target', 'Conducted', 'To be Conducted'],
        workPlanRows,
        kpiRatios
      );

      // Signature Block
      if (doc.y > doc.page.height - 80) {
        doc.addPage();
        doc.y = 78;
      }

      const sigY = doc.y + 25;
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(primaryColor);
      doc.text('Signature of HoD : ___________________________', doc.page.width - 260, sigY, { align: 'right' });

      // Page numbers on every page
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#64748B')
          .text(
            `Mount Zion College of Engineering and Technology • ${deptToDisplay} Department Monthly Report • Page ${i + 1} of ${pageCount}`,
            36,
            doc.page.height - 22,
            { align: 'center' }
          );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Export generic PDF generator function as alias
export const generatePdf = generateHodMonthlyReportPdf;
