import React from 'react';
import { useParams, Link } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import { Users, UserCog, BookOpen, MapPin, Phone, Mail, Calendar, Award } from 'lucide-react';
import DataTable from '../components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import TeacherWorkload from '../components/dashboard/TeacherWorkload';

// Types
interface Teacher {
  id: string;
  name: string;
  designation: string;
  subjects: string[];
  classes: string[];
  experience: number;
  rating: number;
}

// Mock data
const subjectPerformanceData = [
  { subject: 'Math', average: 78, district: 75, state: 73 },
  { subject: 'Science', average: 82, district: 79, state: 77 },
  { subject: 'English', average: 85, district: 82, state: 80 },
  { subject: 'History', average: 79, district: 76, state: 74 },
  { subject: 'Computer', average: 88, district: 84, state: 81 },
];

const teachersData: Teacher[] = [
  { id: '1', name: 'Jane Smith', designation: 'Senior Teacher', subjects: ['Math', 'Physics'], classes: ['9A', '10B'], experience: 8, rating: 4.7 },
  { id: '2', name: 'John Doe', designation: 'Head Teacher', subjects: ['English Literature'], classes: ['11A', '12A', '12B'], experience: 12, rating: 4.9 },
  { id: '3', name: 'Alice Johnson', designation: 'Teacher', subjects: ['Biology', 'Chemistry'], classes: ['9B', '10A'], experience: 5, rating: 4.5 },
  { id: '4', name: 'Bob Wilson', designation: 'Teacher', subjects: ['History', 'Civics'], classes: ['9A', '9B', '10A'], experience: 7, rating: 4.6 },
  { id: '5', name: 'Carol White', designation: 'Teacher', subjects: ['Computer Science'], classes: ['11A', '11B', '12A'], experience: 6, rating: 4.8 },
];

// School data
const schoolData = {
  id: '1',
  name: 'Lincoln High School',
  address: '123 Education Ave, North District',
  phone: '(555) 123-4567',
  email: 'info@lincolnhs.edu',
  principal: 'Dr. Michael Johnson',
  established: '1985',
  type: 'Public',
  students: 1245,
  teachers: 87,
  classes: 42,
  performance: {
    overall: 82,
    attendance: 94,
    graduation: 96
  }
};

const teacherWorkloadData = [
  { teacher: 'Jane Smith', monday: 6, tuesday: 8, wednesday: 4, thursday: 7, friday: 5, saturday: 0 },
  { teacher: 'John Doe', monday: 7, tuesday: 5, wednesday: 8, thursday: 6, friday: 4, saturday: 2 },
  { teacher: 'Alice Johnson', monday: 5, tuesday: 6, wednesday: 7, thursday: 8, friday: 4, saturday: 0 },
  { teacher: 'Bob Wilson', monday: 8, tuesday: 7, wednesday: 6, thursday: 3, friday: 7, saturday: 1 },
  { teacher: 'Carol White', monday: 4, tuesday: 6, wednesday: 8, thursday: 7, friday: 5, saturday: 2 },
];

const SchoolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
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
      accessorKey: 'designation',
      header: 'Designation',
      cell: ({ row }) => (
        <div className="text-gray-700">{row.original.designation}</div>
      ),
    },
    {
      accessorKey: 'subjects',
      header: 'Subjects',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.subjects.map((subject) => (
            <span key={subject} className="badge bg-primary-100 text-primary-800">
              {subject}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'classes',
      header: 'Classes',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.classes.map((cls) => (
            <span key={cls} className="badge bg-secondary-100 text-secondary-800">
              {cls}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'experience',
      header: 'Experience',
      cell: ({ row }) => (
        <div>{row.original.experience} years</div>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <div className="flex items-center">
          <span className="mr-1">{row.original.rating}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(row.original.rating)
                    ? 'text-yellow-400'
                    : i < row.original.rating
                    ? 'text-yellow-300'
                    : 'text-gray-300'
                }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 22 20"
              >
                <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
              </svg>
            ))}
          </div>
        </div>
      ),
    },
  ];

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
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-2" />
                <span>{schoolData.address}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone size={16} className="mr-2" />
                <span>{schoolData.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail size={16} className="mr-2" />
                <span>{schoolData.email}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-gray-50 rounded-md p-3 min-w-40">
              <div className="text-xs text-gray-500">Principal</div>
              <div className="font-medium">{schoolData.principal}</div>
            </div>
            <div className="bg-gray-50 rounded-md p-3 min-w-32">
              <div className="text-xs text-gray-500">Established</div>
              <div className="font-medium flex items-center">
                <Calendar size={14} className="mr-1" />
                {schoolData.established}
              </div>
            </div>
            <div className="bg-gray-50 rounded-md p-3 min-w-32">
              <div className="text-xs text-gray-500">Type</div>
              <div className="font-medium">
                <span className="badge bg-primary-100 text-primary-800">
                  {schoolData.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Students"
          value={schoolData.students}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Teachers"
          value={schoolData.teachers}
          icon={UserCog}
          color="secondary"
        />
        <StatCard
          title="Classes"
          value={schoolData.classes}
          icon={BookOpen}
          color="accent"
        />
        <StatCard
          title="Performance"
          value={`${schoolData.performance.overall}%`}
          icon={Award}
          color="success"
        />
      </div>
      
      {/* Subject Performance Chart */}
      <div className="mb-6">
        <PerformanceChart 
          data={subjectPerformanceData} 
          title="Subject Performance"
          subtitle="Average scores compared to district and state benchmarks"
        />
      </div>
      
      {/* Teachers List */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading font-semibold text-gray-900">Teachers</h2>
          <Link to="/teachers" className="text-sm text-primary-600 hover:text-primary-700">
            View all teachers
          </Link>
        </div>
        
        <DataTable 
          data={teachersData} 
          columns={teacherColumns} 
        />
      </div>
      <div className="lg:col-span-3 mt-6">
          <TeacherWorkload 
            data={teacherWorkloadData} 
            title="Teacher Workload Distribution"
          />
        </div>
    </div>
  );
};

export default SchoolDetail;