import React from 'react';
import { useData } from '../contexts/DataContext';
import FilterBar from '../components/shared/FilterBar';
import ExportButton from '../components/shared/ExportButton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BookOpen, Users, Clock, Award, UserCog } from 'lucide-react';

// Types
interface SubjectData {
  name: string;
  teachers: number;
  students: number;
  avgPerformance: number;
  classesPerWeek: number;
  trend: 'up' | 'down' | 'neutral';
}

// Mock data
const subjectsData: SubjectData[] = [
  { name: 'Mathematics', teachers: 8, students: 450, avgPerformance: 76, classesPerWeek: 5, trend: 'up' },
  { name: 'Science', teachers: 6, students: 420, avgPerformance: 79, classesPerWeek: 4, trend: 'up' },
  { name: 'English', teachers: 10, students: 480, avgPerformance: 82, classesPerWeek: 5, trend: 'neutral' },
  { name: 'History', teachers: 4, students: 380, avgPerformance: 75, classesPerWeek: 3, trend: 'down' },
  { name: 'Geography', teachers: 3, students: 320, avgPerformance: 77, classesPerWeek: 3, trend: 'neutral' },
  { name: 'Computer Science', teachers: 5, students: 280, avgPerformance: 85, classesPerWeek: 3, trend: 'up' },
  { name: 'Art', teachers: 2, students: 240, avgPerformance: 88, classesPerWeek: 2, trend: 'up' },
  { name: 'Physical Education', teachers: 4, students: 460, avgPerformance: 90, classesPerWeek: 3, trend: 'neutral' },
];

// Mock performance data for charts
const performanceData = [
  { name: 'Mathematics', schoolA: 78, schoolB: 72, schoolC: 68, district: 73 },
  { name: 'Science', schoolA: 82, schoolB: 76, schoolC: 74, district: 77 },
  { name: 'English', schoolA: 85, schoolB: 80, schoolC: 78, district: 81 },
  { name: 'History', schoolA: 76, schoolB: 73, schoolC: 70, district: 73 },
  { name: 'Geography', schoolA: 79, schoolB: 75, schoolC: 72, district: 75 },
  { name: 'Computer Science', schoolA: 88, schoolB: 82, schoolC: 80, district: 83 },
];

// Mock filter options
const filterOptions = {
  schools: [
    { value: 'lincoln', label: 'Lincoln High School' },
    { value: 'washington', label: 'Washington Middle School' },
    { value: 'roosevelt', label: 'Roosevelt Elementary' },
  ],
};

const Subjects: React.FC = () => {
  const { studentData, subjectPerformance } = useData();
  
  // Calculate subject statistics from actual data
  const calculateSubjectStats = () => {
    const subjects = ['math', 'science', 'english', 'history', 'geography', 'computer'];
    return subjects.map(subject => {
      const scores = studentData
        .map(student => student[subject as keyof typeof student] as number)
        .filter(score => score !== undefined && score !== null);
      
      const studentsCount = scores.length;
      const avgPerformance = studentsCount > 0 
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / studentsCount)
        : 0;
      
      return {
        name: subject.charAt(0).toUpperCase() + subject.slice(1),
        teachers: Math.ceil(studentsCount / 50), // Estimate teachers based on student count
        students: studentsCount,
        avgPerformance,
        classesPerWeek: subject === 'math' || subject === 'english' ? 5 : 3,
        trend: avgPerformance >= 80 ? 'up' : avgPerformance >= 70 ? 'neutral' : 'down'
      };
    }).filter(subject => subject.students > 0);
  };
  
  const subjectsData = calculateSubjectStats();
  
  // Convert subject performance data for chart
  const performanceData = subjectPerformance.map(subject => ({
    name: subject.subject,
    schoolA: subject.average,
    schoolB: subject.district,
    schoolC: subject.state,
    district: Math.round((subject.average + subject.district + subject.state) / 3)
  }));
  
  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Subjects</h1>
        <p className="text-gray-600 mt-1">View performance and analytics by subject</p>
      </div>
      
      <FilterBar 
        filters={{
          schools: filterOptions.schools,
        }}
        onSearch={() => {}}
        onRefresh={() => {}}
        customActions={
          <ExportButton type="performance" className="ml-2" />
        }
      />
      
      {/* Subject cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {subjectsData.map((subject) => (
          <div key={subject.name} className="card hover:translate-y-[-4px]">
            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 bg-primary-50 text-primary-700 rounded-md">
                <BookOpen size={20} />
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                subject.trend === 'up' 
                  ? 'bg-success-100 text-success-800' 
                  : subject.trend === 'down'
                    ? 'bg-error-100 text-error-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {subject.trend === 'up' ? '↑ Improving' : subject.trend === 'down' ? '↓ Declining' : '→ Stable'}
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-3">{subject.name}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Users size={14} className="mr-1" />
                  <span>Students</span>
                </div>
                <div className="text-lg font-medium">{subject.students}</div>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <UserCog size={14} className="mr-1" />
                  <span>Teachers</span>
                </div>
                <div className="text-lg font-medium">{subject.teachers}</div>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Clock size={14} className="mr-1" />
                  <span>Classes/Week</span>
                </div>
                <div className="text-lg font-medium">{subject.classesPerWeek}</div>
              </div>
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Award size={14} className="mr-1" />
                  <span>Performance</span>
                </div>
                <div className="text-lg font-medium">{subject.avgPerformance}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Performance comparison chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-6">Performance Comparison by School</h2>
        
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis 
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, '']}
                labelStyle={{ fontWeight: 'bold' }}
                contentStyle={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '0.75rem' }}
              />
              <Legend wrapperStyle={{ paddingTop: 15 }} />
              <Bar dataKey="schoolA" name="Lincoln High School" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="schoolB" name="Washington Middle School" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="schoolC" name="Roosevelt Elementary" fill="#F97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="district" name="District Average" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Subjects;