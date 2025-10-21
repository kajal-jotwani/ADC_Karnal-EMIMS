import React, { useEffect, useState } from "react";
import { analyticsAPI } from "../services/api";
import SubjectScoresByClass from "../components/visualizations/SubjectScoresByClass";
import SchoolPerformanceChart from "../components/visualizations/SchoolPerformanceChart";
import ExportButton from "../components/shared/ExportButton";
import { BarChart3, TrendingUp, Users, AlertCircle } from "lucide-react";
import { ClassPerformance, SchoolComparison } from "../types/api";

const Analytics: React.FC = () => {
  const [classPerformance, setClassPerformance] = useState<ClassPerformance[]>([]);
  const [schoolComparison, setSchoolComparison] = useState<SchoolComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching analytics data...");
        
        // Fetch both class and school data
        const [classData, schoolData] = await Promise.all([
          analyticsAPI.getClassPerformance(),
          analyticsAPI.getSchoolComparison(),
        ]);

        console.log("Class Performance Data:", classData);
        console.log("School Comparison Data:", schoolData);

        setClassPerformance(classData);
        setSchoolComparison(schoolData);

        if (classData.length === 0 && schoolData.length === 0) {
          setError("No analytics data available. Please ensure you have students, marks, and classes in the system.");
        }
      } catch (err: any) {
        console.error("Failed to load analytics:", err);
        setError(err.response?.data?.detail || "Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive data visualizations and insights</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-red-800 font-medium mb-1">Error Loading Analytics</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive data visualizations and insights</p>
        </div>
        <ExportButton type="performance" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
              <BarChart3 size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Class Performance</h3>
              <p className="text-sm text-gray-600">
                {classPerformance.length} {classPerformance.length === 1 ? 'class' : 'classes'} analyzed
              </p>
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
              <p className="text-sm text-gray-600">
                {schoolComparison.length} {schoolComparison.length === 1 ? 'school' : 'schools'} compared
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 text-purple-700">
              <TrendingUp size={24} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Students</h3>
              <p className="text-sm text-gray-600">
                {classPerformance.reduce((sum, cls) => sum + cls.student_count, 0)} students tracked
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualization Components */}
      <div className="space-y-8">
        {/* Class Performance Chart */}
        {classPerformance.length > 0 ? (
          <SubjectScoresByClass data={classPerformance} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
              Average Subject-Wise Score by Class
            </h3>
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
              <p>No class performance data available</p>
              <p className="text-sm mt-2">Add students and marks to see analytics</p>
            </div>
          </div>
        )}

        {/* School Performance Chart */}
        {schoolComparison.length > 0 ? (
          <SchoolPerformanceChart data={schoolComparison} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
              Average Score per School
            </h3>
            <div className="text-center py-12 text-gray-500">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <p>No school comparison data available</p>
              <p className="text-sm mt-2">Add schools and data to compare performance</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;