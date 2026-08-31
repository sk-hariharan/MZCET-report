export interface SubjectItem {
  code: string;
  name: string;
  full: string;
  defaultInstructor?: string;
  idNo?: string;
  type?: string;
}

export interface SemesterGroup {
  year: string;
  semester: string;
  classCoordinator?: string;
  subjects: SubjectItem[];
}

export interface FacultyMember {
  idNo?: string;
  name: string;
  designation: string;
  department: string;
  staffId: string;
  email: string;
  role: 'staff' | 'hod' | 'admin';
  coordinatorRole?: string;
}

export const IT_FACULTY_ROSTER: FacultyMember[] = [
  { idNo: '601', name: 'Dr. P. Rajkumar', designation: 'Professor & Head', department: 'Information Technology', staffId: '601', email: 'rajkumar.p@mzcet.in', role: 'hod' },
  { idNo: '1909', name: 'Mrs. V. Brindha Devi', designation: 'Assistant Professor', department: 'Information Technology', staffId: '1909', email: 'brindhadevi.v@mzcet.in', role: 'staff' },
  { idNo: '2142', name: 'Mrs. R. Saraswathi', designation: 'Assistant Professor', department: 'Information Technology', staffId: '2142', email: 'saraswathi.r@mzcet.in', role: 'staff', coordinatorRole: 'V Semester Class Co-ordinator' },
  { idNo: '2070', name: 'Mrs. R. Sangeetha', designation: 'Assistant Professor', department: 'Information Technology', staffId: '2070', email: 'sangeetha.r@mzcet.in', role: 'staff', coordinatorRole: 'III Semester Class Co-ordinator' },
  { idNo: '1970', name: 'Mrs. A. Arifa Banu', designation: 'Assistant Professor', department: 'Information Technology', staffId: '1970', email: 'arifabanu.a@mzcet.in', role: 'staff', coordinatorRole: 'VII Semester Class Co-ordinator' },
  { idNo: '2025', name: 'Mrs. L. Shalini', designation: 'Assistant Professor', department: 'Information Technology', staffId: '2025', email: 'shalini.l@mzcet.in', role: 'staff' },
  { idNo: '1609', name: 'Ms. Ramaprabha', designation: 'Assistant Professor', department: 'Information Technology', staffId: '1609', email: 'ramaprabha@mzcet.in', role: 'staff' },
  { idNo: '2141', name: 'Dr. Sabeena', designation: 'Assistant Professor', department: 'Information Technology', staffId: '2141', email: 'sabeena@mzcet.in', role: 'staff' },
  { idNo: '2100', name: 'Dr. A. Nivedha', designation: 'Assistant Professor', department: 'Information Technology', staffId: '2100', email: 'nivedha.a@mzcet.in', role: 'staff' },
  { idNo: '1897', name: 'Mr. K. Muthuraman', designation: 'Assistant Professor', department: 'Information Technology', staffId: '1897', email: 'muthuraman.k@mzcet.in', role: 'staff' },
  { idNo: '', name: 'Dr. Pavalamalar', designation: 'Assistant Professor', department: 'Information Technology', staffId: 'PAV', email: 'pavalamalar@mzcet.in', role: 'staff', coordinatorRole: 'I Semester Class Co-ordinator' },
  { idNo: '2161', name: 'Dr. Thirumamagal', designation: 'Assistant Professor', department: 'Information Technology', staffId: '2161', email: 'thirumamagal@mzcet.in', role: 'staff' },
  { idNo: '2162', name: 'Mrs. Jenifer', designation: 'Assistant Professor', department: 'Information Technology', staffId: '2162', email: 'jenifer@mzcet.in', role: 'staff' },
  { idNo: '', name: 'Mrs. Annu Rose', designation: 'Assistant Professor', department: 'Information Technology', staffId: 'ANNU', email: 'annurose@mzcet.in', role: 'staff' },
  { idNo: '', name: 'Ms. Meenakshi', designation: 'Assistant Professor', department: 'Information Technology', staffId: 'MEENA', email: 'meenakshi@mzcet.in', role: 'staff' },
  { idNo: '1295', name: 'Mrs. S. Ammu', designation: 'Assistant Professor', department: 'Information Technology', staffId: '1295', email: 'ammu.s@mzcet.in', role: 'staff' },
  { idNo: '2067', name: 'Ms. S. Nivetha', designation: 'Assistant Professor', department: 'Information Technology', staffId: '2067', email: 'nivetha.s@mzcet.in', role: 'staff' }
];

export const ACADEMIC_CURRICULUM: SemesterGroup[] = [
  {
    year: '1st Year',
    semester: 'Semester 1',
    classCoordinator: 'Dr. Pavalamalar',
    subjects: [
      { code: 'MA25C01', name: 'Applied Calculus (T)', full: 'MA25C01 - Applied Calculus (T)', defaultInstructor: 'Mrs Jenifer', idNo: '2162', type: 'Theory' },
      { code: 'EN25C01', name: 'English Essentials – I (T)', full: 'EN25C01 - English Essentials – I (T)', defaultInstructor: 'Mrs Annu Rose', type: 'Theory' },
      { code: 'UC25H01', name: 'தமிழர் மரபு / Heritage of Tamils (T)', full: 'UC25H01 - தமிழர் மரபு / Heritage of Tamils (T)', defaultInstructor: 'Ms Meenakshi', type: 'Theory' },
      { code: 'PH25C01', name: 'Applied Physics – I (LIT)', full: 'PH25C01 - Applied Physics – I (LIT)', defaultInstructor: 'Dr Thirumamagal', idNo: '2161', type: 'Integrated' },
      { code: 'CY25C01', name: 'Applied Chemistry – I (LIT)', full: 'CY25C01 - Applied Chemistry – I (LIT)', defaultInstructor: 'Dr. Pavalamalar', type: 'Integrated' },
      { code: 'CS25C01', name: 'Computer Programming: C (LIT)', full: 'CS25C01 - Computer Programming: C (LIT)', defaultInstructor: 'Mrs. V. Brindha Devi', idNo: '1909', type: 'Integrated' },
      { code: 'CS25C03', name: 'Essentials of Computing (LIT)', full: 'CS25C03 - Essentials of Computing (LIT)', defaultInstructor: 'Dr. P. Rajkumar', idNo: '601', type: 'Integrated' },
      { code: 'UC25A01', name: 'Life Skills for Engineers – I*', full: 'UC25A01 - Life Skills for Engineers – I*', type: 'Theory' },
      { code: 'UC25A02', name: 'Physical Education – I*', full: 'UC25A02 - Physical Education – I*', type: 'Practical' },
      { code: 'ME25C04', name: 'Makerspace (L)', full: 'ME25C04 - Makerspace (L)', type: 'Practical' },
      { code: '---', name: 'NCC / NSS / NSO', full: '--- - NCC / NSS / NSO', type: 'Practical' }
    ]
  },
  {
    year: '1st Year',
    semester: 'Semester 2',
    subjects: [
      { code: 'HS3252', name: 'Professional English – II', full: 'HS3252 - Professional English – II', type: 'Theory' },
      { code: 'MA3251', name: 'Statistics and Numerical Methods', full: 'MA3251 - Statistics and Numerical Methods', type: 'Theory' },
      { code: 'PH3256', name: 'Physics for Information Science', full: 'PH3256 - Physics for Information Science', type: 'Theory' },
      { code: 'BE3251', name: 'Basic Electrical and Electronics Engineering', full: 'BE3251 - Basic Electrical and Electronics Engineering', type: 'Theory' },
      { code: 'CS3251', name: 'Programming in C', full: 'CS3251 - Programming in C', type: 'Theory' }
    ]
  },
  {
    year: '2nd Year',
    semester: 'Semester 3',
    classCoordinator: 'Mrs. R. Sangeetha',
    subjects: [
      { code: 'MA25C02', name: 'Discrete Mathematics', full: 'MA25C02 - Discrete Mathematics', defaultInstructor: 'Dr. Sabeena', idNo: '2141', type: 'Theory' },
      { code: 'IT25302', name: 'Computer Organization & Architecture', full: 'IT25302 - Computer Organization & Architecture', defaultInstructor: 'Mrs. R Saraswathi', idNo: '2142', type: 'Theory' },
      { code: 'IT25301', name: 'Data Structures and Algorithms in C', full: 'IT25301 - Data Structures and Algorithms in C', defaultInstructor: 'Mrs. V. Brindha Devi', idNo: '1909', type: 'Theory' },
      { code: 'CS25302', name: 'Java Programming', full: 'CS25302 - Java Programming', defaultInstructor: 'Mrs. L Shalini', idNo: '2025', type: 'Theory' },
      { code: 'CS25303', name: 'Operating Systems (T+L)', full: 'CS25303 - Operating Systems (T+L)', defaultInstructor: 'Mrs. R. Sangeetha', idNo: '2070', type: 'Integrated' },
      { code: 'CS25305', name: 'Object Oriented Software Engineering', full: 'CS25305 - Object Oriented Software Engineering', defaultInstructor: 'Mrs A Arifa Banu', idNo: '1970', type: 'Theory' },
      { code: 'IT25303', name: 'Data Structures and Algorithms in C Laboratory', full: 'IT25303 - Data Structures and Algorithms in C Laboratory', defaultInstructor: 'Mrs. V. Brindha Devi', idNo: '1909', type: 'Practical' },
      { code: 'CS25307', name: 'Java Programming Laboratory', full: 'CS25307 - Java Programming Laboratory', defaultInstructor: 'Mrs. L Shalini', idNo: '2025', type: 'Practical' }
    ]
  },
  {
    year: '2nd Year',
    semester: 'Semester 4',
    subjects: [
      { code: 'CS3452', name: 'Theory of Computation', full: 'CS3452 - Theory of Computation', type: 'Theory' },
      { code: 'CS3491', name: 'Artificial Intelligence and Machine Learning', full: 'CS3491 - Artificial Intelligence and Machine Learning', type: 'Integrated' },
      { code: 'CS3492', name: 'Database Management Systems', full: 'CS3492 - Database Management Systems', type: 'Theory' },
      { code: 'CS3451', name: 'Introduction to Operating Systems', full: 'CS3451 - Introduction to Operating Systems', type: 'Theory' },
      { code: 'GE3451', name: 'Environmental Sciences and Sustainability', full: 'GE3451 - Environmental Sciences and Sustainability', type: 'Theory' },
      { code: 'CS3481', name: 'Operating Systems Laboratory', full: 'CS3481 - Operating Systems Laboratory', type: 'Practical' },
      { code: 'CS3482', name: 'Database Management Systems Laboratory', full: 'CS3482 - Database Management Systems Laboratory', type: 'Practical' },
      { code: 'IT3401', name: 'Web Essentials', full: 'IT3401 - Web Essentials', type: 'Integrated' }
    ]
  },
  {
    year: '3rd Year',
    semester: 'Semester 5',
    classCoordinator: 'Mrs. R Saraswathi',
    subjects: [
      { code: 'CS3591', name: 'Computer Networks (T+L)', full: 'CS3591 - Computer Networks (T+L)', defaultInstructor: 'Mrs. L Shalini', idNo: '2025', type: 'Integrated' },
      { code: 'IT3501', name: 'Full Stack Web Development', full: 'IT3501 - Full Stack Web Development', defaultInstructor: 'Mrs. R Saraswathi', idNo: '2142', type: 'Theory' },
      { code: 'CS3551', name: 'Distributed Computing', full: 'CS3551 - Distributed Computing', defaultInstructor: 'Mrs A Arifa Banu', idNo: '1970', type: 'Theory' },
      { code: 'CS3691', name: 'Embedded Systems and IoT (T+L)', full: 'CS3691 - Embedded Systems and IoT (T+L)', defaultInstructor: 'Dr. P. Rajkumar', idNo: '601', type: 'Integrated' },
      { code: 'CCS335', name: 'Cloud Computing (T+L)', full: 'CCS335 - Cloud Computing (T+L)', defaultInstructor: 'Mrs. R. Sangeetha', idNo: '2070', type: 'Integrated' },
      { code: 'CCS361', name: 'Robotic Process Automation (T+L)', full: 'CCS361 - Robotic Process Automation (T+L)', defaultInstructor: 'Mrs. V. Brindha Devi', idNo: '1909', type: 'Integrated' },
      { code: 'MX3084', name: 'Disaster Risk Reduction and Management', full: 'MX3084 - Disaster Risk Reduction and Management', defaultInstructor: 'Dr. A. Nivedha', idNo: '2100', type: 'Theory' },
      { code: 'IT3511', name: 'Full Stack Web Development Laboratory', full: 'IT3511 - Full Stack Web Development Laboratory', defaultInstructor: 'Mrs. R Saraswathi', idNo: '2142', type: 'Practical' }
    ]
  },
  {
    year: '4th Year',
    semester: 'Semester 7',
    classCoordinator: 'A ARIFA BANU',
    subjects: [
      { code: 'GE3791', name: 'Human Values and Ethics', full: 'GE3791 - Human Values and Ethics', defaultInstructor: 'Mrs. S. Ammu', idNo: '1295', type: 'Theory' },
      { code: 'GE3751', name: 'Principles of Management', full: 'GE3751 - Principles of Management', defaultInstructor: 'Mr. K. Muthuraman', idNo: '1897', type: 'Theory' },
      { code: 'AI3021', name: 'OE 2 IT in Agriculture System', full: 'AI3021 - OE 2 IT in Agriculture System', defaultInstructor: 'Ms. S. Nivetha', idNo: '2067', type: 'Theory' },
      { code: 'OME354', name: 'OE 3 Applied Design Thinking', full: 'OME354 - OE 3 Applied Design Thinking', defaultInstructor: 'Mrs A Arifa Banu', idNo: '1970', type: 'Theory' },
      { code: 'CRA332', name: 'OE 4 Drone Technologies', full: 'CRA332 - OE 4 Drone Technologies', defaultInstructor: 'Ms. Ramaprabha', idNo: '1609', type: 'Theory' }
    ]
  }
];

export interface CourseItem {
  department: string;
  year: string;
  semester: string;
  code: string;
  name: string;
  full: string;
  type: string;
  defaultInstructor?: string;
  idNo?: string;
}

export const DEPARTMENTS = [
  'INFORMATION TECHNOLOGY',
  'COMPUTER SCIENCE & ENGINEERING',
  'ELECTRONICS & COMMUNICATION ENGINEERING',
  'ELECTRICAL & ELECTRONICS ENGINEERING',
  'MECHANICAL ENGINEERING',
  'CIVIL ENGINEERING'
];

export const YEARS = ['I YEAR', 'II YEAR', 'III YEAR', 'IV YEAR'];

const SUBJECT_TEMPLATES: { [key: string]: { code: string, name: string, type: string, defaultInstructor?: string, idNo?: string }[] } = {
  'I YEAR_Semester 1': [
    { code: 'MA25C01', name: 'Applied Calculus (T)', type: 'Theory', defaultInstructor: 'Mrs Jenifer', idNo: '2162' },
    { code: 'EN25C01', name: 'English Essentials – I (T)', type: 'Theory', defaultInstructor: 'Mrs Annu Rose' },
    { code: 'UC25H01', name: 'தமிழர் மரபு / Heritage of Tamils (T)', type: 'Theory', defaultInstructor: 'Ms Meenakshi' },
    { code: 'PH25C01', name: 'Applied Physics – I (LIT)', type: 'Integrated', defaultInstructor: 'Dr Thirumamagal', idNo: '2161' },
    { code: 'CY25C01', name: 'Applied Chemistry – I (LIT)', type: 'Integrated', defaultInstructor: 'Dr. Pavalamalar' },
    { code: 'CS25C01', name: 'Computer Programming: C (LIT)', type: 'Integrated', defaultInstructor: 'Mrs. V. Brindha Devi', idNo: '1909' },
    { code: 'CS25C03', name: 'Essentials of Computing (LIT)', type: 'Integrated', defaultInstructor: 'Dr. P. Rajkumar', idNo: '601' },
    { code: 'UC25A01', name: 'Life Skills for Engineers – I*', type: 'Theory' },
    { code: 'UC25A02', name: 'Physical Education – I*', type: 'Practical' },
    { code: 'ME25C04', name: 'Makerspace (L)', type: 'Practical' },
    { code: '---', name: 'NCC / NSS / NSO', type: 'Practical' }
  ],
  'I YEAR_Semester 2': [
    { code: 'HS3252', name: 'Professional English – II', type: 'Theory' },
    { code: 'MA3251', name: 'Statistics and Numerical Methods', type: 'Theory' },
    { code: 'PH3256', name: 'Physics for Information Science', type: 'Theory' },
    { code: 'BE3251', name: 'Basic Electrical and Electronics Engineering', type: 'Theory' },
    { code: 'CS3251', name: 'Programming in C', type: 'Theory' }
  ],
  'II YEAR_Semester 3': [
    { code: 'MA25C02', name: 'Discrete Mathematics', type: 'Theory', defaultInstructor: 'Dr. Sabeena', idNo: '2141' },
    { code: 'IT25302', name: 'Computer Organization & Architecture', type: 'Theory', defaultInstructor: 'Mrs. R Saraswathi', idNo: '2142' },
    { code: 'IT25301', name: 'Data Structures and Algorithms in C', type: 'Theory', defaultInstructor: 'Mrs. V. Brindha Devi', idNo: '1909' },
    { code: 'CS25302', name: 'Java Programming', type: 'Theory', defaultInstructor: 'Mrs. L Shalini', idNo: '2025' },
    { code: 'CS25303', name: 'Operating Systems (T+L)', type: 'Integrated', defaultInstructor: 'Mrs. R. Sangeetha', idNo: '2070' },
    { code: 'CS25305', name: 'Object Oriented Software Engineering', type: 'Theory', defaultInstructor: 'Mrs A Arifa Banu', idNo: '1970' },
    { code: 'IT25303', name: 'Data Structures and Algorithms in C Laboratory', type: 'Practical', defaultInstructor: 'Mrs. V. Brindha Devi', idNo: '1909' },
    { code: 'CS25307', name: 'Java Programming Laboratory', type: 'Practical', defaultInstructor: 'Mrs. L Shalini', idNo: '2025' }
  ],
  'II YEAR_Semester 4': [
    { code: 'CS3452', name: 'Theory of Computation', type: 'Theory' },
    { code: 'CS3491', name: 'Artificial Intelligence and Machine Learning', type: 'Integrated' },
    { code: 'CS3492', name: 'Database Management Systems', type: 'Theory' },
    { code: 'CS3451', name: 'Introduction to Operating Systems', type: 'Theory' },
    { code: 'GE3451', name: 'Environmental Sciences and Sustainability', type: 'Theory' },
    { code: 'CS3481', name: 'Operating Systems Laboratory', type: 'Practical' },
    { code: 'CS3482', name: 'Database Management Systems Laboratory', type: 'Practical' },
    { code: 'IT3401', name: 'Web Essentials', type: 'Integrated' }
  ],
  'III YEAR_Semester 5': [
    { code: 'CS3591', name: 'Computer Networks (T+L)', type: 'Integrated', defaultInstructor: 'Mrs. L Shalini', idNo: '2025' },
    { code: 'IT3501', name: 'Full Stack Web Development', type: 'Theory', defaultInstructor: 'Mrs. R Saraswathi', idNo: '2142' },
    { code: 'CS3551', name: 'Distributed Computing', type: 'Theory', defaultInstructor: 'Mrs A Arifa Banu', idNo: '1970' },
    { code: 'CS3691', name: 'Embedded Systems and IoT (T+L)', type: 'Integrated', defaultInstructor: 'Dr. P. Rajkumar', idNo: '601' },
    { code: 'CCS335', name: 'Cloud Computing (T+L)', type: 'Integrated', defaultInstructor: 'Mrs. R. Sangeetha', idNo: '2070' },
    { code: 'CCS361', name: 'Robotic Process Automation (T+L)', type: 'Integrated', defaultInstructor: 'Mrs. V. Brindha Devi', idNo: '1909' },
    { code: 'MX3084', name: 'Disaster Risk Reduction and Management', type: 'Theory', defaultInstructor: 'Dr. A. Nivedha', idNo: '2100' },
    { code: 'IT3511', name: 'Full Stack Web Development Laboratory', type: 'Practical', defaultInstructor: 'Mrs. R Saraswathi', idNo: '2142' }
  ],
  'III YEAR_Semester 6': [
    { code: 'CS3692', name: 'Software Engineering and Agile Methodologies', type: 'Theory' },
    { code: 'IT3601', name: 'Mobile Communication and Application Development', type: 'Theory' },
    { code: 'CCS343', name: 'Mobile Application Development Laboratory', type: 'Practical' },
    { code: 'CCS356', name: 'Software Testing and Quality Assurance', type: 'Theory' }
  ],
  'IV YEAR_Semester 7': [
    { code: 'GE3791', name: 'Human Values and Ethics', type: 'Theory', defaultInstructor: 'Mrs. S. Ammu', idNo: '1295' },
    { code: 'GE3751', name: 'Principles of Management', type: 'Theory', defaultInstructor: 'Mr. K. Muthuraman', idNo: '1897' },
    { code: 'AI3021', name: 'OE 2 IT in Agriculture System', type: 'Theory', defaultInstructor: 'Ms. S. Nivetha', idNo: '2067' },
    { code: 'OME354', name: 'OE 3 Applied Design Thinking', type: 'Theory', defaultInstructor: 'Mrs A Arifa Banu', idNo: '1970' },
    { code: 'CRA332', name: 'OE 4 Drone Technologies', type: 'Theory', defaultInstructor: 'Ms. Ramaprabha', idNo: '1609' }
  ],
  'IV YEAR_Semester 8': [
    { code: 'IT3811', name: 'Project Work Phase II', type: 'Practical' }
  ]
};

export const COURSES_DATA: CourseItem[] = [];

DEPARTMENTS.forEach(dept => {
  YEARS.forEach(year => {
    const semesters =
      year === 'I YEAR' ? ['Semester 1', 'Semester 2'] :
        year === 'II YEAR' ? ['Semester 3', 'Semester 4'] :
          year === 'III YEAR' ? ['Semester 5', 'Semester 6'] :
            ['Semester 7', 'Semester 8'];

    semesters.forEach(sem => {
      const templateKey = `${year}_${sem}`;
      const templates = SUBJECT_TEMPLATES[templateKey] || [];

      templates.forEach(t => {
        let code = t.code;
        let name = t.name;

        if (dept === 'COMPUTER SCIENCE & ENGINEERING') {
          code = code.replace(/^IT/, 'CS');
        } else if (dept === 'ELECTRONICS & COMMUNICATION ENGINEERING') {
          code = code.replace(/^(IT|CS|GE|MA|PH|CY|BE)/, 'EC');
          name = name
            .replace('Full Stack Web Development', 'Microcontrollers & VLSI Design')
            .replace('Data Structures and Algorithms', 'Signals and Systems')
            .replace('Matrices and Calculus', 'Engineering Mathematics I')
            .replace('Operating Systems', 'Digital Communication')
            .replace('Embedded Systems and IoT', 'Embedded Systems & ECE Lab')
            .replace('Computer Networks', 'Wireless Communications');
        } else if (dept === 'ELECTRICAL & ELECTRONICS ENGINEERING') {
          code = code.replace(/^(IT|CS|GE|MA|PH|CY|BE)/, 'EE');
          name = name
            .replace('Full Stack Web Development', 'Power Electronics & Drives')
            .replace('Data Structures and Algorithms', 'Electric Circuits')
            .replace('Matrices and Calculus', 'Engineering Mathematics I')
            .replace('Operating Systems', 'Control Systems')
            .replace('Embedded Systems and IoT', 'Electrical Machines');
        } else if (dept === 'MECHANICAL ENGINEERING') {
          code = code.replace(/^(IT|CS|GE|MA|PH|CY|BE)/, 'ME');
          name = name
            .replace('Full Stack Web Development', 'Thermodynamics')
            .replace('Data Structures and Algorithms', 'Fluid Mechanics')
            .replace('Matrices and Calculus', 'Engineering Mathematics I')
            .replace('Operating Systems', 'Kinematics of Machinery')
            .replace('Embedded Systems and IoT', 'CAD/CAM Laboratory');
        } else if (dept === 'CIVIL ENGINEERING') {
          code = code.replace(/^(IT|CS|GE|MA|PH|CY|BE)/, 'CE');
          name = name
            .replace('Full Stack Web Development', 'Structural Analysis')
            .replace('Data Structures and Algorithms', 'Surveying & Levelling')
            .replace('Matrices and Calculus', 'Engineering Mathematics I')
            .replace('Operating Systems', 'Soil Mechanics')
            .replace('Embedded Systems and IoT', 'Concrete Technology Lab');
        }

        COURSES_DATA.push({
          department: dept,
          year,
          semester: sem,
          code,
          name,
          full: `${code} - ${name}`,
          type: t.type,
          defaultInstructor: dept === 'INFORMATION TECHNOLOGY' ? t.defaultInstructor : undefined,
          idNo: dept === 'INFORMATION TECHNOLOGY' ? t.idNo : undefined
        });
      });
    });
  });
});

export const CLASS_ASSIGNED_OPTIONS = [
  'II YEAR',
  'III YEAR',
  'IV YEAR',
  'I YEAR',
  'I YEAR (Sem 1)',
  'I YEAR (Sem 2)',
  'II YEAR (Sem 3)',
  'II YEAR (Sem 4)',
  'III YEAR (Sem 5)',
  'III YEAR (Sem 6)',
  'IV YEAR (Sem 7)',
  'IV YEAR (Sem 8)'
];

export const WORK_PLAN_DEFAULT_ITEMS = [
  { sno: 1, particulars: 'Certificate / VAC course', requirement: 'Min. 1 per Semester (UG & PG)', conducted: '', to_be_conducted: '' },
  { sno: 2, particulars: 'Participation in certificate course', requirement: 'Above 50%', conducted: '', to_be_conducted: '' },
  { sno: 3, particulars: 'Participation in internship', requirement: 'Above 50%', conducted: '', to_be_conducted: '' },
  { sno: 4, particulars: 'Participation in IPT', requirement: 'Above 65%', conducted: '', to_be_conducted: '' },
  { sno: 5, particulars: 'Industrial visit', requirement: 'Min. 1 per ACY (I & II Year only)', conducted: '', to_be_conducted: '' },
  { sno: 6, particulars: 'Student centric activities (Webinar/Workshop/Hands-on)', requirement: 'Min. 1 activity per month (each subject)', conducted: '', to_be_conducted: '' },
  { sno: 7, particulars: '24 hours workshop', requirement: '3 per semester (UG), 1 per sem (PG)', conducted: '', to_be_conducted: '' },
  { sno: 8, particulars: 'Symposium / Conference', requirement: 'Min. 1 per ACY', conducted: '', to_be_conducted: '' },
  { sno: 9, particulars: 'Project expo', requirement: 'Min. 1 per ACY', conducted: '', to_be_conducted: '' },
  { sno: 10, particulars: 'Technical competitions (Quiz/Paper Presentation)', requirement: 'Min. 5 per semester', conducted: '', to_be_conducted: '' },
  { sno: 11, particulars: 'Exam results (Internal & External)', requirement: '75% per dept, 85% per subject, 4 rank holders', conducted: '', to_be_conducted: '' },
  { sno: 12, particulars: 'Publication (Journal & Conference)', requirement: 'Min. 1 per Sem / Faculty', conducted: '', to_be_conducted: '' },
  { sno: 13, particulars: 'MoU with industry', requirement: 'Min. 2 (New MoUs), 2 activities per MoU', conducted: '', to_be_conducted: '' },
  { sno: 14, particulars: 'Placement', requirement: 'Above 80%', conducted: '', to_be_conducted: '' },
  { sno: 15, particulars: 'Staff participation (Workshop/FDP)', requirement: 'Min. 2 per ACY by each faculty (>5 days)', conducted: '', to_be_conducted: '' },
  { sno: 16, particulars: 'NPTEL courses', requirement: 'One per faculty / 3 students per mentor', conducted: '', to_be_conducted: '' },
  { sno: 17, particulars: 'Students participation in events in reputed institutions', requirement: '10 per class per semester', conducted: '', to_be_conducted: '' }
];
