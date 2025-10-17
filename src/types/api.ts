// Dashboard types
export interface DashboardStats {
  total_schools?: number;
  total_students?: number;
  total_teachers?: number;
  total_subjects?: number;
  total_classes?: number;
  subjects_taught?: number;
  average_attendance?: number;
}

export interface ActivityItem {
  id: string;
  type: "success" | "info" | "warning" | "error";
  message: string;
  timestamp: string;
  icon: string;
}

export interface PerformanceData {
  subject: string;
  average: number;
}

export interface Alert {
  id: string;
  type: "success" | "info" | "warning" | "error";
  message: string;
  time: string;
}

// School Types
export interface School {
  id: number;
  name: string;
  district_id: number;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface SchoolDetail {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  district_id: number;
  stats: {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    average_performance: number;
  };
  teachers: Array<{
    id: number;
    name: string;
    email: string;
    phone: string | null;
    classes: string[];
  }>;
  classes: Array<{
    id: number;
    name: string;
    grade: string;
    section: string;
    student_count: number;
  }>;
  subject_performance: Array<{
    subject: string;
    average: number;
  }>;
}

// Analytics Types
export interface ClassPerformance {
  class_id: number;
  class: string;
  studentCount: number;
  subjects: {
    [subjectName: string]: number;
  };
}

export interface SchoolComparison {
  school_id: number;
  school: string;
  averageScore: number;
  studentCount: number;
  subjects: {
    [subjectName: string]: number;
  };
}

export interface StudentProgress {
  term: string;
  subjects: {
    [subjectName: string]: number;
  };
}

export interface SubjectPerformance {
  subject_id: number;
  subject: string;
  average: number;
}

// Class Management Types
export interface ClassItem {
  id: number;
  name: string;
  grade: string;
  section: string;
  school_id: number;
  teacher_id: number | null;
  teacher_name: string | null;
  student_count: number;
}

export interface ClassCreateRequest {
  name: string;
  grade: string;
  section: string;
  school_id: number;
  teacher_id?: number | null;
}

// Teacher Types
export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  school_id: number;
}

// Subject Types
export interface Subject {
  id: number;
  name: string;
}

// Teacher Assignment Types
export interface TeacherAssignment {
  id: number;
  teacher_id: number;
  class_id: number;
  subject_id: number;
}

export interface TeacherAssignmentCreate {
  teacher_id: number;
  class_id: number;
  subject_id: number;
}

// Extended Class with Assignments
export interface ClassWithAssignments extends ClassItem {
  assignments: TeacherAssignment[];
}