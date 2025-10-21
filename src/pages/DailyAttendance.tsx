import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Calendar, Users, Check, X, Save, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { attendanceAPI } from '../services/api';
import { classesApi } from '../services/api';
import type { AttendanceCreate, Student, ClassItem } from '../types/api';

interface AttendanceRecord {
  student_id: number;
  student_name: string;
  roll_no: string;
  is_present: boolean;
}

interface AttendanceForm {
  date: string;
  class_id: number;
  attendance: AttendanceRecord[];
}

const DailyAttendance: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { register, handleSubmit, setValue } = useForm<AttendanceForm>({
    defaultValues: {
      date: selectedDate,
      class_id: 0,
      attendance: []
    }
  });

  // Only allow teachers to access this page
  if (user?.role !== 'teacher') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only teachers can access daily attendance.</p>
        </div>
      </div>
    );
  }

  // Fetch teacher's classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const teacherClasses = await classesApi.getClasses();
        setClasses(teacherClasses);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    fetchClasses();
  }, []);

  // Load students and existing attendance when class or date changes
  useEffect(() => {
    const loadAttendanceData = async () => {
      if (!selectedClass) {
        setAttendanceData([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch students for the class
        const students = await classesApi.getStudents(selectedClass);
        
        // Try to fetch existing attendance for this date
        const existingAttendance = await attendanceAPI.getClassAttendance(
          selectedClass,
          selectedDate
        );

        // Create attendance records, using existing data if available
        const attendanceRecords: AttendanceRecord[] = students.map(student => {
          const existing = existingAttendance.find(
            a => a.student_id === student.id
          );
          return {
            student_id: student.id,
            student_name: student.name,
            roll_no: student.roll_no,
            is_present: existing ? existing.is_present : true // Default to present
          };
        });

        setAttendanceData(attendanceRecords);
        setValue('attendance', attendanceRecords);
      } catch (error) {
        console.error('Error loading attendance data:', error);
        setSubmitMessage({ 
          type: 'error', 
          text: 'Error loading students. Please try again.' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAttendanceData();
  }, [selectedClass, selectedDate, setValue]);

  const toggleAttendance = (studentId: number) => {
    const updatedAttendance = attendanceData.map(record =>
      record.student_id === studentId
        ? { ...record, is_present: !record.is_present }
        : record
    );
    setAttendanceData(updatedAttendance);
    setValue('attendance', updatedAttendance);
  };

  const markAllPresent = () => {
    const updatedAttendance = attendanceData.map(record => ({
      ...record,
      is_present: true
    }));
    setAttendanceData(updatedAttendance);
    setValue('attendance', updatedAttendance);
  };

  const markAllAbsent = () => {
    const updatedAttendance = attendanceData.map(record => ({
      ...record,
      is_present: false
    }));
    setAttendanceData(updatedAttendance);
    setValue('attendance', updatedAttendance);
  };

  const onSubmit = async (data: AttendanceForm) => {
    if (!selectedClass) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Transform attendance data to match API format
      const attendancePayload: AttendanceCreate[] = attendanceData.map(record => ({
        student_id: record.student_id,
        class_id: selectedClass,
        date: selectedDate,
        is_present: record.is_present
      }));

      // Submit to API
      await attendanceAPI.markAttendance(attendancePayload);

      setSubmitMessage({ 
        type: 'success', 
        text: 'Attendance saved successfully!' 
      });
      
      setTimeout(() => setSubmitMessage(null), 5000);
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      setSubmitMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Error saving attendance. Please try again.' 
      });
      setTimeout(() => setSubmitMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentCount = attendanceData.filter(record => record.is_present).length;
  const absentCount = attendanceData.length - presentCount;

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Daily Attendance</h1>
        <p className="text-gray-600 mt-1">Mark attendance for your assigned classes</p>
      </div>

      {/* Class and Date Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              className="select"
              value={selectedClass || ''}
              onChange={(e) => setSelectedClass(e.target.value ? Number(e.target.value) : null)}
              required
            >
              <option value="">Choose a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - Grade {cls.grade} {cls.section} ({cls.student_count} students)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Date
            </label>
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading students...</p>
        </div>
      )}

      {/* Attendance Form */}
      {!isLoading && selectedClass && attendanceData.length > 0 && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('date')} value={selectedDate} />
          <input type="hidden" {...register('class_id')} value={selectedClass} />

          {/* Attendance Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                <Users size={20} className="inline mr-2" />
                Attendance Summary
              </h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={markAllPresent}
                  className="btn btn-outline btn-sm"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={markAllAbsent}
                  className="btn btn-outline btn-sm"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{attendanceData.length}</div>
                <div className="text-sm text-blue-600">Total Students</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{presentCount}</div>
                <div className="text-sm text-green-600">Present</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{absentCount}</div>
                <div className="text-sm text-red-600">Absent</div>
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-2">
              {attendanceData.map((record) => (
                <div
                  key={record.student_id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                    record.is_present
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="font-medium text-gray-900">
                      {record.roll_no}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{record.student_name}</div>
                      <div className="text-sm text-gray-500">Roll No: {record.roll_no}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleAttendance(record.student_id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                      record.is_present
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {record.is_present ? (
                      <>
                        <Check size={16} />
                        <span>Present</span>
                      </>
                    ) : (
                      <>
                        <X size={16} />
                        <span>Absent</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div className={`mt-6 p-4 rounded-lg flex items-center ${
                submitMessage.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <AlertCircle size={20} className="mr-2" />
                <span className="font-medium">{submitMessage.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex items-center"
              >
                <Save size={16} className="mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* No Students Message */}
      {!isLoading && selectedClass && attendanceData.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600">No students are enrolled in this class yet.</p>
        </div>
      )}

      {/* Select Class Message */}
      {!isLoading && !selectedClass && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
          <p className="text-gray-600">Choose a class to mark attendance for today.</p>
        </div>
      )}
    </div>
  );
};

export default DailyAttendance;