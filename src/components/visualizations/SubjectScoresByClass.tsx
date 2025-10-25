import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ClassPerformance } from '../../types/api';

interface SubjectScoresByClassProps {
  data: ClassPerformance[];
}

interface ChartData {
  class: string;
  studentCount: number;
  [key: string]: number | string; // For dynamic subject keys
}

const SubjectScoresByClass: React.FC<SubjectScoresByClassProps> = ({ data }) => {
  // Transform backend data to chart format
  const transformData = (): ChartData[] => {
    return data.map(item => {
      const chartItem: ChartData = {
        class: item.class,
        studentCount: item.studentCount,
      };
      
      // Add each subject as a property
      Object.entries(item.subjects || {}).forEach(([subject, score]) => {
        chartItem[subject] = score;
      });
      
      return chartItem;
    });
  };

  const chartData = transformData();

  // Extract all unique subjects from the data
  const getAllSubjects = (): string[] => {
    const subjectsSet = new Set<string>();
    data.forEach(item => {
      Object.keys(item.subjects || {}).forEach(subject => {
        subjectsSet.add(subject);
      });
    });
    return Array.from(subjectsSet);
  };

  const subjects = getAllSubjects();

  // Define colors for different subjects
  const subjectColors: { [key: string]: string } = {
    Math: '#3B82F6',
    Science: '#10B981',
    English: '#8B5CF6',
    Hindi: '#F59E0B',
    'Social Science': '#EF4444',
    History: '#EC4899',
    Geography: '#14B8A6',
    Physics: '#6366F1',
    Chemistry: '#84CC16',
    Biology: '#22D3EE',
  };

  const getColor = (subject: string, index: number): string => {
    return subjectColors[subject] || `hsl(${(index * 60) % 360}, 70%, 50%)`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const classData = chartData.find(d => d.class === label);
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900">Class {label}</p>
          <p className="text-sm text-gray-600 mb-2">Students: {classData?.studentCount}</p>
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

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-xl font-heading font-semibold text-gray-900">
            Average Subject-Wise Score by Class
          </h3>
          <p className="text-sm text-gray-600">Performance comparison across different classes</p>
        </div>
        <div className="text-center py-12 text-gray-500">
          No class performance data available
        </div>
      </div>
    );
  }

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
              {subjects.map(subject => (
                <th key={subject} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {subject} Average
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((classItem, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {classItem.class}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {classItem.studentCount}
                </td>
                {subjects.map((subject, subIdx) => {
                  const score = classItem.subjects?.[subject];
                  return (
                    <td key={subject} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {score !== undefined ? (
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${getColor(subject, subIdx)}20`,
                            color: getColor(subject, subIdx)
                          }}
                        >
                          {score}%
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
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
            {subjects.map((subject, index) => (
              <Bar 
                key={subject}
                dataKey={subject} 
                name={subject} 
                fill={getColor(subject, index)} 
                radius={[4, 4, 0, 0]} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SubjectScoresByClass;