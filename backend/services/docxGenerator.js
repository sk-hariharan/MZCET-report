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
import { normalizeReportData } from './reportNormalizer.js';

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
function createStyledTable(headers, rows, emptyText = 'No records submitted for this section.') {
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

  // Data Rows / Empty State
  if (!rows || rows.length === 0) {
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: emptyText, italic: true, size: 18, color: '64748B' })],
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
    rows.forEach((row, rIdx) => {
      tableRows.push(
        new TableRow({
          children: row.map(cellText => new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(cellText !== undefined && cellText !== null ? cellText : '—'), size: 17, color: '1E293B' })],
                alignment: AlignmentType.CENTER
              })
            ],
            shading: { fill: rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC' },
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
      new TextRun({ text: title, bold: true, color: '1E3A8A', size: 21 })
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

// Main DOCX Generator for individual faculty reports and department summaries
export async function generateDocx(report, departmentName) {
  const reportData = normalizeReportData(report);
  const headerLogoBuffer = getHeaderLogoBuffer();
  const children = [];

  const deptToDisplay = reportData.departmentName || departmentName || 'Information Technology';

  // Document Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `MONTHLY REPORT – ACADEMIC YEAR ${reportData.academicYear.replace('-', ' – ')} (${reportData.semester} SEMESTER)`,
          bold: true,
          color: '1E3A8A',
          size: 22
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 100 }
    })
  );

  // Metadata Table
  const metaTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Name of Department:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: deptToDisplay, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Reporting Period:', bold: true, size: 18 })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: reportData.reportingPeriod, size: 18 })] })] })
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

  // ---------------------------------------------------------
  // Section A. Syllabus Completion (Theory and Laboratory)
  // ---------------------------------------------------------
  children.push(createSectionTitle(reportData.sectionTitleA));

  children.push(createSubSectionTitle(reportData.syllabusTheoryTitle));
  children.push(createStyledTable(reportData.syllabusTheoryHeaders, reportData.syllabusTheoryRows, reportData.emptySectionText));

  children.push(createSubSectionTitle(reportData.syllabusLabTitle));
  children.push(createStyledTable(reportData.syllabusLabHeaders, reportData.syllabusLabRows, reportData.emptySectionText));

  // ---------------------------------------------------------
  // Section B. Details of events organised
  // ---------------------------------------------------------
  children.push(createSectionTitle(reportData.sectionTitleB));
  children.push(createStyledTable(reportData.eventsHeaders, reportData.eventsRows, reportData.emptySectionText));

  // ---------------------------------------------------------
  // Section C. Details of Faculty Participation
  // ---------------------------------------------------------
  children.push(createSectionTitle(reportData.sectionTitleC1));
  children.push(createStyledTable(reportData.facultyFdpHeaders, reportData.facultyFdpRows, reportData.emptySectionText));

  children.push(createSectionTitle(reportData.sectionTitleC2));
  children.push(createStyledTable(reportData.facultyNptelHeaders, reportData.facultyNptelRows, reportData.emptySectionText));

  // ---------------------------------------------------------
  // Section D. Details of Student Participation & NPTEL
  // ---------------------------------------------------------
  children.push(createSectionTitle(reportData.sectionTitleD));
  children.push(createStyledTable(reportData.studentPartHeaders, reportData.studentPartRows, reportData.emptySectionText));

  // ---------------------------------------------------------
  // Section G. Details of Research Activity
  // ---------------------------------------------------------
  children.push(createSectionTitle(reportData.sectionTitleG));
  children.push(createStyledTable(reportData.researchHeaders, reportData.researchRows, reportData.emptySectionText));

  // ---------------------------------------------------------
  // Section H. Work Plan
  // ---------------------------------------------------------
  children.push(createSectionTitle(reportData.sectionTitleH));
  children.push(createStyledTable(reportData.workPlanHeaders, reportData.workPlanRows, reportData.emptySectionText));

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

export async function generateDepartmentSummaryDocx(summary, departmentName) {
  return await generateDocx(summary, departmentName);
}

export async function generateCollegeSummaryDocx(summary) {
  return await generateDocx(summary, 'Mount Zion Institutional Overall');
}
