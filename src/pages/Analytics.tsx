import React from 'react';
import SubjectScoresByClass from '../components/visualizations/SubjectScoresByClass';
import SchoolPerformanceChart from '../components/visualizations/SchoolPerformanceChart';
// import StudentProgressChart from '../components/visualizations/StudentProgressChart';
import ExportButton from '../components/shared/ExportButton';
import { BarChart3, TrendingUp, Users } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Advanced Analytics</h1>
            <p className="text-gray-600 mt-1">Comprehensive data visualizations and insights</p>
          </div>
          <ExportButton type="performance" />
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
              <BarChart3 size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Class Performance</h3>
              <p className="text-sm text-gray-600">Subject-wise analysis by class</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-700">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">School Comparison</h3>
              <p className="text-sm text-gray-600">Performance across schools</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-700">
              <TrendingUp size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Student Progress</h3>
              <p className="text-sm text-gray-600">Individual tracking over time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Components */}
      <div className="space-y-8">
        {/* Subject Scores by Class */}
        <SubjectScoresByClass />

        {/* School Performance Chart */}
        <SchoolPerformanceChart />
      </div>
    </div>
  );
};

export default Analytics;