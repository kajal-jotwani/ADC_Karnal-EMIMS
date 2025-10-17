import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SchoolComparison } from '../../types/api';

interface SchoolPerformanceChartProps {
  data: SchoolComparison[];
}

const SchoolPerformanceChart: React.FC<SchoolPerformanceChartProps> = ({ data }) => {
  // Transform data for display
  const chartData = data.map(school => ({
    ...school,
    displayName: school.school.length > 25 ? school.school.substring(0, 25) + '...' : school.school,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const schoolData = data.find(d => 
        (d.school.length > 25 ? d.school.substring(0, 25) + '...' : d.school) === label
      );
      
      if (!schoolData) return null;

      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900 mb-2">{schoolData.school}</p>
          <p className="text-sm text-gray-600 mb-2">Students: {schoolData.studentCount}</p>
          <div className="space-y-1">
            {Object.entries(schoolData.subjects || {}).map(([subject, score]) => (
              <p key={subject} className="text-sm" style={{ color: getSubjectColor(subject) }}>
                {subject}: {score}%
              </p>
            ))}
            <hr className="my-2" />
            <p className="text-sm font-medium text-gray-900">
              Overall Average: {schoolData.averageScore}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getSubjectColor = (subject: string): string => {
    const colors: { [key: string]: string } = {
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
    return colors[subject] || '#6B7280';
  };

  const getBarColor = (score: number) => {
    if (score >= 85) return '#10B981'; // Green
    if (score >= 75) return '#3B82F6'; // Blue
    if (score >= 65) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-xl font-heading font-semibold text-gray-900">
            Average Score per School
          </h3>
          <p className="text-sm text-gray-600">Overall performance comparison across schools</p>
        </div>
        <div className="text-center py-12 text-gray-500">
          No school comparison data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-heading font-semibold text-gray-900">
          Average Score per School
        </h3>
        <p className="text-sm text-gray-600">Overall performance comparison across schools</p>
      </div>

      {/* Summary Table */}
      <div className="mb-8 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                School
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Students
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject Breakdown
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((school, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {school.school}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {school.studentCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${getBarColor(school.averageScore)}20`,
                      color: getBarColor(school.averageScore)
                    }}
                  >
                    {school.averageScore}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(school.subjects || {}).map(([subject, score]) => (
                      <span 
                        key={subject}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: `${getSubjectColor(subject)}20`,
                          color: getSubjectColor(subject)
                        }}
                      >
                        {subject}: {score}%
                      </span>
                    ))}
                  </div>
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
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="displayName" 
              tick={{ fontSize: 11 }}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis 
              tickLine={false}
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="averageScore" 
              name="Average Score"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Bar 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.averageScore)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Legend */}
      <div className="mt-6 flex items-center justify-center flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span>Excellent (85%+)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span>Good (75-84%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
          <span>Average (65-74%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span>Below Average (&lt;65%)</span>
        </div>
      </div>
    </div>
  );
};

export default SchoolPerformanceChart;