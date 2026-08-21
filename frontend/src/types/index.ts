export type UserRole = 'admin' | 'hod' | 'staff';

export interface User {
  id: number;
  email: string;
  name: string;
  staff_id: string;
  role: UserRole;
  department_id?: number;
  department_name?: string;
  hod_name?: string;
  designation?: string;
  phone?: string;
  profile_photo?: string;
  qualification?: string;
  specialization?: string;
  date_of_joining?: string;
  academic_year?: string;
  semester?: string;
}

export type ReportStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Resubmitted';
export type ReportType = 'weekly' | 'monthly';

export interface TeachingActivity {
  id?: number;
  report_id?: number;
  subject_name: string;
  class_assigned: string;
  classes_taken: number;
  classes_cancelled?: number;
  classes_rescheduled?: number;
  teaching_hours: number;
  syllabus_planned?: string;
  syllabus_completed?: string;
  syllabus_pct: number;
  current_unit?: string;
  pending_units?: string;
  pending_reason?: string;
  lesson_plan_status?: string;
  teaching_methods?: string;
  ict_tools?: string;
  additional_classes?: number;
  extra_hours?: number;
}

export interface StudentAttendance {
  id?: number;
  report_id?: number;
  class_name: string;
  total_students: number;
  avg_attendance_pct: number;
  students_below_75?: number;
  low_attendance_students?: string;
  attendance_followup?: string;
  class_average_mark?: number;
  highest_mark?: number;
  lowest_mark?: number;
  slow_learners?: string;
  advanced_learners?: string;
  performance_analysis?: string;
  improvement_observed?: string;
  counselling_provided?: string;
}

export interface Assessment {
  id?: number;
  report_id?: number;
  assessment_name: string;
  given_date?: string;
  submission_count?: number;
  evaluation_completed?: number | boolean;
  marks_uploaded?: number | boolean;
  result_analysis_completed?: number | boolean;
  co_wise_performance?: string;
  difficult_topics?: string;
  corrective_action?: string;
}

export interface RemedialActivity {
  id?: number;
  report_id?: number;
  class_name: string;
  date_conducted?: string;
  students_attended?: number;
  topics_covered?: string;
  slow_learner_support?: string;
  doubt_clearing?: string;
  extra_coaching?: string;
  individual_support?: string;
  parent_comm?: string;
  counselling?: string;
  improvement_remarks?: string;
}

export interface Mentoring {
  id?: number;
  report_id?: number;
  mentored_count?: number;
  meeting_date?: string;
  individual_counselling?: string;
  academic_issues?: string;
  attendance_issues?: string;
  career_guidance?: string;
  parent_interaction?: string;
  special_attention_students?: string;
  followup_action?: string;
  mentoring_outcome?: string;
}

export interface ProjectGuidance {
  id?: number;
  report_id?: number;
  project_title: string;
  students_guided?: string;
  review_conducted?: string;
  review_number?: number;
  progress_pct: number;
  technical_guidance?: string;
  documentation_guidance?: string;
  issues_identified?: string;
  corrective_suggestions?: string;
  completion_status?: string;
}

export interface DepartmentActivity {
  id?: number;
  report_id?: number;
  meetings_attended?: number;
  meetings_conducted?: number;
  academic_planning?: string;
  timetable_prep?: string;
  workload_prep?: string;
  lab_maintenance?: string;
  lab_equipment_verification?: string;
  documentation?: string;
  accreditation_work?: string;
  event_coordination?: string;
  committee_activities?: string;
  exam_cell?: string;
}

export interface EventItem {
  id?: number;
  report_id?: number;
  event_name: string;
  event_date?: string;
  event_type?: string;
  role?: string;
  students_participated?: number;
  outcome?: string;
  certificates?: string;
  description?: string;
}

export interface FdpTraining {
  id?: number;
  report_id?: number;
  program_type: string;
  program_title: string;
  organizing_institution?: string;
  start_date?: string;
  duration?: string;
  mode?: string;
  role?: string;
  certificate_available?: number | boolean;
  skills_gained?: string;
  application_in_teaching?: string;
}

export interface ResearchActivity {
  id?: number;
  report_id?: number;
  work_done?: string;
  journal_paper?: string;
  conference_paper?: string;
  publication_status?: string;
  patent?: string;
  book?: string;
  book_chapter?: string;
  research_proposal?: string;
  funded_project?: string;
  collaboration?: string;
  scopus_wos?: number | boolean;
  citation_count?: number;
  progress_remarks?: string;
}

export interface ProfessionalDevelopment {
  id?: number;
  report_id?: number;
  technical_skills?: string;
  tools_learned?: string;
  online_courses?: string;
  certifications?: string;
  platform?: string;
  duration?: string;
  skill_applied?: string;
  professional_membership?: string;
}

export interface Achievement {
  id?: number;
  report_id?: number;
  achievement_type: string;
  achievement_title: string;
  description?: string;
  date_received?: string;
  level?: string;
  category?: string;
  recognition?: string;
  document_path?: string;
}

export interface AdministrativeActivity {
  id?: number;
  report_id?: number;
  exam_duty?: string;
  invigilation_duty?: string;
  valuation_duty?: string;
  admission_work?: string;
  scholarship_verification?: string;
  student_data_verification?: string;
  attendance_verification?: string;
  university_work?: string;
  documentation?: string;
  committee_responsibility?: string;
  other_duties?: string;
}

export interface LabActivity {
  id?: number;
  report_id?: number;
  laboratory_handled: string;
  classes_conducted?: number;
  equipment_checked?: string;
  equipment_issues?: string;
  software_installation?: string;
  maintenance_work?: string;
  new_equipment_req?: string;
  safety_issues?: string;
  suggestions?: string;
}

export interface MeetingItem {
  id?: number;
  report_id?: number;
  title: string;
  meeting_date?: string;
  meeting_type?: string;
  agenda?: string;
  role?: string;
  decisions_taken?: string;
  action_items?: string;
  action_completed?: string;
  pending_action?: string;
  remarks?: string;
}

export interface IssueItem {
  id?: number;
  report_id?: number;
  academic_issues?: string;
  student_issues?: string;
  attendance_issues?: string;
  infrastructure_issues?: string;
  laboratory_issues?: string;
  technical_issues?: string;
  administrative_issues?: string;
  time_management?: string;
  other_challenges?: string;
  action_taken?: string;
  support_required?: string;
}

export interface FuturePlan {
  id?: number;
  report_id?: number;
  planned_classes?: number;
  target_syllabus_pct?: number;
  assignments_planned?: string;
  internal_assessments?: string;
  remedial_classes?: string;
  mentoring_planned?: string;
  events_planned?: string;
  fdp_workshops?: string;
  research_work?: string;
  project_guidance?: string;
  department_activities?: string;
  target_to_achieve?: string;
}

export interface AdditionalRemark {
  id?: number;
  report_id?: number;
  overall_summary?: string;
  major_contributions?: string;
  important_updates?: string;
  suggestions?: string;
  recommendations?: string;
  support_required?: string;
  additional_info?: string;
}

export interface AttachedDocument {
  id?: number;
  report_id?: number;
  file_name: string;
  file_path: string;
  file_type?: string;
  uploaded_at?: string;
}

export interface AuditLog {
  id: number;
  report_id: number;
  action: string;
  actor_id: number;
  actor_name: string;
  review_comments?: string;
  created_at: string;
}

export interface FullReport {
  id: number;
  staff_id: number;
  staff_name?: string;
  staff_code?: string;
  designation?: string;
  department_name?: string;
  department_id?: number;
  qualification?: string;
  specialization?: string;
  report_type: ReportType;
  academic_year: string;
  semester: string;
  week_number?: number;
  month: string;
  start_date: string;
  end_date: string;
  status: ReportStatus;
  submitted_at?: string;
  approved_at?: string;
  reviewed_by?: number;
  reviewer_name?: string;
  review_comments?: string;
  created_at?: string;
  updated_at?: string;
  syllabus_pct?: number;
  avg_attendance_pct?: number;

  teaching_activities?: TeachingActivity[];
  student_attendance?: StudentAttendance[];
  assessments?: Assessment[];
  remedial_activities?: RemedialActivity[];
  mentoring?: Mentoring[];
  project_guidance?: ProjectGuidance[];
  department_activities?: DepartmentActivity[];
  events?: EventItem[];
  fdp_training?: FdpTraining[];
  research_activities?: ResearchActivity[];
  professional_development?: ProfessionalDevelopment[];
  achievements?: Achievement[];
  administrative_activities?: AdministrativeActivity[];
  lab_activities?: LabActivity[];
  meetings?: MeetingItem[];
  issues?: IssueItem[];
  future_plans?: FuturePlan[];
  additional_remarks?: AdditionalRemark[];
  documents?: AttachedDocument[];
  audit_logs?: AuditLog[];
}

export interface Department {
  id: number;
  department_name: string;
  hod_id?: number;
  hod_name?: string;
  staff_count?: number;
  staffCount?: number;
  reportsCount?: number;
  avgSyllabus?: number;
  avgAttendance?: number;
  eventsCount?: number;
}

export interface AcademicYear {
  id: number;
  year_name: string;
  active: number | boolean;
}
