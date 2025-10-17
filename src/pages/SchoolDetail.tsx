import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import { Users, UserCog, BookOpen, MapPin, Phone, Mail, Award, AlertCircle } from 'lucide-react';
import DataTable from '../components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { schoolsAPI } from '../services/api';

// Types
interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  classes: string[];
}

interface SchoolData {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  stats: {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    average_performance: number;
  };
  teachers: Teacher[];
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

const SchoolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchSchoolDetails(parseInt(id));
    }
  }, [id]);

  const fetchSchoolDetails = async (schoolId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolsAPI.getDetails(schoolId);
      if (data) {
        setSchoolData(data);
      } else {
        setError('School not found');
      }
    } catch (err: any) {
      console.error('Error fetching school details:', err);
      setError(err.message || 'Failed to load school details');
    } finally {
      setLoading(false);
    }
  };

  // Teacher table columns
  const teacherColumns: ColumnDef<Teacher>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-gray-700">{row.original.email}</div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="text-gray-700">{row.original.phone || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'classes',
      header: 'Classes',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.classes.length > 0 ? (
            row.original.classes.map((cls, idx) => (
              <span key={idx} className="badge bg-secondary-100 text-secondary-800">
                {cls}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">No classes assigned</span>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading school details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !schoolData) {
    return (
      <div className="fade-in">
        <nav className="mb-6">
          <ol className="flex items-center text-sm text-gray-500">
            <li>
              <Link to="/schools" className="hover:text-primary-600">Schools</Link>
            </li>
            <li className="mx-2">/</li>
            <li className="text-gray-900 font-medium">School Details</li>
          </ol>
        </nav>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-red-800 font-medium mb-1">Error Loading School</h3>
              <p className="text-red-700 text-sm">{error || 'School not found'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Transform subject performance data for chart
  const performanceChartData = schoolData.subject_performance.map(item => ({
    subject: item.subject,
    average: item.average,
  }));

  return (
    <div className="fade-in">
      {/* Breadcrumbs */}
      <nav className="mb-6">
        <ol className="flex items-center text-sm text-gray-500">
          <li>
            <Link to="/schools" className="hover:text-primary-600">Schools</Link>
          </li>
          <li className="mx-2">/</li>
          <li className="text-gray-900 font-medium">{schoolData.name}</li>
        </ol>
      </nav>
      
      {/* School header section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">{schoolData.name}</h1>
            <div className="mt-2 space-y-1 text-sm">
              {schoolData.address && (
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>{schoolData.address}</span>
                </div>
              )}
              {schoolData.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone size={16} className="mr-2" />
                  <span>{schoolData.phone}</span>
                </div>
              )}
              {schoolData.email && (
                <div className="flex items-center text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span>{schoolData.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Students"
          value={schoolData.stats.total_students}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Teachers"
          value={schoolData.stats.total_teachers}
          icon={UserCog}
          color="secondary"
        />
        <StatCard
          title="Classes"
          value={schoolData.stats.total_classes}
          icon={BookOpen}
          color="accent"
        />
        <StatCard
          title="Performance"
          value={`${schoolData.stats.average_performance}%`}
          icon={Award}
          color="success"
        />
      </div>
      
      {/* Subject Performance Chart */}
      {performanceChartData.length > 0 && (
        <div className="mb-6">
          <PerformanceChart 
            data={performanceChartData} 
            title="Subject Performance"
            subtitle="Average scores across different subjects"
          />
        </div>
      )}
      
      {/* Classes Section */}
      {schoolData.classes.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">Classes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {schoolData.classes.map(cls => (
              <div key={cls.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                <div className="font-medium text-gray-900 mb-1">{cls.name}</div>
                <div className="text-sm text-gray-600">Grade {cls.grade} - Section {cls.section}</div>
                <div className="text-sm text-gray-500 mt-2">
                  <Users size={14} className="inline mr-1" />
                  {cls.student_count} students
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Teachers List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-gray-900">Teachers</h2>
          <Link to="/teachers" className="text-sm text-primary-600 hover:text-primary-700">
            View all teachers
          </Link>
        </div>
        
        {schoolData.teachers.length > 0 ? (
          <DataTable 
            data={schoolData.teachers} 
            columns={teacherColumns} 
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <UserCog className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Teachers Found</h3>
            <p className="text-gray-600">There are no teachers assigned to this school yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolDetail;