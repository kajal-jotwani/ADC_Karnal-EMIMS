import React from 'react';
import FilterBar from '../components/shared/FilterBar';
import DataTable from '../components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Users, BookOpen, Mail, Phone } from 'lucide-react';

// Types
interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  school: string;
  subjects: string[];
  classes: string[];
  students: number;
  experience: number;
}

// Mock data
const teachersData: Teacher[] = [
  { id: '1', name: 'Jane Smith', email: 'jane.smith@school.edu', phone: '(555) 123-4567', designation: 'Senior Teacher', school: 'Lincoln High School', subjects: ['Math', 'Physics'], classes: ['9A', '10B'], students: 82, experience: 8 },
  { id: '2', name: 'John Doe', email: 'john.doe@school.edu', phone: '(555) 234-5678', designation: 'Head Teacher', school: 'Lincoln High School', subjects: ['English Literature'], classes: ['11A', '12A', '12B'], students: 105, experience: 12 },
  { id: '3', name: 'Alice Johnson', email: 'alice.j@school.edu', phone: '(555) 345-6789', designation: 'Teacher', school: 'Washington Middle School', subjects: ['Biology', 'Chemistry'], classes: ['9B', '10A'], students: 76, experience: 5 },
  { id: '4', name: 'Bob Wilson', email: 'bob.w@school.edu', phone: '(555) 456-7890', designation: 'Teacher', school: 'Washington Middle School', subjects: ['History', 'Civics'], classes: ['9A', '9B', '10A'], students: 94, experience: 7 },
  { id: '5', name: 'Carol White', email: 'carol.w@school.edu', phone: '(555) 567-8901', designation: 'Teacher', school: 'Roosevelt Elementary', subjects: ['Computer Science'], classes: ['6A', '6B', '7A'], students: 88, experience: 6 },
  { id: '6', name: 'David Brown', email: 'david.b@school.edu', phone: '(555) 678-9012', designation: 'Senior Teacher', school: 'Roosevelt Elementary', subjects: ['Math'], classes: ['5A', '5B', '6A'], students: 78, experience: 9 },
  { id: '7', name: 'Eva Garcia', email: 'eva.g@school.edu', phone: '(555) 789-0123', designation: 'Teacher', school: 'Jefferson Academy', subjects: ['Art', 'Music'], classes: ['7A', '7B', '8A'], students: 110, experience: 4 },
  { id: '8', name: 'Frank Miller', email: 'frank.m@school.edu', phone: '(555) 890-1234', designation: 'Teacher', school: 'Jefferson Academy', subjects: ['Geography', 'Economics'], classes: ['9A', '10A', '10B'], students: 92, experience: 11 },
];

// Mock filter options
const filterOptions = {
  schools: [
    { value: 'lincoln', label: 'Lincoln High School' },
    { value: 'washington', label: 'Washington Middle School' },
    { value: 'roosevelt', label: 'Roosevelt Elementary' },
    { value: 'jefferson', label: 'Jefferson Academy' },
  ],
  designations: [
    { value: 'head', label: 'Head Teacher' },
    { value: 'senior', label: 'Senior Teacher' },
    { value: 'teacher', label: 'Teacher' },
  ],
  subjects: [
    { value: 'math', label: 'Math' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English' },
    { value: 'history', label: 'History' },
    { value: 'computer', label: 'Computer Science' },
  ],
};

const Teachers: React.FC = () => {
  // Table columns definition
  const teacherColumns: ColumnDef<Teacher>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          <div className="text-xs text-gray-500">{row.original.designation}</div>
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
          <div className="flex items-center text-xs">
            <Phone size={12} className="mr-1 text-gray-400" />
            <span>{row.original.phone}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'school',
      header: 'School',
      cell: ({ row }) => (
        <div className="text-gray-700">{row.original.school}</div>
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
      accessorKey: 'students',
      header: 'Students',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Users size={14} className="mr-1 text-gray-400" />
          <span>{row.original.students}</span>
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
  ];

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Teachers</h1>
        <p className="text-gray-600 mt-1">View all teachers and their assignments</p>
      </div>
      
      <FilterBar 
        filters={{
          schools: filterOptions.schools,
          subjects: filterOptions.subjects,
        }}
        onSearch={() => {}}
        onExport={() => {}}
        onRefresh={() => {}}
      />
      
      <DataTable 
        data={teachersData} 
        columns={teacherColumns} 
      />
    </div>
  );
};

export default Teachers;