export interface SubjectItem {
  code: string;
  name: string;
  full: string;
}

export interface SemesterGroup {
  year: string;
  semester: string;
  subjects: SubjectItem[];
}

export const ACADEMIC_CURRICULUM: SemesterGroup[] = [
  {
    year: '1st Year',
    semester: 'Semester 1',
    subjects: [
      { code: 'MA3151', name: 'Matrices and Calculus', full: 'MA3151 - Matrices and Calculus' },
      { code: 'PH3151', name: 'Engineering Physics', full: 'PH3151 - Engineering Physics' },
      { code: 'CY3151', name: 'Engineering Chemistry', full: 'CY3151 - Engineering Chemistry' },
      { code: 'GE3151', name: 'Problem Solving and Python Programming', full: 'GE3151 - Problem Solving and Python Programming' },
      { code: 'HS3152', name: 'Heritage of Tamils', full: 'HS3152 - Heritage of Tamils' }
    ]
  },
  {
    year: '1st Year',
    semester: 'Semester 2',
    subjects: [
      { code: 'HS3252', name: 'Professional English – II', full: 'HS3252 - Professional English – II' },
      { code: 'MA3251', name: 'Statistics and Numerical Methods', full: 'MA3251 - Statistics and Numerical Methods' },
      { code: 'PH3256', name: 'Physics for Information Science', full: 'PH3256 - Physics for Information Science' },
      { code: 'BE3251', name: 'Basic Electrical and Electronics Engineering', full: 'BE3251 - Basic Electrical and Electronics Engineering' },
      { code: 'CS3251', name: 'Programming in C', full: 'CS3251 - Programming in C' }
    ]
  },
  {
    year: '2nd Year',
    semester: 'Semester 3',
    subjects: [
      { code: 'MA3354', name: 'Discrete Mathematics', full: 'MA3354 - Discrete Mathematics' },
      { code: 'CS3351', name: 'Digital Principles and Computer Organization', full: 'CS3351 - Digital Principles and Computer Organization' },
      { code: 'CS3352', name: 'Foundations of Data Science', full: 'CS3352 - Foundations of Data Science' },
      { code: 'CS3391', name: 'Object Oriented Programming', full: 'CS3391 - Object Oriented Programming' },
      { code: 'CS3291', name: 'Data Structures and Algorithms', full: 'CS3291 - Data Structures and Algorithms' },
      { code: 'MA25C02', name: 'Discrete Mathematics', full: 'MA25C02 - Discrete Mathematics' },
      { code: 'IT25301', name: 'Data Structures and Algorithms in C', full: 'IT25301 - Data Structures and Algorithms in C' },
      { code: 'IT25302', name: 'Computer Organization & Architecture', full: 'IT25302 - Computer Organization & Architecture' },
      { code: 'CS25303', name: 'Operating Systems (T+L)', full: 'CS25303 - Operating Systems (T+L)' },
      { code: 'CS25305', name: 'Object Oriented Software Engineering', full: 'CS25305 - Object Oriented Software Engineering' },
      { code: 'CS25302', name: 'Java Programming', full: 'CS25302 - Java Programming' },
      { code: 'IT25303', name: 'Data Structures and Algorithms in C Laboratory', full: 'IT25303 - Data Structures and Algorithms in C Laboratory' },
      { code: 'CS25307', name: 'Java Programming Laboratory', full: 'CS25307 - Java Programming Laboratory' }
    ]
  },
  {
    year: '2nd Year',
    semester: 'Semester 4',
    subjects: [
      { code: 'CS3452', name: 'Theory of Computation', full: 'CS3452 - Theory of Computation' },
      { code: 'CS3491', name: 'Artificial Intelligence and Machine Learning', full: 'CS3491 - Artificial Intelligence and Machine Learning' },
      { code: 'CS3492', name: 'Database Management Systems', full: 'CS3492 - Database Management Systems' },
      { code: 'CS3451', name: 'Introduction to Operating Systems', full: 'CS3451 - Introduction to Operating Systems' },
      { code: 'GE3451', name: 'Environmental Sciences and Sustainability', full: 'GE3451 - Environmental Sciences and Sustainability' },
      { code: 'CS3481', name: 'Operating Systems Laboratory', full: 'CS3481 - Operating Systems Laboratory' },
      { code: 'CS3482', name: 'Database Management Systems Laboratory', full: 'CS3482 - Database Management Systems Laboratory' },
      { code: 'IT3401', name: 'Web Essentials', full: 'IT3401 - Web Essentials' }
    ]
  },
  {
    year: '3rd Year',
    semester: 'Semester 5',
    subjects: [
      { code: 'CS3591', name: 'Computer Networks (T+L)', full: 'CS3591 - Computer Networks (T+L)' },
      { code: 'CS3551', name: 'Distributed Computing', full: 'CS3551 - Distributed Computing' },
      { code: 'CS3691', name: 'Embedded Systems and IoT (T+L)', full: 'CS3691 - Embedded Systems and IoT (T+L)' },
      { code: 'IT3501', name: 'Full Stack Web Development', full: 'IT3501 - Full Stack Web Development' },
      { code: 'IT3511', name: 'Full Stack Web Development Laboratory', full: 'IT3511 - Full Stack Web Development Laboratory' },
      { code: 'MX3084', name: 'Disaster Risk Reduction and Management', full: 'MX3084 - Disaster Risk Reduction and Management' },
      { code: 'CCS361', name: 'Robotic Process Automation (T+L)', full: 'CCS361 - Robotic Process Automation (T+L)' },
      { code: 'CCS335', name: 'Cloud Computing (T+L)', full: 'CCS335 - Cloud Computing (T+L)' }
    ]
  },
  {
    year: '4th Year',
    semester: 'Semester 7/8',
    subjects: [
      { code: 'GE3791', name: 'Human Values and Ethics', full: 'GE3791 - Human Values and Ethics' },
      { code: 'GE3751', name: 'Principles of Management', full: 'GE3751 - Principles of Management' },
      { code: 'AI3021', name: 'OE 2 IT in Agriculture System', full: 'AI3021 - OE 2 IT in Agriculture System' },
      { code: 'OME354', name: 'OE 3 Applied Design Thinking', full: 'OME354 - OE 3 Applied Design Thinking' },
      { code: 'CRA332', name: 'OE 4 Drone Technologies', full: 'CRA332 - OE 4 Drone Technologies' }
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

const SUBJECT_TEMPLATES: { [key: string]: { code: string, name: string }[] } = {
  'I YEAR_Semester 1': [
    { code: 'MA3151', name: 'Matrices and Calculus' },
    { code: 'PH3151', name: 'Engineering Physics' },
    { code: 'CY3151', name: 'Engineering Chemistry' },
    { code: 'GE3151', name: 'Problem Solving and Python Programming' },
    { code: 'HS3152', name: 'Heritage of Tamils' }
  ],
  'I YEAR_Semester 2': [
    { code: 'HS3252', name: 'Professional English – II' },
    { code: 'MA3251', name: 'Statistics and Numerical Methods' },
    { code: 'PH3256', name: 'Physics for Information Science' },
    { code: 'BE3251', name: 'Basic Electrical and Electronics Engineering' },
    { code: 'CS3251', name: 'Programming in C' }
  ],
  'II YEAR_Semester 3': [
    { code: 'MA3354', name: 'Discrete Mathematics' },
    { code: 'CS3351', name: 'Digital Principles and Computer Organization' },
    { code: 'CS3352', name: 'Foundations of Data Science' },
    { code: 'CS3391', name: 'Object Oriented Programming' },
    { code: 'CS3291', name: 'Data Structures and Algorithms' }
  ],
  'II YEAR_Semester 4': [
    { code: 'CS3452', name: 'Theory of Computation' },
    { code: 'CS3491', name: 'Artificial Intelligence and Machine Learning' },
    { code: 'CS3492', name: 'Database Management Systems' },
    { code: 'CS3451', name: 'Introduction to Operating Systems' },
    { code: 'GE3451', name: 'Environmental Sciences and Sustainability' }
  ],
  'III YEAR_Semester 5': [
    { code: 'CS3591', name: 'Computer Networks (T+L)' },
    { code: 'CS3551', name: 'Distributed Computing' },
    { code: 'CS3691', name: 'Embedded Systems and IoT (T+L)' },
    { code: 'IT3501', name: 'Full Stack Web Development' },
    { code: 'IT3511', name: 'Full Stack Web Development Laboratory' }
  ],
  'III YEAR_Semester 6': [
    { code: 'CS3692', name: 'Software Engineering and Agile Methodologies' },
    { code: 'IT3601', name: 'Mobile Communication and Application Development' },
    { code: 'CCS343', name: 'Mobile Application Development Laboratory' },
    { code: 'CCS356', name: 'Software Testing and Quality Assurance' }
  ],
  'IV YEAR_Semester 7': [
    { code: 'GE3791', name: 'Human Values and Ethics' },
    { code: 'GE3751', name: 'Principles of Management' },
    { code: 'AI3021', name: 'OE 2 IT in Agriculture System' },
    { code: 'IT3701', name: 'Advanced Web Technology' }
  ],
  'IV YEAR_Semester 8': [
    { code: 'IT3811', name: 'Project Work Phase II' },
    { code: 'OME354', name: 'OE 3 Applied Design Thinking' },
    { code: 'CRA332', name: 'OE 4 Drone Technologies' }
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
          full: `${code} - ${name}`
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
  { sno: 1, particulars: 'Certificate / VAC course', requirement: 'Min. 1 per Semester (UG & PG)', conducted: '0', to_be_conducted: '1 per class' },
  { sno: 2, particulars: 'Participation in certificate course', requirement: 'Above 50%', conducted: 'Ongoing', to_be_conducted: 'Target >50%' },
  { sno: 3, particulars: 'Participation in internship', requirement: 'Above 50%', conducted: 'Ongoing', to_be_conducted: 'Target >50%' },
  { sno: 4, particulars: 'Participation in IPT', requirement: 'Above 65%', conducted: 'Ongoing', to_be_conducted: 'Target >65%' },
  { sno: 5, particulars: 'Industrial visit', requirement: 'Min. 1 per ACY (I & II Year only)', conducted: '0', to_be_conducted: 'Planned' },
  { sno: 6, particulars: 'Student centric activities (Webinar/Workshop/Hands-on)', requirement: 'Min. 1 activity per month (each subject)', conducted: 'Conducted', to_be_conducted: '1 per subject' },
  { sno: 7, particulars: '24 hours workshop', requirement: '3 per semester (UG), 1 per sem (PG)', conducted: '1 Conducted', to_be_conducted: '2 Planned' },
  { sno: 8, particulars: 'Symposium / Conference', requirement: 'Min. 1 per ACY', conducted: '0', to_be_conducted: 'Planned' },
  { sno: 9, particulars: 'Project expo', requirement: 'Min. 1 per ACY', conducted: '0', to_be_conducted: 'Planned' },
  { sno: 10, particulars: 'Technical competitions (Quiz/Paper Presentation)', requirement: 'Min. 5 per semester', conducted: 'Conducted', to_be_conducted: '5 Planned' },
  { sno: 11, particulars: 'Exam results (Internal & External)', requirement: '75% per dept, 85% per subject, 4 rank holders', conducted: 'On Track', to_be_conducted: 'Target 75%+' },
  { sno: 12, particulars: 'Publication (Journal & Conference)', requirement: 'Min. 1 per Sem / Faculty', conducted: 'In Progress', to_be_conducted: '1 Journal, 1 Conf' },
  { sno: 13, particulars: 'MoU with industry', requirement: 'Min. 2 (New MoUs), 2 activities per MoU', conducted: 'Active', to_be_conducted: '2 Activities' },
  { sno: 14, particulars: 'Placement', requirement: 'Above 80%', conducted: 'On Track', to_be_conducted: 'Target >80%' },
  { sno: 15, particulars: 'Staff participation (Workshop/FDP)', requirement: 'Min. 2 per ACY by each faculty (>5 days)', conducted: '2/2 Completed', to_be_conducted: 'Planned' },
  { sno: 16, particulars: 'NPTEL courses', requirement: 'One per faculty / 3 students per mentor', conducted: 'Active (Faculty: 4)', to_be_conducted: 'Mentor assigned' },
  { sno: 17, particulars: 'Students participation in events in reputed institutions', requirement: '10 per class per semester', conducted: 'Active', to_be_conducted: '10 per class' }
];
