import ExcelJS from 'exceljs';
import { normalizeReportData } from './reportNormalizer.js';

// Helper to create clean Sheet 1: Report Summary
function createSummarySheet(workbook, reportData) {
  const worksheet = workbook.addWorksheet('Report Summary', {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 1 }]
  });

  const headerRow = worksheet.addRow(['Field', 'Value']);
  headerRow.height = 26;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // MZCET Navy Blue
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  });

  const summaryRows = [
    ['College', 'Mount Zion College of Engineering and Technology'],
    ['Department', reportData.departmentName],
    ['Academic Year', reportData.academicYear],
    ['Semester', `${reportData.semester} Semester`],
    ['Reporting Period', reportData.reportingPeriod],
    ['Staff Name', reportData.staffName],
    ['Staff Code / ID', reportData.staffCode || 'N/A'],
    ['Designation', reportData.designation || 'N/A'],
    ['Report Status', reportData.status]
  ];

  summaryRows.forEach((row, idx) => {
    const dataRow = worksheet.addRow(row);
    dataRow.height = 22;

    const cellField = dataRow.getCell(1);
    cellField.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cellField.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cellField.alignment = { vertical: 'middle', horizontal: 'left' };
    cellField.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };

    const cellValue = dataRow.getCell(2);
    cellValue.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
    cellValue.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC' } };
    cellValue.alignment = { vertical: 'middle', horizontal: 'left' };
    cellValue.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
  });

  worksheet.getColumn(1).width = 22;
  worksheet.getColumn(2).width = 52;
}

// Helper to create clean data worksheets for each section
function createDataSheet(workbook, sheetName, headers, rows, emptyText = 'No records submitted for this section.') {
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true, state: 'frozen', ySplit: 1 }]
  });

  // Row 1: Headers
  const headerRow = worksheet.addRow(headers);
  headerRow.height = 26;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' } // MZCET Navy Blue
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  });

  // Add AutoFilter to headers if there are data rows
  if (rows && rows.length > 0) {
    const lastColChar = String.fromCharCode(64 + headers.length);
    worksheet.autoFilter = `A1:${lastColChar}1`;
  }

  // Data rows / Empty section handling
  if (!rows || rows.length === 0) {
    const emptyRow = worksheet.addRow([emptyText]);
    const maxColChar = String.fromCharCode(64 + Math.max(headers.length, 1));
    worksheet.mergeCells(`A${emptyRow.number}:${maxColChar}${emptyRow.number}`);
    const emptyCell = emptyRow.getCell(1);
    emptyCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
    emptyCell.alignment = { vertical: 'middle', horizontal: 'center' };
    emptyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    emptyCell.border = {
      top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
    };
    emptyRow.height = 22;
  } else {
    rows.forEach((rowData, idx) => {
      const dataRow = worksheet.addRow(rowData);
      dataRow.height = 22;
      dataRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });
    });
  }

  // Calculate & Set Auto Column Widths
  headers.forEach((header, colIdx) => {
    const colNumber = colIdx + 1;
    let maxLen = header.length;
    if (rows && rows.length > 0) {
      rows.forEach(r => {
        const val = String(r[colIdx] !== undefined && r[colIdx] !== null ? r[colIdx] : '');
        if (val.length > maxLen) maxLen = val.length;
      });
    }
    const width = Math.min(Math.max(maxLen + 4, 15), 45);
    worksheet.getColumn(colNumber).width = width;
  });
}

/**
 * Generate Excel Workbook with separate worksheets for each section.
 * @param {Object} summary Raw report object or summary object from database
 * @param {String} departmentName Optional department name override
 * @returns {Promise<Buffer>} Excel XLSX file buffer
 */
export async function generateHodMonthlyReportExcel(summary, departmentName) {
  const reportData = normalizeReportData(summary);
  if (departmentName) {
    reportData.departmentName = departmentName;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MZCET FacultyReport Portal';
  workbook.lastModifiedBy = 'MZCET FacultyReport Portal';
  workbook.created = new Date();

  // Sheet 1: Report Summary
  createSummarySheet(workbook, reportData);

  // Sheet 2: Syllabus Theory
  createDataSheet(
    workbook,
    'Syllabus Theory',
    reportData.syllabusTheoryHeaders,
    reportData.syllabusTheoryRows,
    reportData.emptySectionText
  );

  // Sheet 3: Syllabus Lab
  createDataSheet(
    workbook,
    'Syllabus Lab',
    reportData.syllabusLabHeaders,
    reportData.syllabusLabRows,
    reportData.emptySectionText
  );

  // Sheet 4: Events
  createDataSheet(
    workbook,
    'Events',
    reportData.eventsHeaders,
    reportData.eventsRows,
    reportData.emptySectionText
  );

  // Sheet 5: Faculty FDP
  createDataSheet(
    workbook,
    'Faculty FDP',
    reportData.facultyFdpHeaders,
    reportData.facultyFdpRows,
    reportData.emptySectionText
  );

  // Sheet 6: Faculty NPTEL
  createDataSheet(
    workbook,
    'Faculty NPTEL',
    reportData.facultyNptelHeaders,
    reportData.facultyNptelRows,
    reportData.emptySectionText
  );

  // Sheet 7: Student Participation
  createDataSheet(
    workbook,
    'Student Participation',
    reportData.studentPartHeaders,
    reportData.studentPartRows,
    reportData.emptySectionText
  );

  // Sheet 8: Research Activity
  createDataSheet(
    workbook,
    'Research Activity',
    reportData.researchHeaders,
    reportData.researchRows,
    reportData.emptySectionText
  );

  // Sheet 9: Work Plan
  createDataSheet(
    workbook,
    'Work Plan',
    reportData.workPlanHeaders,
    reportData.workPlanRows,
    reportData.emptySectionText
  );

  return await workbook.xlsx.writeBuffer();
}

// Generate Excel Report for Individual Staff Activity Report
export async function generateStaffReportExcel(report, departmentName) {
  return await generateHodMonthlyReportExcel(report, departmentName);
}

// Generate Excel Report for College Overall Monthly Summary
export async function generateCollegeSummaryExcel(summary) {
  return await generateHodMonthlyReportExcel(summary, 'Mount Zion Institutional Overall');
}
