import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useData } from '../../contexts/DataContext';

interface ClassData {
  class: string;
  math: number;
  science: number;
  english: number;
  studentCount: number;
}

const SubjectScoresByClass: React.FC = () => {
  const { studentData } = useData();

  // Group students by class and calculate averages
  const processClassData = (): ClassData[] => {
    const classGroups: { [key: string]: any[] } = {};
    
    // Group students by grade + section
    studentData.forEach(student => {
      const classKey = `${student.grade}${student.section}`;
      if (!classGroups[classKey]) {
        classGroups[classKey] = [];
      }
      classGroups[classKey].push(student);
    });

    // Calculate averages for each class
    return Object.entries(classGroups).map(([classKey, students]) => {
      const mathScores = students.filter(s => s.math).map(s => s.math!);
      const scienceScores = students.filter(s => s.science).map(s => s.science!);
      const englishScores = students.filter(s => s.english).map(s => s.english!);

      return {
        class: classKey,
        math: mathScores.length > 0 ? Math.round(mathScores.reduce((a, b) => a + b, 0) / mathScores.length) : 0,
        science: scienceScores.length > 0 ? Math.round(scienceScores.reduce((a, b) => a + b, 0) / scienceScores.length) : 0,
        english: englishScores.length > 0 ? Math.round(englishScores.reduce((a, b) => a + b, 0) / englishScores.length) : 0,
        studentCount: students.length
      };
    }).sort((a, b) => a.class.localeCompare(b.class));
  };

  const classData = processClassData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = classData.find(d => d.class === label);
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900">Class {label}</p>
          <p className="text-sm text-gray-600">Students: {data?.studentCount}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
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
          Average Subject-Wise Score by Class
        </h3>
        <p className="text-sm text-gray-600">Performance comparison across different classes</p>
      </div>

      {/* Data Table */}
      <div className="mb-8 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Students
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Math Average
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Science Average
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                English Average
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classData.map((classItem) => (
              <tr key={classItem.class} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {classItem.class}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {classItem.studentCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {classItem.math}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {classItem.science}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {classItem.english}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={classData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="class" 
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
            <Bar dataKey="math" name="Math" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="science" name="Science" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="english" name="English" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SubjectScoresByClass;