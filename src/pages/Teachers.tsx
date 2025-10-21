import React, { useState, useEffect } from 'react';
import FilterBar from '../components/shared/FilterBar';
import DataTable from '../components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Users, Mail, Phone } from 'lucide-react';
import { teachersApi, schoolsAPI } from '../services/api';
import { Teacher, ClassItem, School } from '../types/api';

interface TeacherDisplay extends Teacher {
  school_name: string;
  classes: string[];
  students: number;
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<School[]>([]);

  // Get current user role from session/context
  const getCurrentUserRole = () => {
    const authUser = sessionStorage.getItem('auth_user');
    if (authUser) {
      const user = JSON.parse(authUser);
      return user.role;
    }
    return null;
  };

  // Fetch teachers and schools data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userRole = getCurrentUserRole();
      
      // Fetch teachers first
      const teachersData = await teachersApi.getTeachers();
      
      let schoolsData: School[] = [];
      
      // Fetch schools based on user role
      if (userRole === 'ADMIN') {
        // Admin can fetch all schools
        schoolsData = await schoolsAPI.getAll();
      } else if (userRole === 'PRINCIPAL') {
        // Principal - fetch their own school
        const mySchool = await schoolsAPI.getMySchool();
        if (mySchool) {
          schoolsData = [mySchool];
        }
      } else {
        // For other roles, fetch schools individually based on teacher data
        const schoolIds = [...new Set(teachersData.map(t => t.school_id))];
        const schoolPromises = schoolIds.map(id => 
          schoolsAPI.getById(id).catch(() => null)
        );
        const fetchedSchools = await Promise.all(schoolPromises);
        schoolsData = fetchedSchools.filter(s => s !== null) as School[];
      }
      
      setSchools(schoolsData);
      
      // Create a school lookup map for faster access
      const schoolMap = new Map(schoolsData.map(s => [s.id, s.name]));
      
      // Transform teachers data by fetching classes for each
      const transformedTeachers: TeacherDisplay[] = await Promise.all(
        teachersData.map(async (teacher) => {
          let teacherClasses: ClassItem[] = [];
          
          try {
            // Fetch classes for this teacher
            teacherClasses = await teachersApi.getTeacherClasses(teacher.id);
          } catch (err) {
            console.error(`Error fetching classes for teacher ${teacher.id}:`, err);
          }

          // Calculate total students from all classes
          const totalStudents = teacherClasses.reduce(
            (sum, cls) => sum + cls.student_count, 
            0
          );

          return {
            ...teacher,
            school_name: schoolMap.get(teacher.school_id) || 'Unknown School',
            classes: teacherClasses.map(cls => `${cls.grade}${cls.section}`),
            students: totalStudents,
          };
        })
      );
      
      setTeachers(transformedTeachers);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Failed to load teachers data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Table columns definition
  const teacherColumns: ColumnDef<TeacherDisplay>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          <div className="text-xs text-gray-500">Teacher</div>
        </div>
      ),
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <Mail size={12} className="mr-1 text-gray-400" />
            <span>{row.original.email}</span>
          </div>
          {row.original.phone && (
            <div className="flex items-center text-xs">
              <Phone size={12} className="mr-1 text-gray-400" />
              <span>{row.original.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'school_name',
      header: 'School',
      cell: ({ row }) => (
        <div className="text-gray-700">{row.original.school_name}</div>
      ),
    },
    {
      accessorKey: 'classes',
      header: 'Classes',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.classes.length > 0 ? (
            row.original.classes.map((cls) => (
              <span key={cls} className="badge bg-secondary-100 text-secondary-800">
                {cls}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-xs">No classes assigned</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'students',
      header: 'Students',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Users size={14} className="mr-1 text-gray-400" />
          <span>{row.original.students}</span>
        </div>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-1">View all teachers and their assignments</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading teachers...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-1">View all teachers and their assignments</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button 
          onClick={fetchData}
          className="mt-4 btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  // Generate filter options from actual data
  const schoolOptions = schools.map(school => ({
    value: school.id.toString(),
    label: school.name
  }));

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Teachers</h1>
        <p className="text-gray-600 mt-1">View all teachers and their assignments</p>
      </div>
      
      <FilterBar 
        filters={{
          schools: schoolOptions,
        }}
        onSearch={() => {}}
        onExport={() => {}}
        onRefresh={fetchData}
      />
      
      <DataTable 
        data={teachers} 
        columns={teacherColumns} 
      />
    </div>
  );
};

export default Teachers;