import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional Supabase configuration (when live credentials are provided in .env)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase = null;
let sqliteDb = null;
let sqlite3 = null;
let isSupabaseActive = false;

export function getIsSupabaseActive() {
  return isSupabaseActive;
}

export function getSupabase() {
  return supabase;
}

// -------------------------------------------------------------
// SQLite Schema Tables
// -------------------------------------------------------------
const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department_name TEXT UNIQUE NOT NULL,
    hod_id INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
    staff_id TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    department_id INTEGER,
    designation TEXT,
    phone TEXT,
    profile_photo TEXT,
    qualification TEXT,
    specialization TEXT,
    date_of_joining TEXT,
    academic_year TEXT,
    semester TEXT,
    supabase_uid TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS academic_years (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year_name TEXT UNIQUE NOT NULL,
    active INTEGER DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER NOT NULL,
    report_type TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    week_number INTEGER,
    month TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    submitted_at DATETIME,
    approved_at DATETIME,
    reviewed_by INTEGER,
    review_comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS teaching_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    subject_name TEXT NOT NULL,
    class_assigned TEXT NOT NULL,
    course_type TEXT DEFAULT 'Theory',
    instructor_name TEXT,
    classes_taken INTEGER DEFAULT 0,
    classes_cancelled INTEGER DEFAULT 0,
    classes_rescheduled INTEGER DEFAULT 0,
    teaching_hours TEXT,
    syllabus_planned TEXT,
    syllabus_completed TEXT,
    syllabus_pct REAL DEFAULT 0.0,
    current_unit TEXT,
    pending_units TEXT,
    pending_reason TEXT,
    lesson_plan_status TEXT,
    teaching_methods TEXT,
    ict_tools TEXT,
    additional_classes INTEGER DEFAULT 0,
    extra_hours INTEGER DEFAULT 0,
    exp_completed TEXT,
    exp_remaining TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS student_attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    class_name TEXT NOT NULL,
    total_students INTEGER DEFAULT 0,
    avg_attendance_pct REAL DEFAULT 0.0,
    students_below_75 INTEGER DEFAULT 0,
    low_attendance_students TEXT,
    attendance_followup TEXT,
    class_average_mark REAL DEFAULT 0.0,
    highest_mark REAL DEFAULT 0.0,
    lowest_mark REAL DEFAULT 0.0,
    slow_learners TEXT,
    advanced_learners TEXT,
    performance_analysis TEXT,
    improvement_observed TEXT,
    counselling_provided TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    assessment_name TEXT NOT NULL,
    given_date TEXT,
    submission_count INTEGER DEFAULT 0,
    evaluation_completed INTEGER DEFAULT 0,
    marks_uploaded INTEGER DEFAULT 0,
    result_analysis_completed INTEGER DEFAULT 0,
    co_wise_performance TEXT,
    difficult_topics TEXT,
    corrective_action TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS remedial_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    class_name TEXT NOT NULL,
    date_conducted TEXT,
    students_attended INTEGER DEFAULT 0,
    topics_covered TEXT,
    slow_learner_support TEXT,
    doubt_clearing TEXT,
    extra_coaching TEXT,
    individual_support TEXT,
    parent_comm TEXT,
    counselling TEXT,
    improvement_remarks TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS mentoring (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    mentored_count INTEGER DEFAULT 0,
    meeting_date TEXT,
    individual_counselling TEXT,
    academic_issues TEXT,
    attendance_issues TEXT,
    career_guidance TEXT,
    parent_interaction TEXT,
    special_attention_students TEXT,
    followup_action TEXT,
    mentoring_outcome TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS project_guidance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    project_title TEXT NOT NULL,
    students_guided TEXT,
    review_conducted TEXT,
    review_number INTEGER,
    progress_pct REAL DEFAULT 0.0,
    technical_guidance TEXT,
    documentation_guidance TEXT,
    issues_identified TEXT,
    corrective_suggestions TEXT,
    completion_status TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS department_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    meetings_attended INTEGER DEFAULT 0,
    meetings_conducted INTEGER DEFAULT 0,
    academic_planning TEXT,
    timetable_prep TEXT,
    workload_prep TEXT,
    lab_maintenance TEXT,
    lab_equipment_verification TEXT,
    documentation TEXT,
    accreditation_work TEXT,
    event_coordination TEXT,
    committee_activities TEXT,
    exam_cell TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    event_name TEXT NOT NULL,
    event_date TEXT,
    event_type TEXT,
    role TEXT,
    students_participated INTEGER DEFAULT 0,
    outcome TEXT,
    certificates TEXT,
    description TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS fdp_training (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    program_type TEXT NOT NULL,
    program_title TEXT NOT NULL,
    organizing_institution TEXT,
    start_date TEXT,
    duration TEXT,
    mode TEXT,
    role TEXT,
    certificate_available INTEGER DEFAULT 0,
    skills_gained TEXT,
    application_in_teaching TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS research_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    work_done TEXT,
    journal_paper TEXT,
    conference_paper TEXT,
    publication_status TEXT,
    patent TEXT,
    book TEXT,
    book_chapter TEXT,
    research_proposal TEXT,
    funded_project TEXT,
    collaboration TEXT,
    scopus_wos INTEGER DEFAULT 0,
    citation_count INTEGER DEFAULT 0,
    progress_remarks TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS professional_development (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    technical_skills TEXT,
    tools_learned TEXT,
    online_courses TEXT,
    certifications TEXT,
    platform TEXT,
    duration TEXT,
    skill_applied TEXT,
    professional_membership TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    achievement_type TEXT NOT NULL,
    achievement_title TEXT NOT NULL,
    description TEXT,
    date_received TEXT,
    level TEXT,
    category TEXT,
    recognition TEXT,
    document_path TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS administrative_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    exam_duty TEXT,
    invigilation_duty TEXT,
    valuation_duty TEXT,
    admission_work TEXT,
    scholarship_verification TEXT,
    student_data_verification TEXT,
    attendance_verification TEXT,
    university_work TEXT,
    documentation TEXT,
    committee_responsibility TEXT,
    other_duties TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS lab_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    laboratory_handled TEXT NOT NULL,
    classes_conducted INTEGER DEFAULT 0,
    equipment_checked TEXT,
    equipment_issues TEXT,
    software_installation TEXT,
    maintenance_work TEXT,
    new_equipment_req TEXT,
    safety_issues TEXT,
    suggestions TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    meeting_date TEXT,
    meeting_type TEXT,
    agenda TEXT,
    role TEXT,
    decisions_taken TEXT,
    action_items TEXT,
    action_completed TEXT,
    pending_action TEXT,
    remarks TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    academic_issues TEXT,
    student_issues TEXT,
    attendance_issues TEXT,
    infrastructure_issues TEXT,
    laboratory_issues TEXT,
    technical_issues TEXT,
    administrative_issues TEXT,
    time_management TEXT,
    other_challenges TEXT,
    action_taken TEXT,
    support_required TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS future_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    sno INTEGER,
    particulars TEXT,
    requirement TEXT,
    conducted TEXT,
    to_be_conducted TEXT,
    planned_classes INTEGER DEFAULT 0,
    target_syllabus_pct REAL DEFAULT 0.0,
    assignments_planned TEXT,
    internal_assessments TEXT,
    remedial_classes TEXT,
    mentoring_planned TEXT,
    events_planned TEXT,
    fdp_workshops TEXT,
    research_work TEXT,
    project_guidance TEXT,
    department_activities TEXT,
    target_to_achieve TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS additional_remarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    type TEXT DEFAULT 'General',
    year TEXT,
    date_day TEXT,
    submissions_total TEXT,
    remarks TEXT,
    action_taken TEXT,
    overall_summary TEXT,
    major_contributions TEXT,
    important_updates TEXT,
    suggestions TEXT,
    recommendations TEXT,
    support_required TEXT,
    additional_info TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS weekly_attendance_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    year TEXT NOT NULL,
    week_index INTEGER DEFAULT 1,
    week_label TEXT,
    week_start TEXT,
    week_end TEXT,
    attendance_pct REAL DEFAULT 0.0
  )`,
  `CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    actor_id INTEGER NOT NULL,
    actor_name TEXT NOT NULL,
    review_comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`
];

// -------------------------------------------------------------
// SQLite Helper Promises
// -------------------------------------------------------------
const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// -------------------------------------------------------------
// Database Initialization
// -------------------------------------------------------------
export async function initializeDatabase() {
  // 1. Initialize local SQLite database first to ensure storage is always ready
  try {
    if (!sqliteDb) {
      const sqlite3Module = await import('sqlite3');
      sqlite3 = sqlite3Module.default || sqlite3Module;
      const dbPath = path.resolve(process.env.VERCEL ? '/tmp/facultyreport.db' : path.join(__dirname, 'facultyreport.db'));
      sqliteDb = new sqlite3.Database(dbPath);
    }
    console.log('Database Mode: Initializing SQLite schema...');
    for (const tableSql of CREATE_TABLES) {
      await run(tableSql);
    }

    // Auto-migrate schema columns for existing SQLite databases
    const alterMigrations = [
      "ALTER TABLE teaching_activities ADD COLUMN course_type TEXT DEFAULT 'Theory'",
      "ALTER TABLE teaching_activities ADD COLUMN instructor_name TEXT",
      "ALTER TABLE teaching_activities ADD COLUMN classes_taken INTEGER DEFAULT 0",
      "ALTER TABLE teaching_activities ADD COLUMN classes_cancelled INTEGER DEFAULT 0",
      "ALTER TABLE teaching_activities ADD COLUMN classes_rescheduled INTEGER DEFAULT 0",
      "ALTER TABLE teaching_activities ADD COLUMN teaching_hours TEXT",
      "ALTER TABLE teaching_activities ADD COLUMN syllabus_planned TEXT",
      "ALTER TABLE teaching_activities ADD COLUMN syllabus_completed TEXT",
      "ALTER TABLE teaching_activities ADD COLUMN syllabus_pct REAL DEFAULT 0.0",
      "ALTER TABLE teaching_activities ADD COLUMN current_unit TEXT",
      "ALTER TABLE teaching_activities ADD COLUMN pending_units TEXT",
      "ALTER TABLE teaching_activities ADD COLUMN pending_reason TEXT",
      "ALTER TABLE teaching_activities ADD COLUMN lesson_plan_status TEXT",
      "ALTER TABLE teaching_activities ADD COLUMN teaching_methods TEXT",
      "ALTER TABLE teaching_activities ADD COLUMN ict_tools TEXT",
      "ALTER TABLE teaching_activities ADD COLUMN additional_classes INTEGER DEFAULT 0",
      "ALTER TABLE teaching_activities ADD COLUMN extra_hours INTEGER DEFAULT 0",
      "ALTER TABLE teaching_activities ADD COLUMN exp_completed TEXT",
      "ALTER TABLE teaching_activities ADD COLUMN exp_remaining TEXT"
    ];
    for (const sql of alterMigrations) {
      try { await run(sql); } catch (e) { }
    }

    // Seed demo data if users table is empty
    const userCount = await get('SELECT count(*) as count FROM users');
    const defaultPasswordHash = await bcrypt.hash('mzcet@1234', 10);

    if (userCount.count === 0) {
      console.log('Seeding initial departments, semesters and demo accounts...');

      // Seed departments
      const departments = [
        'Information Technology',
        'Computer Science & Engineering',
        'Electronics & Communication Engineering',
        'Electrical & Electronics Engineering',
        'Mechanical Engineering',
        'Civil Engineering'
      ];
      for (const name of departments) {
        await run('INSERT INTO departments (department_name) VALUES (?)', [name]);
      }

      // Seed academic years
      await run("INSERT INTO academic_years (year_name, active) VALUES (?, ?)", ['2025-2026', 1]);

      // Staff: id=1
      await run(
        `INSERT INTO users (email, password_hash, name, staff_id, role, department_id, designation, phone, qualification, specialization, date_of_joining, academic_year, semester) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['staff@mzcet.edu.in', defaultPasswordHash, 'Mrs. V. Brindha Devi', 'mzcet@it_coordinator', 'staff', 1, 'Assistant Professor', '9876543210', 'M.E., Ph.D.', 'Cloud Computing', '2018-06-15', '2025-2026', 'ODD']
      );

      // HOD: id=2
      await run(
        `INSERT INTO users (email, password_hash, name, staff_id, role, department_id, designation, phone, qualification, specialization, date_of_joining, academic_year, semester) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['hod.it@mzcet.edu.in', defaultPasswordHash, 'Dr. P. Rajkumar', 'mzcet@it_hod', 'hod', 1, 'Professor & Head', '9443212345', 'M.Tech., Ph.D.', 'Data Science', '2010-06-01', '2025-2026', 'ODD']
      );

      // Admin: id=3
      await run(
        `INSERT INTO users (email, password_hash, name, staff_id, role, designation) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['admin@mzcet.edu.in', defaultPasswordHash, 'MZCET Admin Portal', 'mzcet@admin', 'admin', 'System Administrator']
      );

      // Seed full MZCET IT Faculty Roster
      const facultySeeds = [
        { name: 'Dr. P. Rajkumar', staff_id: '601', email: 'rajkumar.p@mzcet.in', role: 'hod', designation: 'Professor & Head' },
        { name: 'Mrs. V. Brindha Devi', staff_id: '1909', email: 'brindhadevi.v@mzcet.in', role: 'staff', designation: 'Assistant Professor' },
        { name: 'Mrs. R. Saraswathi', staff_id: '2142', email: 'saraswathi.r@mzcet.in', role: 'staff', designation: 'Assistant Professor (V Sem Co-ordinator)' },
        { name: 'Mrs. R. Sangeetha', staff_id: '2070', email: 'sangeetha.r@mzcet.in', role: 'staff', designation: 'Assistant Professor (III Sem Co-ordinator)' },
        { name: 'Mrs. A. Arifa Banu', staff_id: '1970', email: 'arifabanu.a@mzcet.in', role: 'staff', designation: 'Assistant Professor (VII Sem Co-ordinator)' },
        { name: 'Mrs. L. Shalini', staff_id: '2025', email: 'shalini.l@mzcet.in', role: 'staff', designation: 'Assistant Professor' },
        { name: 'Ms. Ramaprabha', staff_id: '1609', email: 'ramaprabha@mzcet.in', role: 'staff', designation: 'Assistant Professor' },
        { name: 'Dr. Sabeena', staff_id: '2141', email: 'sabeena@mzcet.in', role: 'staff', designation: 'Assistant Professor' },
        { name: 'Dr. A. Nivedha', staff_id: '2100', email: 'nivedha.a@mzcet.in', role: 'staff', designation: 'Assistant Professor' },
        { name: 'Mr. K. Muthuraman', staff_id: '1897', email: 'muthuraman.k@mzcet.in', role: 'staff', designation: 'Assistant Professor' },
        { name: 'Dr. Pavalamalar', staff_id: 'PAV', email: 'pavalamalar@mzcet.in', role: 'staff', designation: 'Assistant Professor (I Sem Co-ordinator)' },
        { name: 'Dr. Thirumamagal', staff_id: '2161', email: 'thirumamagal@mzcet.in', role: 'staff', designation: 'Assistant Professor' },
        { name: 'Mrs. Jenifer', staff_id: '2162', email: 'jenifer@mzcet.in', role: 'staff', designation: 'Assistant Professor' },
        { name: 'Mrs. Annu Rose', staff_id: 'ANNU', email: 'annurose@mzcet.in', role: 'staff', designation: 'Assistant Professor' },
        { name: 'Ms. Meenakshi', staff_id: 'MEENA', email: 'meenakshi@mzcet.in', role: 'staff', designation: 'Assistant Professor' },
        { name: 'Mrs. S. Ammu', staff_id: '1295', email: 'ammu.s@mzcet.in', role: 'staff', designation: 'Assistant Professor' },
        { name: 'Ms. S. Nivetha', staff_id: '2067', email: 'nivetha.s@mzcet.in', role: 'staff', designation: 'Assistant Professor' }
      ];

      for (const f of facultySeeds) {
        await run(
          `INSERT OR IGNORE INTO users (email, password_hash, name, staff_id, role, department_id, designation, academic_year, semester) 
           VALUES (?, ?, ?, ?, ?, 1, ?, '2026-2027', 'ODD')`,
          [f.email, defaultPasswordHash, f.name, f.staff_id, f.role, f.designation]
        );
      }

      await run('UPDATE departments SET hod_id = 2 WHERE id = 1');
      console.log('Database Seeding: Local SQLite seeded successfully with IT Faculty Roster!');
    } else {
      // Ensure all seed accounts have the correct valid password hash for mzcet@1234
      await run("UPDATE users SET password_hash = ? WHERE email = 'staff@mzcet.edu.in' OR staff_id = 'mzcet@it_coordinator'", [defaultPasswordHash]);
      await run("UPDATE users SET password_hash = ? WHERE email = 'hod.it@mzcet.edu.in' OR staff_id = 'mzcet@it_hod'", [defaultPasswordHash]);
      await run("UPDATE users SET password_hash = ? WHERE email = 'admin@mzcet.edu.in' OR staff_id = 'mzcet@admin'", [defaultPasswordHash]);
    }
  } catch (err) {
    console.warn('SQLite initialization error:', err.message);
  }

  // 2. Validate Supabase connection with a quick timeout (2.5 seconds)
  if (supabaseUrl && supabaseKey) {
    try {
      const testClient = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase ping timed out')), 2500)
      );
      const queryPromise = testClient.from('users').select('id').limit(1);
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      if (!error) {
        supabase = testClient;
        isSupabaseActive = true;
        console.log('Database Mode: Supabase PostgreSQL active and verified.');
        return;
      } else {
        console.warn('Supabase not available (' + (error.message || error) + '), using local SQLite database.');
        isSupabaseActive = false;
        supabase = null;
      }
    } catch (err) {
      console.warn('Supabase unreachable (' + err.message + '), using local SQLite database.');
      isSupabaseActive = false;
      supabase = null;
    }
  }
}

// -------------------------------------------------------------
// Unified Database Interface (Repository Wrapper)
// -------------------------------------------------------------
export const db = {
  // Users CRUD
  getUserByEmail: async (identifier) => {
    if (!identifier) return null;
    const clean = String(identifier).trim();
    const lower = clean.toLowerCase();

    if (isSupabaseActive && supabase) {
      try {
        // 1. Try matching by email
        let { data, error } = await supabase.from('users')
          .select('*, departments!users_department_id_fkey(department_name)')
          .ilike('email', clean)
          .maybeSingle();

        // 2. If not found by email, try matching by staff_id
        if (!data) {
          const res = await supabase.from('users')
            .select('*, departments!users_department_id_fkey(department_name)')
            .ilike('staff_id', clean)
            .maybeSingle();
          data = res.data;
        }

        if (data) {
          if (data.departments) {
            data.department_name = data.departments.department_name;
          }
          return data;
        }
      } catch (err) {
        console.warn('Supabase getUserByEmail error, trying local SQLite fallback:', err.message);
      }
    }

    try {
      const sql = `
        SELECT u.*, d.department_name 
        FROM users u 
        LEFT JOIN departments d ON u.department_id = d.id 
        WHERE LOWER(u.email) = ? 
           OR LOWER(u.staff_id) = ?
           OR (u.role = 'staff' AND (? = 'staff' OR ? = 'staff@mzcet.edu.in' OR ? = 'mzcet@it_coordinator'))
           OR (u.role = 'hod' AND (? = 'hod' OR ? = 'hod.it@mzcet.edu.in' OR ? = 'mzcet@it_hod'))
           OR (u.role = 'admin' AND (? = 'admin' OR ? = 'admin@mzcet.edu.in' OR ? = 'mzcet@admin'))
           OR LOWER(u.email) = ?
        LIMIT 1
      `;
      const domainSuffix = lower.includes('@') ? lower : `${lower}@mzcet.edu.in`;
      const u = await get(sql, [
        lower, 
        lower, 
        lower, lower, lower, 
        lower, lower, lower, 
        lower, lower, lower, 
        domainSuffix
      ]);
      return u || null;
    } catch (err) {
      console.error('SQLite getUserByEmail error:', err.message);
      return null;
    }
  },

  getUserById: async (id) => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('users').select('*, departments!users_department_id_fkey(department_name)').eq('id', id).maybeSingle();
      if (error) throw error;
      if (data && data.departments) {
        data.department_name = data.departments.department_name;
      }
      return data;
    } else {
      const u = await get('SELECT u.*, d.department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.id = ?', [id]);
      return u || null;
    }
  },

  getUserBySupabaseUid: async (uid) => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('users').select('*, departments!users_department_id_fkey(department_name)').eq('supabase_uid', uid).maybeSingle();
      if (error) throw error;
      if (data && data.departments) {
        data.department_name = data.departments.department_name;
      }
      return data;
    } else {
      const u = await get('SELECT u.*, d.department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id WHERE u.supabase_uid = ?', [uid]);
      return u || null;
    }
  },

  createUser: async (userData) => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('users').insert([userData]).select().single();
      if (error) throw error;
      return data;
    } else {
      const keys = Object.keys(userData);
      const vals = Object.values(userData);
      const placeholders = keys.map(() => '?').join(',');
      const sql = `INSERT INTO users (${keys.join(',')}) VALUES (${placeholders})`;
      const result = await run(sql, vals);
      return { id: result.id, ...userData };
    }
  },

  updateUser: async (id, userData) => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('users').update(userData).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const keys = Object.keys(userData);
      const vals = Object.values(userData);
      const sets = keys.map(k => `${k} = ?`).join(',');
      const sql = `UPDATE users SET ${sets} WHERE id = ?`;
      await run(sql, [...vals, id]);
      return { id, ...userData };
    }
  },

  getDepartmentStaff: async (departmentId) => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('users').select('*').eq('department_id', departmentId).eq('role', 'staff');
      if (error) throw error;
      return data;
    } else {
      return await all('SELECT * FROM users WHERE department_id = ? AND role = ?', [departmentId, 'staff']);
    }
  },

  getAllUsers: async () => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('users').select('*, departments!users_department_id_fkey(department_name)');
      if (error) throw error;
      return data.map(u => ({ ...u, department_name: u.departments?.department_name }));
    } else {
      return await all('SELECT u.*, d.department_name FROM users u LEFT JOIN departments d ON u.department_id = d.id');
    }
  },

  getDepartments: async () => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('departments').select('*, users!fk_departments_hod(name)');
      if (error) throw error;
      return data.map(d => ({
        ...d,
        hod_name: (Array.isArray(d.users) ? d.users[0]?.name : d.users?.name) || null
      }));
    } else {
      return await all('SELECT d.*, u.name as hod_name FROM departments d LEFT JOIN users u ON d.hod_id = u.id');
    }
  },

  getDepartmentById: async (id) => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('departments').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    } else {
      return await get('SELECT * FROM departments WHERE id = ?', [id]);
    }
  },

  createDepartment: async (name) => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('departments').insert([{ department_name: name }]).select().single();
      if (error) throw error;
      return data;
    } else {
      const res = await run('INSERT INTO departments (department_name) VALUES (?)', [name]);
      return { id: res.id, department_name: name };
    }
  },

  updateDepartment: async (id, departmentName, hodId) => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('departments').update({ department_name: departmentName, hod_id: hodId }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      await run('UPDATE departments SET department_name = ?, hod_id = ? WHERE id = ?', [departmentName, hodId, id]);
      return { id, department_name: departmentName, hod_id: hodId };
    }
  },

  deleteDepartment: async (id) => {
    if (isSupabaseActive) {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
    } else {
      await run('DELETE FROM departments WHERE id = ?', [id]);
    }
  },

  // Academic Years
  getAcademicYears: async () => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('academic_years').select('*');
      if (error) throw error;
      return data;
    } else {
      return await all('SELECT * FROM academic_years');
    }
  },

  createAcademicYear: async (yearName, active) => {
    if (isSupabaseActive) {
      if (active) {
        await supabase.from('academic_years').update({ active: false }).neq('id', 0);
      }
      const { data, error } = await supabase.from('academic_years').insert([{ year_name: yearName, active }]).select().single();
      if (error) throw error;
      return data;
    } else {
      if (active) {
        await run('UPDATE academic_years SET active = 0');
      }
      const res = await run('INSERT INTO academic_years (year_name, active) VALUES (?, ?)', [yearName, active ? 1 : 0]);
      return { id: res.id, year_name: yearName, active: active ? 1 : 0 };
    }
  },

  setAcademicYearActive: async (id) => {
    if (isSupabaseActive) {
      await supabase.from('academic_years').update({ active: false }).neq('id', id);
      const { data, error } = await supabase.from('academic_years').update({ active: true }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      await run('UPDATE academic_years SET active = 0');
      await run('UPDATE academic_years SET active = 1 WHERE id = ?', [id]);
      return { id, active: 1 };
    }
  },

  deleteAcademicYear: async (id) => {
    if (isSupabaseActive) {
      const { error } = await supabase.from('academic_years').delete().eq('id', id);
      if (error) throw error;
    } else {
      await run('DELETE FROM academic_years WHERE id = ?', [id]);
    }
  },

  // Duplicate Check
  getDuplicateReportCount: async (staffId, reportType, academicYear, semester, month, weekNumber, excludeId = null) => {
    if (isSupabaseActive) {
      let query = supabase.from('reports')
        .select('id', { count: 'exact' })
        .eq('staff_id', staffId)
        .eq('report_type', reportType)
        .eq('academic_year', academicYear)
        .eq('semester', semester)
        .eq('month', month);

      if (weekNumber !== undefined && weekNumber !== null) {
        query = query.eq('week_number', weekNumber);
      }
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      const { count, error } = await query;
      if (error) throw error;
      return count;
    } else {
      let sql = 'SELECT count(*) as count FROM reports WHERE staff_id = ? AND report_type = ? AND academic_year = ? AND semester = ? AND month = ?';
      const params = [staffId, reportType, academicYear, semester, month];
      if (weekNumber !== undefined && weekNumber !== null) {
        sql += ' AND week_number = ?';
        params.push(weekNumber);
      } else {
        sql += ' AND week_number IS NULL';
      }
      if (excludeId) {
        sql += ' AND id != ?';
        params.push(excludeId);
      }
      const res = await get(sql, params);
      return res ? res.count : 0;
    }
  },

  // Helper to query valid columns for a table
  getTableColumns: async (tableName) => {
    if (isSupabaseActive) return null;
    try {
      const info = await all(`PRAGMA table_info(${tableName})`);
      if (!info || info.length === 0) return null;
      return new Set(info.map(col => col.name));
    } catch (e) {
      return null;
    }
  },

  // Unified Reports Creation & CRUD (Handles all sub tables)
  createReport: async (reportMeta, sectionData) => {
    if (isSupabaseActive) {
      const { data: report, error: reportErr } = await supabase.from('reports').insert([reportMeta]).select().single();
      if (reportErr) throw reportErr;

      const reportId = report.id;
      // Insert sub table rows
      for (const section of Object.keys(sectionData)) {
        const rows = sectionData[section];
        if (Array.isArray(rows) && rows.length > 0) {
          const rowsWithReportId = rows.map(r => {
            const clean = { ...r, report_id: reportId };
            delete clean.id;
            return clean;
          });
          const { error: subErr } = await supabase.from(section).insert(rowsWithReportId);
          if (subErr) throw subErr;
        }
      }
      return report;
    } else {
      const keys = Object.keys(reportMeta);
      const vals = Object.values(reportMeta);
      const placeholders = keys.map(() => '?').join(',');
      const sql = `INSERT INTO reports (${keys.join(',')}) VALUES (${placeholders})`;
      const result = await run(sql, vals);
      const reportId = result.id;

      for (const section of Object.keys(sectionData)) {
        const rows = sectionData[section];
        if (Array.isArray(rows) && rows.length > 0) {
          const validCols = await db.getTableColumns(section);
          for (const row of rows) {
            const rowClean = {};
            for (const [k, v] of Object.entries(row)) {
              if (k !== 'id' && k !== 'report_id' && (!validCols || validCols.has(k))) {
                rowClean[k] = v;
              }
            }
            const rowKeys = Object.keys(rowClean);
            const rowVals = Object.values(rowClean);
            if (rowKeys.length > 0) {
              const rowPlaceholders = rowKeys.map(() => '?').join(',');
              const rowSql = `INSERT INTO ${section} (report_id, ${rowKeys.join(',')}) VALUES (?, ${rowPlaceholders})`;
              await run(rowSql, [reportId, ...rowVals]);
            }
          }
        }
      }
      return { id: reportId, ...reportMeta };
    }
  },

  getReportById: async (id) => {
    if (isSupabaseActive) {
      const { data: report, error } = await supabase.from('reports')
        .select('*, users!reports_staff_id_fkey(name, staff_id, designation, phone, qualification, specialization, department_id, departments!users_department_id_fkey(department_name, users!fk_departments_hod(name)))')
        .eq('id', id).maybeSingle();
      if (error) throw error;
      if (!report) return null;

      // Extract join attributes
      const staff = report.users;
      report.staff_name = staff?.name;
      report.staff_code = staff?.staff_id;
      report.designation = staff?.designation;
      report.qualification = staff?.qualification;
      report.specialization = staff?.specialization;
      report.department_name = staff?.departments?.department_name;
      report.department_id = staff?.department_id;
      report.hod_name = staff?.departments?.users?.name || null; // HOD is the staff's supervisor

      // Get all child tables concurrently
      const subTables = [
        'teaching_activities', 'student_attendance', 'assessments', 'remedial_activities',
        'mentoring', 'project_guidance', 'department_activities', 'events', 'fdp_training',
        'research_activities', 'professional_development', 'achievements',
        'administrative_activities', 'lab_activities', 'meetings', 'issues', 'future_plans',
        'additional_remarks', 'weekly_attendance_summary', 'documents', 'audit_logs'
      ];
      const results = await Promise.all(
        subTables.map(table => supabase.from(table).select('*').eq('report_id', id))
      );
      subTables.forEach((table, idx) => {
        if (results[idx].error) throw results[idx].error;
        report[table] = results[idx].data || [];
      });
      return report;
    } else {
      const report = await get(
        `SELECT r.*, u.name as staff_name, u.staff_id as staff_code, u.designation, u.qualification, u.specialization,
                d.department_name, h.name as hod_name, u.department_id
         FROM reports r
         LEFT JOIN users u ON r.staff_id = u.id
         LEFT JOIN departments d ON u.department_id = d.id
         LEFT JOIN users h ON d.hod_id = h.id
         WHERE r.id = ?`,
        [id]
      );
      if (!report) return null;

      const subTables = [
        'teaching_activities', 'student_attendance', 'assessments', 'remedial_activities',
        'mentoring', 'project_guidance', 'department_activities', 'events', 'fdp_training',
        'research_activities', 'professional_development', 'achievements',
        'administrative_activities', 'lab_activities', 'meetings', 'issues', 'future_plans',
        'additional_remarks', 'weekly_attendance_summary', 'documents', 'audit_logs'
      ];
      const results = await Promise.all(
        subTables.map(table => all(`SELECT * FROM ${table} WHERE report_id = ?`, [id]))
      );
      subTables.forEach((table, idx) => {
        report[table] = results[idx] || [];
      });
      return report;
    }
  },

  updateReport: async (id, reportMeta, sectionData) => {
    if (isSupabaseActive) {
      const { error: updateErr } = await supabase.from('reports').update(reportMeta).eq('id', id);
      if (updateErr) throw updateErr;

      // Update sub tables concurrently
      const subTables = Object.keys(sectionData);
      await Promise.all(subTables.map(async (table) => {
        const { error: delErr } = await supabase.from(table).delete().eq('report_id', id);
        if (delErr) throw delErr;

        const rows = sectionData[table];
        if (Array.isArray(rows) && rows.length > 0) {
          const rowsWithReportId = rows.map(r => {
            const clean = { ...r, report_id: id };
            delete clean.id;
            return clean;
          });
          const { error: insErr } = await supabase.from(table).insert(rowsWithReportId);
          if (insErr) throw insErr;
        }
      }));
      return { id, ...reportMeta };
    } else {
      const keys = Object.keys(reportMeta);
      const vals = Object.values(reportMeta);
      const sets = keys.map(k => `${k} = ?`).join(',');
      await run(`UPDATE reports SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...vals, id]);

      const subTables = Object.keys(sectionData);
      for (const table of subTables) {
        await run(`DELETE FROM ${table} WHERE report_id = ?`, [id]);
        const rows = sectionData[table];
        if (Array.isArray(rows) && rows.length > 0) {
          const validCols = await db.getTableColumns(table);
          for (const row of rows) {
            const rowClean = {};
            for (const [k, v] of Object.entries(row)) {
              if (k !== 'id' && k !== 'report_id' && (!validCols || validCols.has(k))) {
                rowClean[k] = v;
              }
            }
            const rowKeys = Object.keys(rowClean);
            const rowVals = Object.values(rowClean);
            if (rowKeys.length > 0) {
              const rowPlaceholders = rowKeys.map(() => '?').join(',');
              const rowSql = `INSERT INTO ${table} (report_id, ${rowKeys.join(',')}) VALUES (?, ${rowPlaceholders})`;
              await run(rowSql, [id, ...rowVals]);
            }
          }
        }
      }
      return { id, ...reportMeta };
    }
  },

  deleteReport: async (id) => {
    const subTables = [
      'teaching_activities', 'student_attendance', 'assessments', 'remedial_activities',
      'mentoring', 'project_guidance', 'department_activities', 'events', 'fdp_training',
      'research_activities', 'professional_development', 'achievements',
      'administrative_activities', 'lab_activities', 'meetings', 'issues', 'future_plans',
      'additional_remarks', 'documents', 'audit_logs'
    ];
    if (isSupabaseActive) {
      await Promise.all(subTables.map(table => supabase.from(table).delete().eq('report_id', id)));
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw error;
    } else {
      await Promise.all(subTables.map(table => run(`DELETE FROM ${table} WHERE report_id = ?`, [id])));
      await run('DELETE FROM reports WHERE id = ?', [id]);
    }
  },

  getReports: async (filters = {}) => {
    if (isSupabaseActive) {
      let query = supabase.from('reports')
        .select('*, users!reports_staff_id_fkey(name, staff_id, designation, department_id, departments!users_department_id_fkey(department_name))', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters.staff_id) query = query.eq('staff_id', filters.staff_id);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.report_type) query = query.eq('report_type', filters.report_type);
      if (filters.academic_year) query = query.eq('academic_year', filters.academic_year);
      if (filters.semester) query = query.eq('semester', filters.semester);
      if (filters.month) query = query.eq('month', filters.month);
      if (filters.week_number) query = query.eq('week_number', filters.week_number);

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data.map(r => ({
        ...r,
        staff_name: r.users?.name,
        staff_code: r.users?.staff_id,
        department_name: r.users?.departments?.department_name,
        department_id: r.users?.department_id
      }));

      if (filters.department_id) {
        filtered = filtered.filter(r => r.department_id === Number(filters.department_id));
      }

      if (filters.search) {
        const srch = filters.search.toLowerCase();
        filtered = filtered.filter(r =>
          (r.staff_name && r.staff_name.toLowerCase().includes(srch)) ||
          (r.staff_code && r.staff_code.toLowerCase().includes(srch)) ||
          (r.department_name && r.department_name.toLowerCase().includes(srch)) ||
          r.month.toLowerCase().includes(srch)
        );
      }

      return filtered;
    } else {
      let sql = `SELECT r.*, u.name as staff_name, u.staff_id as staff_code, d.department_name, u.department_id
                 FROM reports r
                 LEFT JOIN users u ON r.staff_id = u.id
                 LEFT JOIN departments d ON u.department_id = d.id
                 WHERE 1=1`;
      const params = [];

      if (filters.staff_id) {
        sql += ' AND r.staff_id = ?';
        params.push(filters.staff_id);
      }
      if (filters.status) {
        sql += ' AND r.status = ?';
        params.push(filters.status);
      }
      if (filters.report_type) {
        sql += ' AND r.report_type = ?';
        params.push(filters.report_type);
      }
      if (filters.academic_year) {
        sql += ' AND r.academic_year = ?';
        params.push(filters.academic_year);
      }
      if (filters.semester) {
        sql += ' AND r.semester = ?';
        params.push(filters.semester);
      }
      if (filters.month) {
        sql += ' AND r.month = ?';
        params.push(filters.month);
      }
      if (filters.week_number) {
        sql += ' AND r.week_number = ?';
        params.push(filters.week_number);
      }
      if (filters.department_id) {
        sql += ' AND u.department_id = ?';
        params.push(filters.department_id);
      }
      if (filters.search) {
        sql += ' AND (u.name LIKE ? OR u.staff_id LIKE ? OR d.department_name LIKE ? OR r.month LIKE ?)';
        const srch = `%${filters.search}%`;
        params.push(srch, srch, srch, srch);
      }

      sql += ' ORDER BY r.created_at DESC';
      return await all(sql, params);
    }
  },

  updateReportStatus: async (id, status, reviewerId, reviewerName, comments) => {
    const timestamp = new Date().toISOString();
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('reports').update({
        status,
        reviewed_by: reviewerId,
        review_comments: comments,
        approved_at: status === 'Approved' ? timestamp : null,
        updated_at: timestamp
      }).eq('id', id).select().single();
      if (error) throw error;

      // Add audit log
      const logAction = status === 'Submitted' ? 'SUBMIT' : status === 'Approved' ? 'APPROVE' : status === 'Rejected' ? 'REJECT' : 'RESUBMIT';
      await supabase.from('audit_logs').insert([{
        report_id: id,
        action: logAction,
        actor_id: reviewerId,
        actor_name: reviewerName,
        review_comments: comments
      }]);

      return data;
    } else {
      const approvedAt = status === 'Approved' ? timestamp : null;
      await run(
        'UPDATE reports SET status = ?, reviewed_by = ?, review_comments = ?, approved_at = ?, updated_at = ? WHERE id = ?',
        [status, reviewerId, comments, approvedAt, timestamp, id]
      );

      const logAction = status === 'Submitted' ? 'SUBMIT' : status === 'Approved' ? 'APPROVE' : status === 'Rejected' ? 'REJECT' : 'RESUBMIT';
      await run(
        'INSERT INTO audit_logs (report_id, action, actor_id, actor_name, review_comments) VALUES (?, ?, ?, ?, ?)',
        [id, logAction, reviewerId, reviewerName, comments]
      );
      return { id, status, reviewed_by: reviewerId, review_comments: comments };
    }
  },

  // Document Upload Mapping
  addDocument: async (reportId, fileName, filePath, fileType) => {
    if (isSupabaseActive) {
      const { data, error } = await supabase.from('documents').insert([{
        report_id: reportId,
        file_name: fileName,
        file_path: filePath,
        file_type: fileType
      }]).select().single();
      if (error) throw error;
      return data;
    } else {
      const res = await run(
        'INSERT INTO documents (report_id, file_name, file_path, file_type) VALUES (?, ?, ?, ?)',
        [reportId, fileName, filePath, fileType]
      );
      return { id: res.id, report_id: reportId, file_name: fileName, file_path: filePath, file_type: fileType };
    }
  },

  deleteDocument: async (id) => {
    if (isSupabaseActive) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    } else {
      await run('DELETE FROM documents WHERE id = ?', [id]);
    }
  },

  // -------------------------------------------------------------
  // Dashboards & Analytics Calculations
  // -------------------------------------------------------------
  getStaffDashboardMetrics: async (staffId) => {
    if (isSupabaseActive) {
      const { data: reports, error } = await supabase.from('reports').select('status').eq('staff_id', staffId);
      if (error) throw error;

      return {
        total: reports.length,
        drafts: reports.filter(r => r.status === 'Draft').length,
        submitted: reports.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length,
        approved: reports.filter(r => r.status === 'Approved').length,
        rejected: reports.filter(r => r.status === 'Rejected').length
      };
    } else {
      const rows = await all('SELECT status FROM reports WHERE staff_id = ?', [staffId]);
      return {
        total: rows.length,
        drafts: rows.filter(r => r.status === 'Draft').length,
        submitted: rows.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length,
        approved: rows.filter(r => r.status === 'Approved').length,
        rejected: rows.filter(r => r.status === 'Rejected').length
      };
    }
  },

  getHodDashboardMetrics: async (departmentId) => {
    // 1. Get staff counts in department
    let staffCount = 0;
    let reports = [];

    if (isSupabaseActive) {
      const { data: users, error: uErr } = await supabase.from('users').select('id').eq('department_id', departmentId).eq('role', 'staff');
      if (uErr) throw uErr;
      staffCount = users.length;
      const staffIds = users.map(u => u.id);

      if (staffIds.length > 0) {
        const { data, error: rErr } = await supabase.from('reports').select('id, status, submitted_at, teaching_activities(syllabus_pct), student_attendance(avg_attendance_pct)').in('staff_id', staffIds);
        if (rErr) throw rErr;
        reports = data;
      }
    } else {
      const users = await all('SELECT id FROM users WHERE department_id = ? AND role = ?', [departmentId, 'staff']);
      staffCount = users.length;
      const staffIds = users.map(u => u.id);

      if (staffIds.length > 0) {
        const placeholders = staffIds.map(() => '?').join(',');
        reports = await all(`SELECT id, status, submitted_at FROM reports WHERE staff_id IN (${placeholders})`, staffIds);
        // Load nested values for average computations
        for (const r of reports) {
          r.teaching_activities = await all('SELECT syllabus_pct FROM teaching_activities WHERE report_id = ?', [r.id]);
          r.student_attendance = await all('SELECT avg_attendance_pct FROM student_attendance WHERE report_id = ?', [r.id]);
        }
      }
    }

    // Calculations
    const submitted = reports.filter(r => r.status !== 'Draft');
    const pending = reports.filter(r => r.status === 'Submitted' || r.status === 'Under Review');
    const approved = reports.filter(r => r.status === 'Approved');
    const rejected = reports.filter(r => r.status === 'Rejected');

    // Aggregate statistics
    let syllabusSum = 0;
    let syllabusCount = 0;
    let attendanceSum = 0;
    let attendanceCount = 0;

    for (const r of reports) {
      if (r.teaching_activities && r.teaching_activities.length > 0) {
        r.teaching_activities.forEach(t => {
          syllabusSum += t.syllabus_pct || 0;
          syllabusCount++;
        });
      }
      if (r.student_attendance && r.student_attendance.length > 0) {
        r.student_attendance.forEach(a => {
          attendanceSum += a.avg_attendance_pct || 0;
          attendanceCount++;
        });
      }
    }

    const avgSyllabus = syllabusCount > 0 ? (syllabusSum / syllabusCount) : 0;
    const avgAttendance = attendanceCount > 0 ? (attendanceSum / attendanceCount) : 0;

    return {
      totalStaff: staffCount,
      submittedCount: submitted.length,
      pendingCount: pending.length,
      approvedCount: approved.length,
      rejectedCount: rejected.length,
      avgSyllabus: parseFloat(avgSyllabus.toFixed(2)),
      avgAttendance: parseFloat(avgAttendance.toFixed(2))
    };
  },

  getAdminDashboardMetrics: async () => {
    // Collect all departments, users, and reports
    let users = [];
    let depts = [];
    let reports = [];

    if (isSupabaseActive) {
      const { data: u } = await supabase.from('users').select('id, role');
      const { data: d } = await supabase.from('departments').select('id');
      const { data: r } = await supabase.from('reports').select('id, status, report_type, teaching_activities(syllabus_pct), student_attendance(avg_attendance_pct)');
      users = u || [];
      depts = d || [];
      reports = r || [];
    } else {
      users = await all('SELECT id, role FROM users');
      depts = await all('SELECT id FROM departments');
      reports = await all('SELECT id, status, report_type FROM reports');
      for (const r of reports) {
        r.teaching_activities = await all('SELECT syllabus_pct FROM teaching_activities WHERE report_id = ?', [r.id]);
        r.student_attendance = await all('SELECT avg_attendance_pct FROM student_attendance WHERE report_id = ?', [r.id]);
      }
    }

    const staffCount = users.filter(u => u.role === 'staff').length;
    const submitted = reports.filter(r => r.status !== 'Draft');
    const pending = reports.filter(r => r.status === 'Submitted' || r.status === 'Under Review');
    const approved = reports.filter(r => r.status === 'Approved');
    const rejected = reports.filter(r => r.status === 'Rejected');
    const weeklyCount = reports.filter(r => r.report_type === 'weekly').length;
    const monthlyCount = reports.filter(r => r.report_type === 'monthly').length;

    let syllabusSum = 0;
    let syllabusCount = 0;
    let attendanceSum = 0;
    let attendanceCount = 0;

    for (const r of reports) {
      if (r.teaching_activities && r.teaching_activities.length > 0) {
        r.teaching_activities.forEach(t => {
          syllabusSum += t.syllabus_pct || 0;
          syllabusCount++;
        });
      }
      if (r.student_attendance && r.student_attendance.length > 0) {
        r.student_attendance.forEach(a => {
          attendanceSum += a.avg_attendance_pct || 0;
          attendanceCount++;
        });
      }
    }

    return {
      totalStaff: staffCount,
      totalDepartments: depts.length,
      reportsSubmitted: submitted.length,
      reportsPending: pending.length,
      reportsApproved: approved.length,
      reportsRejected: rejected.length,
      weeklyReports: weeklyCount,
      monthlyReports: monthlyCount,
      avgSyllabus: syllabusCount > 0 ? parseFloat((syllabusSum / syllabusCount).toFixed(2)) : 0,
      avgAttendance: attendanceCount > 0 ? parseFloat((attendanceSum / attendanceCount).toFixed(2)) : 0
    };
  },

  getDepartmentComparison: async (academicYear, semester, month) => {
    // SQL style list for local SQLite, and we'll calculate dynamically
    const depts = await db.getDepartments();
    const comparisons = [];

    for (const dept of depts) {
      let reports = [];
      if (isSupabaseActive) {
        const { data } = await supabase.from('reports')
          .select('id, status, teaching_activities(syllabus_pct), student_attendance(avg_attendance_pct), users!reports_staff_id_fkey(department_id)')
          .eq('status', 'Approved');
        // Filter by month/semester/year and department
        reports = (data || []).filter(r =>
          r.users?.department_id === dept.id &&
          (!academicYear || r.academic_year === academicYear) &&
          (!semester || r.semester === semester) &&
          (!month || r.month === month)
        );
      } else {
        let sql = `SELECT r.id, r.status
                   FROM reports r
                   LEFT JOIN users u ON r.staff_id = u.id
                   WHERE u.department_id = ? AND r.status = 'Approved'`;
        const params = [dept.id];
        if (academicYear) { sql += ' AND r.academic_year = ?'; params.push(academicYear); }
        if (semester) { sql += ' AND r.semester = ?'; params.push(semester); }
        if (month) { sql += ' AND r.month = ?'; params.push(month); }

        reports = await all(sql, params);
        for (const r of reports) {
          r.teaching_activities = await all('SELECT syllabus_pct FROM teaching_activities WHERE report_id = ?', [r.id]);
          r.student_attendance = await all('SELECT avg_attendance_pct FROM student_attendance WHERE report_id = ?', [r.id]);
        }
      }

      // Compute statistics
      let syllabusSum = 0;
      let syllabusCount = 0;
      let attendanceSum = 0;
      let attendanceCount = 0;
      let eventCount = 0;

      for (const r of reports) {
        if (r.teaching_activities) {
          r.teaching_activities.forEach(t => { syllabusSum += t.syllabus_pct || 0; syllabusCount++; });
        }
        if (r.student_attendance) {
          r.student_attendance.forEach(a => { attendanceSum += a.avg_attendance_pct || 0; attendanceCount++; });
        }

        // Event counter
        if (isSupabaseActive) {
          const { count } = await supabase.from('events').select('id', { count: 'exact' }).eq('report_id', r.id);
          eventCount += count || 0;
        } else {
          const res = await get('SELECT count(*) as count FROM events WHERE report_id = ?', [r.id]);
          eventCount += res ? res.count : 0;
        }
      }

      let staffCount = 0;
      if (isSupabaseActive) {
        const { count } = await supabase.from('users').select('id', { count: 'exact' }).eq('department_id', dept.id).eq('role', 'staff');
        staffCount = count || 0;
      } else {
        const res = await get('SELECT count(*) as count FROM users WHERE department_id = ? AND role = ?', [dept.id, 'staff']);
        staffCount = res ? res.count : 0;
      }

      comparisons.push({
        id: dept.id,
        department_name: dept.department_name,
        staffCount,
        reportsCount: reports.length,
        avgSyllabus: syllabusCount > 0 ? parseFloat((syllabusSum / syllabusCount).toFixed(2)) : 0,
        avgAttendance: attendanceCount > 0 ? parseFloat((attendanceSum / attendanceCount).toFixed(2)) : 0,
        eventsCount: eventCount
      });
    }

    return comparisons;
  }
};
