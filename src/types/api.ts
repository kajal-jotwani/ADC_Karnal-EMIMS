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
