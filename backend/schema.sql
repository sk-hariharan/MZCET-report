-- Mount Zion College of Engineering and Technology (MZCET)
-- FacultyReport Database Schema (PostgreSQL / Supabase compatible)

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    department_name VARCHAR(255) UNIQUE NOT NULL,
    hod_id INTEGER -- Added as references later to avoid circular dependency
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Null for Supabase Auth integrations
    name VARCHAR(255) NOT NULL,
    staff_id VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin', 'hod', 'staff'
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    designation VARCHAR(150),
    phone VARCHAR(20),
    profile_photo TEXT,
    qualification VARCHAR(255),
    specialization VARCHAR(255),
    date_of_joining DATE,
    academic_year VARCHAR(50),
    semester VARCHAR(20),
    supabase_uid VARCHAR(255) UNIQUE, -- Maps local profile to Supabase Auth UID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Complete circular dependency reference for HOD
ALTER TABLE departments ADD CONSTRAINT fk_departments_hod FOREIGN KEY (hod_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Academic Years Table
CREATE TABLE IF NOT EXISTS academic_years (
    id SERIAL PRIMARY KEY,
    year_name VARCHAR(50) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT FALSE
);

-- 4. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(20) NOT NULL, -- 'weekly', 'monthly'
    academic_year VARCHAR(50) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    week_number INTEGER,
    month VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft', -- 'Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Resubmitted'
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    review_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Teaching & Academic Activities Table (Section A: Theory & Laboratory Courses)
CREATE TABLE IF NOT EXISTS teaching_activities (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    class_assigned VARCHAR(100) NOT NULL,
    course_type VARCHAR(50) DEFAULT 'Theory', -- 'Theory', 'Laboratory'
    instructor_name VARCHAR(255),
    classes_taken INTEGER DEFAULT 0,
    classes_cancelled INTEGER DEFAULT 0,
    classes_rescheduled INTEGER DEFAULT 0,
    teaching_hours VARCHAR(100), -- Total Hours Handled
    syllabus_planned TEXT,
    syllabus_completed TEXT,
    syllabus_pct REAL DEFAULT 0.0,
    current_unit TEXT, -- Unit Taken (TLP No./Total TLP)
    pending_units TEXT,
    pending_reason TEXT,
    lesson_plan_status VARCHAR(100),
    teaching_methods TEXT,
    ict_tools TEXT,
    additional_classes INTEGER DEFAULT 0,
    extra_hours INTEGER DEFAULT 0,
    exp_completed VARCHAR(100), -- Laboratory Experiments Completed (e.g. EX: 6/15)
    exp_remaining VARCHAR(100)  -- Laboratory Remaining Experiments (e.g. Ex: 8/15)
);

-- 6. Student Attendance & Performance Table
CREATE TABLE IF NOT EXISTS student_attendance (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL,
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
);

-- 7. Assignments & Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    assessment_name VARCHAR(255) NOT NULL,
    given_date DATE,
    submission_count INTEGER DEFAULT 0,
    evaluation_completed BOOLEAN DEFAULT FALSE,
    marks_uploaded BOOLEAN DEFAULT FALSE,
    result_analysis_completed BOOLEAN DEFAULT FALSE,
    co_wise_performance TEXT,
    difficult_topics TEXT,
    corrective_action TEXT
);

-- 8. Remedial Activities Table
CREATE TABLE IF NOT EXISTS remedial_activities (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL,
    date_conducted DATE,
    students_attended INTEGER DEFAULT 0,
    topics_covered TEXT,
    slow_learner_support TEXT,
    doubt_clearing TEXT,
    extra_coaching TEXT,
    individual_support TEXT,
    parent_comm TEXT,
    counselling TEXT,
    improvement_remarks TEXT
);

-- 9. Mentoring Table
CREATE TABLE IF NOT EXISTS mentoring (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    mentored_count INTEGER DEFAULT 0,
    meeting_date DATE,
    individual_counselling TEXT,
    academic_issues TEXT,
    attendance_issues TEXT,
    career_guidance TEXT,
    parent_interaction TEXT,
    special_attention_students TEXT,
    followup_action TEXT,
    mentoring_outcome TEXT
);

-- 10. Project Guidance Table
CREATE TABLE IF NOT EXISTS project_guidance (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    project_title VARCHAR(255) NOT NULL,
    students_guided TEXT,
    review_conducted VARCHAR(100),
    review_number INTEGER,
    progress_pct REAL DEFAULT 0.0,
    technical_guidance TEXT,
    documentation_guidance TEXT,
    issues_identified TEXT,
    corrective_suggestions TEXT,
    completion_status VARCHAR(100)
);

-- 11. Department Activities Table
CREATE TABLE IF NOT EXISTS department_activities (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    meetings_attended INTEGER DEFAULT 0,
    meetings_conducted INTEGER DEFAULT 0,
    academic_planning TEXT,
    timetable_prep TEXT,
    workload_prep TEXT,
    lab_maintenance TEXT,
    lab_equipment_verification TEXT,
    documentation TEXT,
    accreditation_work TEXT, -- NBA / NAAC
    event_coordination TEXT,
    committee_activities TEXT,
    exam_cell TEXT
);

-- 12. Co-Curricular & Events Table (Section B: Events Organised)
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    event_date VARCHAR(100),
    event_type VARCHAR(100), -- Workshop, Seminar, Conference, Symposium, etc.
    role VARCHAR(100), -- Internal Coordinator
    students_participated VARCHAR(100), -- Year / No. of Students Attended
    outcome TEXT,
    certificates TEXT,
    description TEXT -- Resource Person Details
);

-- 13. FDP & Training Table (Section C: Faculty Participation FDP/Workshop)
CREATE TABLE IF NOT EXISTS fdp_training (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    program_type VARCHAR(100) NOT NULL, -- FDP, Workshop, Seminar, etc.
    program_title VARCHAR(255) NOT NULL,
    organizing_institution VARCHAR(255), -- Venue / Organizer Details
    start_date VARCHAR(100), -- Date of Event
    duration VARCHAR(50),
    mode VARCHAR(50), -- Online, Offline
    role VARCHAR(100), -- Faculty Name
    certificate_available BOOLEAN DEFAULT FALSE,
    skills_gained TEXT,
    application_in_teaching TEXT
);

-- 14. Research Activities Table (Section G: Journal, Conference, Proposals)
CREATE TABLE IF NOT EXISTS research_activities (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    work_done VARCHAR(50), -- 'Journal', 'Conference', 'Proposal'
    journal_paper TEXT,
    conference_paper TEXT,
    publication_status VARCHAR(100), -- Published, Submitted, SCI, Annexure I, In Progress
    patent TEXT,
    book TEXT,
    book_chapter TEXT,
    research_proposal TEXT,
    funded_project TEXT,
    collaboration TEXT,
    scopus_wos BOOLEAN DEFAULT FALSE,
    citation_count INTEGER DEFAULT 0,
    progress_remarks TEXT -- Faculty Name / Remarks
);

-- 15. Professional Development Table
CREATE TABLE IF NOT EXISTS professional_development (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    technical_skills TEXT,
    tools_learned TEXT,
    online_courses TEXT,
    certifications TEXT,
    platform VARCHAR(150),
    duration VARCHAR(50),
    skill_applied TEXT,
    professional_membership TEXT
);

-- 16. Achievements Table (Section C & D: Faculty & Student NPTEL & Achievements)
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL, -- 'NPTEL Course', 'Student NPTEL', 'Student Event'
    achievement_title VARCHAR(255) NOT NULL,
    description TEXT,
    date_received VARCHAR(100),
    level VARCHAR(100), -- Elite, Elite with Silver, Gold, Pass, Registered
    category VARCHAR(100), -- 'Faculty NPTEL', 'Student NPTEL', 'Student Event'
    recognition TEXT, -- Mentor / Student Name
    document_path TEXT
);

-- 17. Administrative Activities Table
CREATE TABLE IF NOT EXISTS administrative_activities (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
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
);

-- 18. Lab & Infrastructure Table
CREATE TABLE IF NOT EXISTS lab_activities (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    laboratory_handled VARCHAR(255) NOT NULL,
    classes_conducted INTEGER DEFAULT 0,
    equipment_checked TEXT,
    equipment_issues TEXT,
    software_installation TEXT,
    maintenance_work TEXT,
    new_equipment_req TEXT,
    safety_issues TEXT,
    suggestions TEXT
);

-- 19. Meetings Table
CREATE TABLE IF NOT EXISTS meetings (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    meeting_date DATE,
    meeting_type VARCHAR(100),
    agenda TEXT,
    role VARCHAR(100),
    decisions_taken TEXT,
    action_items TEXT,
    action_completed TEXT,
    pending_action TEXT,
    remarks TEXT
);

-- 20. Issues & Challenges Table
CREATE TABLE IF NOT EXISTS issues (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
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
);

-- 21. Next Period Plan / Work Plan Table (Section H: 17 Department KPIs)
CREATE TABLE IF NOT EXISTS future_plans (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    sno INTEGER,
    particulars VARCHAR(255),
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
);

-- 22. Additional Remarks Table (Section E & F: Feedback & CCM)
CREATE TABLE IF NOT EXISTS additional_remarks (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'General', -- 'Feedback', 'CCM', 'General'
    year VARCHAR(50),
    date_day VARCHAR(50),
    submissions_total VARCHAR(50),
    remarks TEXT,
    action_taken TEXT,
    overall_summary TEXT,
    major_contributions TEXT,
    important_updates TEXT,
    suggestions TEXT,
    recommendations TEXT,
    support_required TEXT,
    additional_info TEXT
);

-- 23. Documents Table (Supporting documents uploads)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. Audit Logs Table (For reviews history tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'SUBMIT', 'APPROVE', 'REJECT', 'RESUBMIT'
    actor_id INTEGER NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    review_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_staff ON reports(staff_id);
CREATE INDEX IF NOT EXISTS idx_reports_period ON reports(report_type, academic_year, semester, month);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_dept ON users(department_id);
