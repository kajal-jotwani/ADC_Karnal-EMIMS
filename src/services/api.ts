import axios, { AxiosInstance } from "axios";
import { refreshAccessToken } from "./auth";
import {
  DashboardStats,
  ActivityItem,
  PerformanceData,
  Alert,
  School,
  ClassItem, 
  ClassCreateRequest, 
  Teacher, 
  Subject,
  TeacherAssignment
} from "../types/api";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newTokens = await refreshAccessToken();
        if (newTokens) {
          const accessToken =
            (newTokens as any).access_token || (newTokens as any).accessToken;
          api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("auth_user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Dashboard API services
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const { data } = await api.get<DashboardStats>("/routers/dashboard/stats");
      return {
        total_schools: data.total_schools || 0,
        total_students: data.total_students || 0,
        total_teachers: data.total_teachers || 0,
        total_subjects: data.total_subjects || 0,
        total_classes: data.total_classes || 0,
        subjects_taught: data.subjects_taught || 0,
        average_attendance: Number(data.average_attendance) || 0,
      };
    } catch (error) {
      console.error("[DashboardAPI] Error fetching stats:", error);
      return {
        total_schools: 0,
        total_students: 0,
        total_teachers: 0,
        total_subjects: 0,
        total_classes: 0,
        subjects_taught: 0,
        average_attendance: 0,
      };
    }
  },

  getRecentActivity: async (): Promise<ActivityItem[]> => {
    try {
      const { data } = await api.get<ActivityItem[]>("/routers/dashboard/recent-activity");
      return (data || []).map((item) => ({
        ...item,
        timestamp: item.timestamp || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("[DashboardAPI] Error fetching recent activity:", error);
      return [];
    }
  },

  getPerformanceData: async (): Promise<PerformanceData[]> => {
    try {
      const { data } = await api.get<PerformanceData[]>("/routers/dashboard/performance-data");
      return (data || []).map((item) => ({
        subject: item.subject || "Unknown",
        average: Number(item.average) || 0,
      }));
    } catch (error) {
      console.error("[DashboardAPI] Error fetching performance data:", error);
      return [];
    }
  },

  getAlerts: async (): Promise<Alert[]> => {
    try {
      const { data } = await api.get<Alert[]>("/routers/dashboard/alerts");
      return (data || []).map((item) => ({
        ...item,
        time: item.time || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("[DashboardAPI] Error fetching alerts:", error);
      return [];
    }
  },
};

// Schools API services
export const schoolsAPI = {
  getAll: async (district_id?: number): Promise<School[]> => {
    try {
      const params = district_id ? { district_id } : {};
      const { data } = await api.get<School[]>("/routers/schools/", { params });
      return data;
    } catch (error) {
      console.error("[SchoolsAPI] Error fetching all schools:", error);
      return [];
    }
  },

  getById: async (school_id: number): Promise<School | null> => {
    try {
      const { data } = await api.get<School>(`/routers/schools/${school_id}`);
      return data;
    } catch (error) {
      console.error(`[SchoolsAPI] Error fetching school ${school_id}:`, error);
      return null;
    }
  },
};

// Analytics API services
export const analyticsAPI = {
  getClassPerformance: async (): Promise<any[]> => {
    try {
      const { data } = await api.get("/routers/analytics/class-performance");
      return data;
    } catch (error) {
      console.error("[AnalyticsAPI] Error fetching class performance:", error);
      return [];
    }
  },

  getSchoolComparison: async (): Promise<any[]> => {
    try {
      const { data } = await api.get("/routers/analytics/school-comparison");
      return data;
    } catch (error) {
      console.error("[AnalyticsAPI] Error fetching school comparison:", error);
      return [];
    }
  },

  getStudentProgress: async (student_id: number): Promise<any[]> => {
    try {
      const { data } = await api.get(`/routers/analytics/student-progress/${student_id}`);
      return data;
    } catch (error) {
      console.error(`[AnalyticsAPI] Error fetching student ${student_id} progress:`, error);
      return [];
    }
  },
};

// Classes API
export const classesApi = {
  // Get all classes
  getClasses: async (schoolId?: number): Promise<ClassItem[]> => {
    const params = schoolId ? { school_id: schoolId } : {};
    const response = await api.get('/routers/classes/', { params });
    return response.data;
  },

  // Get single class
  getClass: async (classId: number): Promise<ClassItem> => {
    const response = await api.get(`/routers/classes/${classId}`);
    return response.data;
  },

  // Create class
  createClass: async (classData: ClassCreateRequest): Promise<ClassItem> => {
    const response = await api.post('/routers/classes/', classData);
    return response.data;
  },

  // Delete class
  deleteClass: async (classId: number, confirm: boolean = false): Promise<{ message: string }> => {
    const params = confirm ? { confirm: true } : {};
    const response = await api.delete(`/routers/classes/${classId}`, { params });
    return response.data;
  },
};

// Teachers API
export const teachersApi = {
  // Get all teachers
  getTeachers: async (schoolId?: number): Promise<Teacher[]> => {
    const params = schoolId ? { school_id: schoolId } : {};
    const response = await api.get('/routers/teachers/', { params });
    return response.data;
  },

  // Get teacher classes
  getTeacherClasses: async (teacherId: number): Promise<ClassItem[]> => {
    const response = await api.get(`/routers/teachers/${teacherId}/classes`);
    return response.data;
  },

  // Assign teacher to class (class teacher)
  assignTeacherToClass: async (classId: number, teacherId: number): Promise<{ detail: string }> => {
    const response = await api.put(`/routers/teachers/classes/${classId}/assign/${teacherId}`);
    return response.data;
  },
};

// Subjects API
export const subjectsApi = {
  // Get all subjects
  getSubjects: async (): Promise<Subject[]> => {
    const response = await api.get('/routers/subjects/');
    return response.data;
  },

  // Create subject
  createSubject: async (name: string): Promise<Subject> => {
    const response = await api.post('/routers/subjects/', { name });
    return response.data;
  },

  // Update subject
  updateSubject: async (subjectId: number, name: string): Promise<Subject> => {
    const response = await api.put(`/routers/subjects/${subjectId}`, { name });
    return response.data;
  },

  // Delete subject
  deleteSubject: async (subjectId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/routers/subjects/${subjectId}`);
    return response.data;
  },
};

// Teacher Assignments API (for subject-teacher assignments within classes)
export const teacherAssignmentsApi = {
  // Create teacher assignment (assign teacher to subject in a class)
  createAssignment: async (classId: number, subjectId: number, teacherId: number): Promise<TeacherAssignment> => {
    const response = await api.post('/routers/teacher_assignments/', {
      teacher_id: teacherId,
      class_id: classId,
      subject_id: subjectId
    });
    return response.data;
  },

  // Get assignments for a class
  getClassAssignments: async (classId: number): Promise<TeacherAssignment[]> => {
    const response = await api.get(`/routers/teacher_assignments/class/${classId}`);
    return response.data;
  },

  // Delete assignment
  deleteAssignment: async (assignmentId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/routers/teacher_assignments/${assignmentId}`);
    return response.data;
  },
};

export default api;
