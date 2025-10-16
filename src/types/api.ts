//dashboard types
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
  address: string;
  phone: string;
  email: string;
}

// Analytics Types
export interface ClassPerformance {
  class_id: number;
  class: string;
  student_count: number;
  subjects: Record<string, number>; // { Math: 85.5, Science: 78.2 }
}

export interface SchoolComparison {
  school_id: number;
  school: string;
  average_score: number;
  student_count: number;
  subjects: Record<string, number>;
}

export interface StudentProgress {
  term: string;
  subjects: Record<string, number>;
}
