import React from 'react';
import { useData } from '../contexts/DataContext';
import FilterBar from '../components/shared/FilterBar';
import ExportButton from '../components/shared/ExportButton';
import DataTable from '../components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Award, BookOpen, School } from 'lucide-react';

// Types
interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  school: string;
  attendance: number;
  subjects: {
    name: string;
    performance: number;
  }[];
  overallPerformance: number;
}

// Mock data
const studentsData: Student[] = [
  { 
    id: '1', 
    name: 'Amy Johnson', 
    grade: '10', 
    section: 'A', 
    school: 'Lincoln High School', 
    attendance: 92, 
    subjects: [
      { name: 'Math', performance: 85 },
      { name: 'Science', performance: 78 },
      { name: 'English', performance: 92 }
    ], 
    overallPerformance: 85 
  },
  { 
    id: '2', 
    name: 'Brandon Smith', 
    grade: '10', 
    section: 'A', 
    school: 'Lincoln High School', 
    attendance: 88, 
    subjects: [
      { name: 'Math', performance: 75 },
      { name: 'Science', performance: 82 },
      { name: 'English', performance: 79 }
    ], 
    overallPerformance: 79 
  },
  { 
    id: '3', 
    name: 'Chloe Williams', 
    grade: '9', 
    section: 'B', 
    school: 'Lincoln High School', 
    attendance: 95, 
    subjects: [
      { name: 'Math', performance: 92 },
      { name: 'Science', performance: 88 },
      { name: 'English', performance: 85 }
    ], 
    overallPerformance: 88 
  },
  { 
    id: '4', 
    name: 'Daniel Brown', 
    grade: '11', 
    section: 'A', 
    school: 'Lincoln High School', 
    attendance: 90, 
    subjects: [
      { name: 'Math', performance: 80 },
      { name: 'Science', performance: 75 },
      { name: 'English', performance: 85 }
    ], 
    overallPerformance: 80 
  },
  { 
    id: '5', 
    name: 'Emma Davis', 
    grade: '9', 
    section: 'A', 
    school: 'Washington Middle School', 
    attendance: 97, 
    subjects: [
      { name: 'Math', performance: 95 },
      { name: 'Science', performance: 92 },
      { name: 'English', performance: 90 }
    ], 
    overallPerformance: 92 
  },
  { 
    id: '6', 
    name: 'Frank Miller', 
    grade: '8', 
    section: 'B', 
    school: 'Washington Middle School', 
    attendance: 85, 
    subjects: [
      { name: 'Math', performance: 72 },
      { name: 'Science', performance: 78 },
      { name: 'English', performance: 75 }
    ], 
    overallPerformance: 75 
  },
  { 
    id: '7', 
    name: 'Grace Wilson', 
    grade: '10', 
    section: 'B', 
    school: 'Lincoln High School', 
    attendance: 93, 
    subjects: [
      { name: 'Math', performance: 88 },
      { name: 'Science', performance: 90 },
      { name: 'English', performance: 95 }
    ], 
    overallPerformance: 91 
  },
  { 
    id: '8', 
    name: 'Henry Taylor', 
    grade: '7', 
    section: 'A', 
    school: 'Roosevelt Elementary', 
    attendance: 89, 
    subjects: [
      { name: 'Math', performance: 82 },
      { name: 'Science', performance: 85 },
      { name: 'English', performance: 80 }
    ], 
    overallPerformance: 82 
  },
];

// Mock filter options
const filterOptions = {
  schools: [
    { value: 'lincoln', label: 'Lincoln High School' },
    { value: 'washington', label: 'Washington Middle School' },
    { value: 'roosevelt', label: 'Roosevelt Elementary' },
  ],
  grades: [
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
    { value: '9', label: 'Grade 9' },
    { value: '10', label: 'Grade 10' },
    { value: '11', label: 'Grade 11' },
  ],
  subjects: [
    { value: 'math', label: 'Math' },
    { value: 'science', label: 'Science' },
    { value: 'english', label: 'English' },
  ],
};

const Students: React.FC = () => {
  const { studentData } = useData();
  
  // Table columns definition
  const studentColumns: ColumnDef<Student>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'grade',
      header: 'Grade/Section',
      cell: ({ row }) => (
        <div className="text-gray-700">
          {row.original.grade}-{row.original.section}
        </div>
      ),
    },
    {
      accessorKey: 'school',
      header: 'School',
      cell: ({ row }) => (
        <div className="flex items-center">
          <School size={14} className="mr-1 text-gray-400" />
          <span>{row.original.school}</span>
        </div>
      ),
    },
    {
      accessorKey: 'attendance',
      header: 'Attendance',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div 
              className={`h-2.5 rounded-full ${
                row.original.attendance >= 90 ? 'bg-success-500' :
                row.original.attendance >= 80 ? 'bg-primary-500' : 
                'bg-warning-500'
              }`}
              style={{ width: `${row.original.attendance}%` }}
            ></div>
          </div>
          <span>{row.original.attendance}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'subjects',
      header: 'Subject Performance',
      cell: ({ row }) => (
        <div className="space-y-1.5">
          {row.original.subjects.map((subject) => (
            <div key={subject.name} className="flex items-center text-xs">
              <span className="w-16 font-medium">{subject.name}:</span>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mx-2">
                <div 
                  className={`h-1.5 rounded-full ${
                    subject.performance >= 90 ? 'bg-success-500' :
                    subject.performance >= 75 ? 'bg-primary-500' : 
                    'bg-warning-500'
                  }`}
                  style={{ width: `${subject.performance}%` }}
                ></div>
              </div>
              <span>{subject.performance}%</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'overallPerformance',
      header: 'Overall',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Award size={16} className={`mr-2 ${
            row.original.overallPerformance >= 90 ? 'text-success-500' :
            row.original.overallPerformance >= 80 ? 'text-primary-500' :
            row.original.overallPerformance >= 70 ? 'text-warning-500' :
            'text-error-500'
          }`} />
          <span className="font-medium">{row.original.overallPerformance}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Students</h1>
        <p className="text-gray-600 mt-1">View student performance and attendance data</p>
      </div>
      
      <FilterBar 
        filters={{
          schools: filterOptions.schools,
          grades: filterOptions.grades,
          subjects: filterOptions.subjects,
        }}
        onSearch={() => {}}
        onRefresh={() => {}}
        customActions={
          <ExportButton type="students" className="ml-2" />
        }
      />
      
      <DataTable 
        data={studentData.map(student => ({
          ...student,
          subjects: [
            { name: 'Math', performance: student.math || 0 },
            { name: 'Science', performance: student.science || 0 },
            { name: 'English', performance: student.english || 0 }
          ].filter(s => s.performance > 0),
          overallPerformance: Math.round(
            ([student.math, student.science, student.english].filter(Boolean).reduce((a, b) => a! + b!, 0) || 0) /
            [student.math, student.science, student.english].filter(Boolean).length || 1
          )
        }))} 
        columns={studentColumns} 
      />
    </div>
  );
};

export default Students;