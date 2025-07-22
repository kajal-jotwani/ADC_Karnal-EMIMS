import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../contexts/DataContext';

interface SchoolData {
  school: string;
  averageScore: number;
  studentCount: number;
  mathAvg: number;
  scienceAvg: number;
  englishAvg: number;
}

const SchoolPerformanceChart: React.FC = () => {
  const { studentData } = useData();

  // Group students by school and calculate averages
  const processSchoolData = (): SchoolData[] => {
    const schoolGroups: { [key: string]: any[] } = {};
    
    // Group students by school
    studentData.forEach(student => {
      if (!schoolGroups[student.school]) {
        schoolGroups[student.school] = [];
      }
      schoolGroups[student.school].push(student);
    });

    // Calculate averages for each school
    return Object.entries(schoolGroups).map(([school, students]) => {
      const mathScores = students.filter(s => s.math).map(s => s.math!);
      const scienceScores = students.filter(s => s.science).map(s => s.science!);
      const englishScores = students.filter(s => s.english).map(s => s.english!);

      const mathAvg = mathScores.length > 0 ? mathScores.reduce((a, b) => a + b, 0) / mathScores.length : 0;
      const scienceAvg = scienceScores.length > 0 ? scienceScores.reduce((a, b) => a + b, 0) / scienceScores.length : 0;
      const englishAvg = englishScores.length > 0 ? englishScores.reduce((a, b) => a + b, 0) / englishScores.length : 0;

      // Calculate overall average
      const validAverages = [mathAvg, scienceAvg, englishAvg].filter(avg => avg > 0);
      const overallAverage = validAverages.length > 0 ? validAverages.reduce((a, b) => a + b, 0) / validAverages.length : 0;

      return {
        school: school.length > 20 ? school.substring(0, 20) + '...' : school,
        averageScore: Math.round(overallAverage),
        studentCount: students.length,
        mathAvg: Math.round(mathAvg),
        scienceAvg: Math.round(scienceAvg),
        englishAvg: Math.round(englishAvg)
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  };

  const schoolData = processSchoolData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = schoolData.find(d => d.school === label);
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <p className="text-sm text-gray-600 mb-2">Students: {data?.studentCount}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">Math: {data?.mathAvg}%</p>
            <p className="text-sm text-green-600">Science: {data?.scienceAvg}%</p>
            <p className="text-sm text-purple-600">English: {data?.englishAvg}%</p>
            <hr className="my-2" />
            <p className="text-sm font-medium text-gray-900">
              Overall Average: {data?.averageScore}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (score: number) => {
    if (score >= 85) return '#10B981'; // Green
    if (score >= 75) return '#3B82F6'; // Blue
    if (score >= 65) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-heading font-semibold text-gray-900">
          Average Score per School
        </h3>
        <p className="text-sm text-gray-600">Overall performance comparison across schools</p>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={schoolData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="school" 
              tick={{ fontSize: 11 }}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
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
              fill={(entry: any) => getBarColor(entry.averageScore)}
            >
              {schoolData.map((entry, index) => (
                <Bar key={`cell-${index}`} fill={getBarColor(entry.averageScore)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
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