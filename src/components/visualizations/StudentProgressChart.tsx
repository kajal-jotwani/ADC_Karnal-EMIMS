import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Select from 'react-select';
import { useData } from '../../contexts/DataContext';

interface ProgressData {
  term: string;
  math: number | null;
  science: number | null;
  english: number | null;
}

const StudentProgressChart: React.FC = () => {
  const { studentData } = useData();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Create student options for dropdown
  const studentOptions = studentData.map(student => ({
    value: student.id,
    label: `${student.name} (${student.grade}${student.section} - ${student.school})`
  }));

  // Generate mock progress data for selected student
  const generateProgressData = (studentId: string): ProgressData[] => {
    const student = studentData.find(s => s.id === studentId);
    if (!student) return [];

    // For demo purposes, we'll simulate 3 terms of data
    // In a real application, this would come from historical data
    const currentScores = {
      math: student.math || 0,
      science: student.science || 0,
      english: student.english || 0
    };

    return [
      {
        term: 'Term 1',
        math: currentScores.math > 0 ? Math.max(0, currentScores.math - Math.random() * 15) : null,
        science: currentScores.science > 0 ? Math.max(0, currentScores.science - Math.random() * 15) : null,
        english: currentScores.english > 0 ? Math.max(0, currentScores.english - Math.random() * 15) : null,
      },
      {
        term: 'Term 2',
        math: currentScores.math > 0 ? Math.max(0, currentScores.math - Math.random() * 8) : null,
        science: currentScores.science > 0 ? Math.max(0, currentScores.science - Math.random() * 8) : null,
        english: currentScores.english > 0 ? Math.max(0, currentScores.english - Math.random() * 8) : null,
      },
      {
        term: 'Term 3',
        math: currentScores.math > 0 ? Math.round(currentScores.math) : null,
        science: currentScores.science > 0 ? Math.round(currentScores.science) : null,
        english: currentScores.english > 0 ? Math.round(currentScores.english) : null,
      }
    ];
  };

  const progressData = selectedStudent ? generateProgressData(selectedStudent) : [];
  const selectedStudentInfo = selectedStudent ? studentData.find(s => s.id === selectedStudent) : null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            entry.value !== null && (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: {Math.round(entry.value)}%
              </p>
            )
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-heading font-semibold text-gray-900">
          Student Progress Tracking
        </h3>
        <p className="text-sm text-gray-600">Track individual student performance across terms</p>
      </div>

      {/* Student Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Student
        </label>
        <Select
          options={studentOptions}
          value={studentOptions.find(option => option.value === selectedStudent)}
          onChange={(selected) => setSelectedStudent(selected?.value || null)}
          placeholder="Choose a student to view their progress..."
          className="text-sm"
          isClearable
        />
      </div>

      {selectedStudent && selectedStudentInfo ? (
        <>
          {/* Student Info Card */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Student</p>
                <p className="text-lg font-semibold text-gray-900">{selectedStudentInfo.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Class</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedStudentInfo.grade}{selectedStudentInfo.section}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">School</p>
                <p className="text-lg font-semibold text-gray-900">{selectedStudentInfo.school}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Attendance</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedStudentInfo.attendance ? `${selectedStudentInfo.attendance}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={progressData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="term" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: 15 }} />
                
                {selectedStudentInfo.math && (
                  <Line 
                    type="monotone" 
                    dataKey="math" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Math"
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    connectNulls={false}
                  />
                )}
                
                {selectedStudentInfo.science && (
                  <Line 
                    type="monotone" 
                    dataKey="science" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Science"
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    connectNulls={false}
                  />
                )}
                
                {selectedStudentInfo.english && (
                  <Line 
                    type="monotone" 
                    dataKey="english" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    name="English"
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Progress Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedStudentInfo.math && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Math Progress</h4>
                <p className="text-2xl font-bold text-blue-700">{selectedStudentInfo.math}%</p>
                <p className="text-sm text-blue-600">Current Score</p>
              </div>
            )}
            
            {selectedStudentInfo.science && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Science Progress</h4>
                <p className="text-2xl font-bold text-green-700">{selectedStudentInfo.science}%</p>
                <p className="text-sm text-green-600">Current Score</p>
              </div>
            )}
            
            {selectedStudentInfo.english && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900">English Progress</h4>
                <p className="text-2xl font-bold text-purple-700">{selectedStudentInfo.english}%</p>
                <p className="text-sm text-purple-600">Current Score</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p>Please select a student to view their progress chart</p>
        </div>
      )}
    </div>
  );
};

export default StudentProgressChart;