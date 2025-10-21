import axios, { AxiosInstance } from "axios";
import { refreshAccessToken } from "./auth";
import {
  DashboardStats,
  ActivityItem,
  PerformanceData,
  Alert,
  School,
  Student,
  ClassItem,
  ClassCreateRequest,
  Teacher,
  Subject,
  TeacherAssignment,
  SubjectPerformance,
  SchoolComparison,
  StudentProgress,
  ClassPerformance,
  SchoolDetail,
  AttendanceCreate,
  AttendanceResponse,
  AttendanceSummary,
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
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
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
      const { data } = await api.get<DashboardStats>(
        "/routers/dashboard/stats"
      );
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
      const { data } = await api.get<ActivityItem[]>(
        "/routers/dashboard/recent-activity"
      );
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
      const { data } = await api.get<PerformanceData[]>(
        "/routers/dashboard/performance-data"
      );
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

  getDetails: async (school_id: number): Promise<SchoolDetail | null> => {
    try {
      console.log(`[SchoolsAPI] Fetching details for school ${school_id}`);
      const { data } = await api.get<SchoolDetail>(
        `/routers/schools/${school_id}/details`
      );
      console.log("[SchoolsAPI] School details response:", data);
      return data;
    } catch (error: any) {
      console.error(
        `[SchoolsAPI] Error fetching school ${school_id} details:`,
        error
      );
      console.error("[SchoolsAPI] Error details:", error.response?.data);
      return null;
    }
  },

  getMySchool: async (): Promise<School | null> => {
    try {
      console.log("[SchoolsAPI] Fetching my school (principal)");
      const { data } = await api.get<School>("/routers/schools/my-school");
      return data;
    } catch (error: any) {
      console.error("[SchoolsAPI] Error fetching my school:", error);
      return null;
    }
  },
};

// Analytics API services
export const analyticsAPI = {
  // Get class performance (subject-wise breakdown by class)
  getClassPerformance: async (): Promise<ClassPerformance[]> => {
    try {
      const { data } = await api.get<ClassPerformance[]>(
        "/routers/analytics/class-performance"
      );
      return data || [];
    } catch (error: any) {
      console.error("[AnalyticsAPI] Error fetching class performance:", error);
      console.error("[AnalyticsAPI] Error details:", error.response?.data);

      // If it's a 403, the user might not have permission
      if (error.response?.status === 403) {
        throw new Error(
          "You don't have permission to view class performance data"
        );
      }

      return [];
    }
  },

  // Get school comparison (overall performance by school)
  getSchoolComparison: async (): Promise<SchoolComparison[]> => {
    try {
      const { data } = await api.get<SchoolComparison[]>(
        "/routers/analytics/school-comparison"
      );
      return data || [];
    } catch (error: any) {
      console.error("[AnalyticsAPI] Error fetching school comparison:", error);
      console.error("[AnalyticsAPI] Error details:", error.response?.data);

      // If it's a 403, the user might not have admin access
      if (error.response?.status === 403) {
        throw new Error("Only administrators can view school comparison data");
      }

      return [];
    }
  },

  // Get student progress over time
  getStudentProgress: async (
    student_id: number
  ): Promise<StudentProgress[]> => {
    try {
      const { data } = await api.get<StudentProgress[]>(
        `/routers/analytics/student-progress/${student_id}`
      );
      return data || [];
    } catch (error: any) {
      console.error(
        `[AnalyticsAPI] Error fetching student ${student_id} progress:`,
        error
      );
      console.error("[AnalyticsAPI] Error details:", error.response?.data);

      if (error.response?.status === 404) {
        throw new Error("Student not found");
      }
      if (error.response?.status === 403) {
        throw new Error(
          "You don't have permission to view this student's progress"
        );
      }

      return [];
    }
  },

  // Get subject performance for a school (optional - useful for detailed view)
  getSubjectPerformance: async (
    school_id?: number
  ): Promise<SubjectPerformance[]> => {
    try {
      const params = school_id ? { school_id } : {};
      console.log("[AnalyticsAPI] Fetching subject performance...", params);
      const { data } = await api.get<SubjectPerformance[]>(
        "/routers/analytics/subject-performance",
        { params }
      );
      console.log("[AnalyticsAPI] Subject performance response:", data);
      return data || [];
    } catch (error: any) {
      console.error(
        "[AnalyticsAPI] Error fetching subject performance:",
        error
      );
      console.error("[AnalyticsAPI] Error details:", error.response?.data);
      return [];
    }
  },
};

// Classes API
export const classesApi = {
  // Get all classes
  getClasses: async (schoolId?: number): Promise<ClassItem[]> => {
    const params = schoolId ? { school_id: schoolId } : {};
    const response = await api.get("/routers/classes/", { params });
    return response.data;
  },

  // Get single class
  getClass: async (classId: number): Promise<ClassItem> => {
    const response = await api.get(`/routers/classes/${classId}`);
    return response.data;
  },

  // Create class
  createClass: async (classData: ClassCreateRequest): Promise<ClassItem> => {
    const response = await api.post("/routers/classes/", classData);
    return response.data;
  },

  // Delete class
  deleteClass: async (
    classId: number,
    confirm: boolean = false
  ): Promise<{ message: string }> => {
    const params = confirm ? { confirm: true } : {};
    const response = await api.delete(`/routers/classes/${classId}`, {
      params,
    });
    return response.data;
  },

  //Fetch students for a specific class
  getStudents: async (classId: number): Promise<Student[]> => {
    try {
      const { data } = await api.get<Student[]>(
        `/routers/students?class_id=${classId}`
      );
      return data;
    } catch (error) {
      console.error(
        `[ClassesAPI] Error fetching students for class ${classId}:`,
        error
      );
      return [];
    }
  },

  //add a new student to a class
  addStudent: async (
    classId: number,
    student: { name: string; roll_no: string; class_id?: number }
  ): Promise<Student> => {
    try {
      const payload = { ...student, class_id: classId }; // make sure class_id is sent
      const { data } = await api.post(
        `/routers/classes/${classId}/students`,
        payload
      );
      return data;
    } catch (error: any) {
      console.error(
        `[ClassesAPI] Error adding student to class ${classId}:`,
        error.response?.data || error
      );
      throw error;
    }
  },
  //Delete a student
  deleteStudent: async (studentId: number): Promise<{ message: string }> => {
    try {
      const { data } = await api.delete(`/routers/students/${studentId}`);
      return data;
    } catch (error: any) {
      console.error(
        `[ClassesAPI] Error deleting student ${studentId}:`,
        error.response?.data || error
      );
      throw error;
    }
  },
};

// Teachers API
export const teachersApi = {
  // Get all teachers
  getTeachers: async (schoolId?: number): Promise<Teacher[]> => {
    const params = schoolId ? { school_id: schoolId } : {};
    const response = await api.get("/routers/teachers/", { params });
    return response.data;
  },

  // Get teacher classes
  getTeacherClasses: async (teacherId: number): Promise<ClassItem[]> => {
    const response = await api.get(`/routers/teachers/${teacherId}/classes`);
    return response.data;
  },

  // Assign teacher to class (class teacher)
  assignTeacherToClass: async (
    classId: number,
    teacherId: number
  ): Promise<{ detail: string }> => {
    const response = await api.put(
      `/routers/teachers/classes/${classId}/assign/${teacherId}`
    );
    return response.data;
  },
};

// Subjects API
export const subjectsApi = {
  // Get all subjects
  getSubjects: async (): Promise<Subject[]> => {
    const response = await api.get("/routers/subjects/");
    return response.data;
  },

  // Create subject
  createSubject: async (name: string): Promise<Subject> => {
    const response = await api.post("/routers/subjects/", { name });
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
  createAssignment: async (
    classId: number,
    subjectId: number,
    teacherId: number
  ): Promise<TeacherAssignment> => {
    const response = await api.post("/routers/teacher_assignments/", {
      teacher_id: teacherId,
      class_id: classId,
      subject_id: subjectId,
    });
    return response.data;
  },

  // Get assignments for a class
  getClassAssignments: async (
    classId: number
  ): Promise<TeacherAssignment[]> => {
    const response = await api.get(
      `/routers/teacher_assignments/class/${classId}`
    );
    return response.data;
  },

  // Delete assignment
  deleteAssignment: async (
    assignmentId: number
  ): Promise<{ message: string }> => {
    const response = await api.delete(
      `/routers/teacher_assignments/${assignmentId}`
    );
    return response.data;
  },
};

export default api;

// Attendance API services
export const attendanceAPI = {
  // Mark attendance for multiple students
  markAttendance: async (
    attendanceData: AttendanceCreate[]
  ): Promise<AttendanceResponse[]> => {
    try {
      const { data } = await api.post<AttendanceResponse[]>(
        "/routers/attendance/",
        attendanceData
      );
      return data;
    } catch (error: any) {
      console.error("[AttendanceAPI] Error marking attendance:", error);
      throw error;
    }
  },

  // Get attendance for a class on a specific date
  getClassAttendance: async (
    classId: number,
    date: string
  ): Promise<AttendanceResponse[]> => {
    try {
      const { data } = await api.get<AttendanceResponse[]>(
        `/routers/attendance/class/${classId}/date/${date}`
      );
      return data;
    } catch (error: any) {
      console.error("[AttendanceAPI] Error fetching class attendance:", error);
      return [];
    }
  },

  // Get student attendance summary
  getStudentSummary: async (
    studentId: number
  ): Promise<AttendanceSummary | null> => {
    try {
      const { data } = await api.get<AttendanceSummary>(
        `/routers/attendance/student/${studentId}/summary`
      );
      return data;
    } catch (error: any) {
      console.error("[AttendanceAPI] Error fetching student summary:", error);
      return null;
    }
  },
};