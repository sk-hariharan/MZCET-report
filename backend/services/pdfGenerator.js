import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { normalizeReportData } from './reportNormalizer.js';

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

// PDF Generator function consuming single source of truth reportData
export function generateHodMonthlyReportPdf(summary, departmentName = 'Information Technology') {
  return new Promise((resolve, reject) => {
    try {
      // Normalize raw report using central normalizer
      const reportData = normalizeReportData(summary);
      const deptToDisplay = reportData.departmentName || departmentName;

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
        .text(`MONTHLY REPORT – ACADEMIC YEAR ${reportData.academicYear.replace('-', ' – ')} (${reportData.semester} SEMESTER)`, 36, yPos, { align: 'center' });

      yPos += 20;

      // Metadata card
      const startX = 36;
      doc.rect(startX, yPos, totalWidth, 22).fillAndStroke('#F8FAFC', borderColor);
      doc.fillColor('#1E293B').fontSize(8.5).font('Helvetica-Bold');

      doc.text('Name of Department:', startX + 10, yPos + 6);
      doc.font('Helvetica').text(deptToDisplay, startX + 115, yPos + 6);

      doc.font('Helvetica-Bold').text('Reporting Period:', startX + 280, yPos + 6);
      doc.font('Helvetica').text(reportData.reportingPeriod, startX + 375, yPos + 6);

      doc.y = yPos + 30;

      // Dynamic Table Drawer
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
          doc.text(reportData.emptySectionText, tableX + 6, curY + 5, { align: 'center' });
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

      // ---------------------------------------------------------
      // A. Syllabus Completion (Theory and Laboratory)
      // ---------------------------------------------------------
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(primaryColor).text(reportData.sectionTitleA, 36, doc.y);
      doc.y += 14;

      drawTable(
        reportData.syllabusTheoryTitle,
        reportData.syllabusTheoryHeaders,
        reportData.syllabusTheoryRows,
        [0.45, 0.20, 0.35]
      );

      drawTable(
        reportData.syllabusLabTitle,
        reportData.syllabusLabHeaders,
        reportData.syllabusLabRows,
        [0.42, 0.18, 0.20, 0.20]
      );

      // ---------------------------------------------------------
      // B. Events Organised
      // ---------------------------------------------------------
      drawTable(
        reportData.sectionTitleB,
        reportData.eventsHeaders,
        reportData.eventsRows,
        [0.06, 0.14, 0.30, 0.16, 0.16, 0.18]
      );

      // ---------------------------------------------------------
      // C. Faculty Participation — FDP & NPTEL
      // ---------------------------------------------------------
      drawTable(
        reportData.sectionTitleC1,
        reportData.facultyFdpHeaders,
        reportData.facultyFdpRows,
        [0.06, 0.22, 0.18, 0.28, 0.26]
      );

      drawTable(
        reportData.sectionTitleC2,
        reportData.facultyNptelHeaders,
        reportData.facultyNptelRows,
        [0.06, 0.24, 0.20, 0.32, 0.18]
      );

      // ---------------------------------------------------------
      // D. Student Participation & NPTEL
      // ---------------------------------------------------------
      drawTable(
        reportData.sectionTitleD,
        reportData.studentPartHeaders,
        reportData.studentPartRows,
        [0.06, 0.20, 0.20, 0.10, 0.26, 0.18]
      );

      // ---------------------------------------------------------
      // G. Research Activity
      // ---------------------------------------------------------
      drawTable(
        reportData.sectionTitleG,
        reportData.researchHeaders,
        reportData.researchRows,
        [0.20, 0.22, 0.40, 0.18]
      );

      // ---------------------------------------------------------
      // H. Work Plan (Next Month)
      // ---------------------------------------------------------
      drawTable(
        reportData.sectionTitleH,
        reportData.workPlanHeaders,
        reportData.workPlanRows,
        [0.06, 0.34, 0.28, 0.16, 0.16]
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
