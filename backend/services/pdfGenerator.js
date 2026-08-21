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

// PDF Generator function for HOD Department Monthly Reports
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

      // Draw top header banner image on every page with exact proportional aspect ratio
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

      doc.text('Name of Department:', startX + 10, yPos + 6);
      doc.font('Helvetica').text(departmentName, startX + 115, yPos + 6);

      doc.font('Helvetica-Bold').text('Reporting Period:', startX + 280, yPos + 6);
      doc.font('Helvetica').text(`${summary.start_date || '06.07.2026'} to ${summary.end_date || '07.08.2026'}`, startX + 375, yPos + 6);

      doc.y = yPos + 30;

      // Dynamic Table Drawer with exact column ratios and DYNAMIC row height to eliminate ANY overflow
      const drawTable = (title, headers, rows, colPcts) => {
        // Page break check for title
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
          doc.y = 78;
        }

        doc.font('Helvetica-Bold').fontSize(9.5).fillColor(primaryColor).text(title, 36, doc.y);
        doc.y += 12;

        const tableX = 36;
        let curY = doc.y;

        // Calculate explicit column widths
        const colWidths = colPcts
          ? colPcts.map(p => p * totalWidth)
          : headers.map(() => totalWidth / headers.length);

        // Calculate Header Row Height Dynamically
        doc.font('Helvetica-Bold').fontSize(8);
        let headerH = 18;
        headers.forEach((h, i) => {
          const textH = doc.heightOfString(h, { width: colWidths[i] - 6, align: 'center' });
          if (textH + 8 > headerH) headerH = textH + 8;
        });

        // Draw Header Box
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
          doc.text('No activities recorded for this section.', tableX + 6, curY + 5, { align: 'center' });
          curY += 18;
        } else {
          rows.forEach((row, rIdx) => {
            // Calculate Row Height Dynamically based on content length
            doc.font('Helvetica').fontSize(8);
            let maxRowH = 18;
            row.forEach((cellText, cIdx) => {
              const txt = String(cellText !== undefined && cellText !== null ? cellText : '—');
              const textH = doc.heightOfString(txt, { width: colWidths[cIdx] - 6, align: 'center' });
              if (textH + 8 > maxRowH) maxRowH = textH + 8;
            });

            // Page break check if row exceeds bottom margin
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
              // Vertically center text within dynamic row box
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

      // A. Syllabus Completion
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(primaryColor).text('A. Details of Syllabus completion (Theory and Lab)', 36, doc.y);
      doc.y += 14;

      // Theory Courses Column Ratio: [0.45, 0.20, 0.35]
      const theoryRatios = [0.45, 0.20, 0.35];
      // Lab Courses Column Ratio: [0.42, 0.18, 0.20, 0.20]
      const labRatios = [0.42, 0.18, 0.20, 0.20];

      // II YEAR
      drawTable(
        'Class: II YEAR — Theory Courses',
        ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Unit Taken (TLP No./Total TLP)'],
        [
          ['MA25C02 - Discrete Mathematics / Dr. Sabeena', '25 Hours', 'Unit 1 & 2 Completed'],
          ['IT25301 - Data Structures and Algorithms in C / Mrs. V. Brindha Devi', '20 Hours', 'Unit 1, Unit 2 & 3.4/3.12 Completed'],
          ['IT25302 - Computer Organization & Architecture / Mrs. R Saraswathi', '20 Hours', 'Unit 1 & Unit 2 Completed'],
          ['CS25303 - Operating Systems (T+L) / Mrs. R. Sangeetha', '20 Hours (Theory)\n8 Hours (Lab)', 'Theory: Unit 1, 2 & 3.1/3.9 Completed\nLab: Ex-4/8 Completed'],
          ['CS25305 - Object Oriented Software Engineering / Mrs A Arifa Banu', '20 Hours', 'Unit 1 & 2 Completed'],
          ['CS25302 - Java Programming / Mrs. Shalini. L', '20 Hours', 'Unit 1 & 2 Completed']
        ],
        theoryRatios
      );

      drawTable(
        'Class: II YEAR — Laboratory Courses',
        ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Exp. Completed / Hours taken', 'Remaining Exp. / Hours required'],
        [
          ['IT25303 - Data Structures and Algorithms in C Lab / Mrs. V. Brindha Devi', '20 Hours', 'EX: 6/15', 'Ex: 8/15'],
          ['CS25307 - Java Programming Laboratory / Mrs. L Shalini', '20 Hours', 'Ex: 5/10', 'Ex: 5/10']
        ],
        labRatios
      );

      // III YEAR
      drawTable(
        'Class: III YEAR — Theory Courses',
        ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Unit Taken (TLP No./Total TLP)'],
        [
          ['CS3591 - Computer Networks (T+L) / Mrs. L Shalini', '15 Hours (Theory)\n10 Hours (Lab)', 'Theory: Unit 1, 2 Completed\nLab: Ex-5/10 (10 Hours)'],
          ['IT3501 - Full Stack Web Development / Mrs. R Saraswathi', '20 Hours', 'Unit 1 & Unit 2 Completed'],
          ['CS3551 - Distributed Computing / Mrs A Arifa Banu', '15 Hours', 'Unit 1 & Unit 2 Completed'],
          ['CS3691 - Embedded Systems and IoT (T+L) / Dr. P. Rajkumar', '15 Hours (Theory)\n10 Hours (Lab)', 'Theory: Unit 1 & Unit 2 Completed\nLab: Ex-6/11 (10 Hours)'],
          ['CCS335 - Cloud Computing (T+L) / Mrs. R. Sangeetha', '22 Hours (Theory)\n8 Hours (Lab)', 'Theory: Unit 1, 2 & 3.3/3.11 Completed\nLab: Ex-4/10 (8 Hours)'],
          ['CCS361 - Robotic Process Automation (T+L) / Mrs. V. Brindha Devi', '18 Hours (Theory)\n10 Hours (Lab)', 'Theory: Unit 1, Unit 2 & 3.1/3.7 Completed\nLab: Ex-4/13 (10 Hours)'],
          ['MX3084 - Disaster Risk Reduction and Management / Dr. A. Nivedha', '15 Hours', 'Unit 1 & Unit 2 Completed']
        ],
        theoryRatios
      );

      drawTable(
        'Class: III YEAR — Laboratory Courses',
        ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Exp. Completed / Hours taken', 'Remaining Exp. / Hours required'],
        [
          ['IT3511 - Full Stack Web Development Lab / Mrs. R Saraswathi', '20 Hours', 'EX: 6/8', '2/8 & 1 Project']
        ],
        labRatios
      );

      // IV YEAR
      drawTable(
        'Class: IV YEAR — Theory Courses',
        ['Sub. Code & Name / Handled by', 'Total Hours Handled', 'Unit Taken (TLP No./Total TLP)'],
        [
          ['GE3791 - Human Values and Ethics / Mrs. S. Ammu', '28 Hours', 'Unit 1, 2, 3 & Unit 4.1/4.5 Completed'],
          ['GE3751 - Principles of Management / Mr. K. Muthuraman', '20 Hours', 'Unit 1, 2 & 3.8/3.10 Completed'],
          ['AI3021 - OE2-IT IN AGRICULTURE SYSTEM / Ms. S. Nivetha', '25 Hours', 'Unit 1, 2 & 3.6/3.8 Completed'],
          ['OME354 - OE3-APPLIED DESIGN THINKING / Mrs A Arifa Banu', '23 Hours', 'Unit 1, 2, 3 & Unit 4.3/4.6 Completed'],
          ['CRA332 - OE4 DRONE TECHNOLOGY / Ms. Ramaprabha', '23 Hours', 'Unit 1, 2 & 3.6/3.8 Completed']
        ],
        theoryRatios
      );

      // B. Events Organised Column Ratio: [0.06, 0.14, 0.30, 0.16, 0.16, 0.18]
      const eventsRatios = [0.06, 0.14, 0.30, 0.16, 0.16, 0.18];
      drawTable(
        'B. Details of events organised (IV/Conference/Workshop/Seminar/Symposium/Other)',
        ['S.No', 'Date of Event', 'Name of Event', 'Year / Students', 'Internal Coordinator', 'Resource Person Details'],
        [
          ['1', '14.07.2026', 'WORKSHOP: Hands on networking', 'IV Year / 29', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
          ['2', '16.07.2026', 'SEMINAR: Career Roadmap for Cyber Security and Ethical Hacking', '90 Students', 'Mrs A Arifa Banu', 'Mr. R Thamarai Selvam, Certified Ethical Hacker, UK'],
          ['3', '24.07.2026', 'WORKSHOP: IT Infrastructure Essentials', 'IV Yr (29) & III Yr (61)', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
          ['4', '28.07.2026', 'WORKSHOP: Computer Systems Workshop', 'II Year / 59', 'Mrs. L. Shalini', 'Dr. P. Rajkumar'],
          ['5', '05.08 – 07.08.2026', 'WORKSHOP: Cloud Computing Technologies', '71 Students', 'Mrs. R Saraswathi', 'Dr. R V Nataraj, Director, Campus Reign']
        ],
        eventsRatios
      );

      // C. Faculty Participation Column Ratio: [0.06, 0.22, 0.18, 0.28, 0.26]
      const fdpRatios = [0.06, 0.22, 0.18, 0.28, 0.26];
      drawTable(
        'C. Details of Faculty Participation — Workshop / Seminar / FDP',
        ['S.No', 'Name of Faculty', 'Date of Event', 'Name of Event', 'Details of Event (Venue)'],
        [
          ['1', 'Mrs. V Brindha Devi', '15.06.2026 – 17.06.2026', 'New Age Teaching Techniques', 'ICT Academy - MZCET (Autonomous)'],
          ['', 'Mrs. V Brindha Devi', '22.06.2026 – 26.06.2026', 'AGENTIC AI SYSTEMS: From LLMs to Tiny LM', 'Kalasalingam Academy (KARE)'],
          ['', 'Mrs. V Brindha Devi', '08.06.2026 – 12.06.2026', 'Agentic AI: MCP, A2A & Enterprise Agents', 'JBIET - ExcelR'],
          ['2', 'Mrs. A Arifa Banu', '15.06.2026 – 17.06.2026', 'New Age Teaching Techniques', 'ICT Academy - MZCET (Autonomous)'],
          ['', 'Mrs. A Arifa Banu', '22.06.2026 – 26.06.2026', 'AGENTIC AI SYSTEMS: From LLMs to Tiny LM', 'Kalasalingam Academy (KARE)'],
          ['3', 'Mrs R Sangeetha', '22.06.2026 – 26.06.2026', 'AGENTIC AI SYSTEMS: From LLMs to Tiny LM', 'Kalasalingam Academy (KARE)'],
          ['', 'Mrs R Sangeetha', '29.06.2026 – 04.07.2026', 'AI Driven Cyber Security', 'New Prince Bhavani College of Engg'],
          ['4', 'Mrs L Shalini', '22.06.2026 – 26.06.2026', 'AGENTIC AI SYSTEMS: From LLMs to Tiny LM', 'Kalasalingam Academy (KARE)']
        ],
        fdpRatios
      );

      const fNptelRatios = [0.06, 0.24, 0.20, 0.32, 0.18];
      drawTable(
        'C. Details of Faculty Participation — NPTEL Course',
        ['S.No', 'Name of Faculty', 'Date (From – To)', 'Name of Course', 'Status / Result'],
        [
          ['1', 'Mrs. R Saraswathi', '20.07.2026 – 09.10.2026', 'Computer Architecture and Organization', 'Registered'],
          ['2', 'Mrs. V Brindha Devi', '20.07.2026 – 09.10.2026', 'Mind Body and Wellness', 'Registered']
        ],
        fNptelRatios
      );

      // D. Student Participation Column Ratio: [0.06, 0.20, 0.20, 0.10, 0.26, 0.18]
      const sNptelRatios = [0.06, 0.20, 0.20, 0.10, 0.26, 0.18];
      drawTable(
        'D. Details of Student Participation in NPTEL',
        ['S.No', 'Name of Mentor', 'Name of Student', 'Year', 'Name of Course', 'Status'],
        [
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
        ],
        sNptelRatios
      );

      // G. Research Activity
      drawTable(
        'G. Details of Research Activity (Publication, Conference, Research proposal)',
        ['Category', 'Name of Faculty', 'Title & Venue Details', 'Status'],
        [
          ['Journal', 'IT Faculty Team', 'Submitted / Published Papers', 'In Progress'],
          ['Conference', 'IT Faculty Team', 'National / International Conferences', 'In Progress'],
          ['Research Proposal', 'IT Faculty Team', 'Funding Proposals to Agencies', 'In Progress']
        ],
        [0.20, 0.22, 0.40, 0.18]
      );

      // H. Work Plan Column Ratio: [0.06, 0.34, 0.28, 0.16, 0.16]
      const kpiRatios = [0.06, 0.34, 0.28, 0.16, 0.16];
      drawTable(
        'H. Work Plan (Next Month)',
        ['S.No', 'Particulars', 'Requirement Target', 'Conducted (2026-27 Odd)', 'To be Conducted'],
        [
          ['1', 'Certificate/VAC course', 'Min. 1 per Semester (UG & PG)', '0', '1 per class'],
          ['2', 'Participation in certificate course', 'Above 50%', 'Ongoing', 'Target 50%+'],
          ['3', 'Participation in internship', 'Above 50%', 'Ongoing', 'Target 50%+'],
          ['4', 'Participation in IPT', 'Above 65%', 'Ongoing', 'Target 65%+'],
          ['5', 'Industrial visit', 'Min. 1 per ACY (I & II Year)', '0', 'Planned'],
          ['6', 'Student centric activities', 'Min. 1 activity / month / subject', 'Conducted', '1 per subject'],
          ['7', '24 hours workshop', '3 per semester (UG), 1 per sem (PG)', '1 Conducted', '2 Planned'],
          ['8', 'Symposium/Conference', 'Min. 1 per ACY', '0', 'Planned'],
          ['9', 'Project expo', 'Min. 1 per ACY', '0', 'Planned'],
          ['10', 'Technical competitions', 'Min. 5 per semester', 'Conducted', '5 Planned'],
          ['11', 'Exam results (Internal & External)', '75% Dept, 85% Subject, 4 Rank Holders', 'On Track', 'Target 75%+'],
          ['12', 'Publication (Journal & Conference)', 'Min. 1 per Sem / Faculty', 'In Progress', '1 Journal, 1 Conf'],
          ['13', 'MoU with industry', 'Min. 2 New MoUs / 2 activities per MoU', 'Active', '2 Activities'],
          ['14', 'Placement', 'Above 80%', 'On Track', 'Target 80%+'],
          ['15', 'Staff participation (Workshop/FDP)', 'Min. 2 per ACY by each faculty (>5 days)', '2/2 Completed', 'Planned'],
          ['16', 'NPTEL courses', 'One per faculty / 3 students per mentor', 'Active (Faculty: 4)', 'Mentor assigned'],
          ['17', 'Students participation in events', '10 per class per semester', 'Active', '10 per class']
        ],
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
            `Mount Zion College of Engineering and Technology • ${departmentName} Department Monthly Report • Page ${i + 1} of ${pageCount}`,
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
