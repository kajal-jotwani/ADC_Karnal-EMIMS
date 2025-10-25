import React, { useEffect, useState } from "react";
import { useData } from "../contexts/DataContext";
import StatCard from "../components/dashboard/StatCard";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import AlertsWidget from "../components/dashboard/AlertsWidget";
import FilterBar from "../components/shared/FilterBar";
import ExportButton from "../components/shared/ExportButton";
import {
  School,
  Users,
  UserCog,
  BookOpen,
  BookText,
  BadgeAlert,
  RefreshCw,
} from "lucide-react";
import { dashboardAPI } from "../services/api";
import {
  DashboardStats,
  PerformanceData,
  Alert,
  ActivityItem,
} from "../types/api";

const filterOptions = {
  districts: [
    { value: "district1", label: "North District" },
    { value: "district2", label: "South District" },
    { value: "district3", label: "East District" },
  ],
  schools: [
    { value: "school1", label: "PM Shri Kendriya Vidyalaya, Karnal" },
    { value: "school2", label: "PM Shri Govt. Sr. Sec. School, Karnal" },
    { value: "school3", label: "PM Shri GSSS Nilokheri, Karnal" },
  ],
};

const Dashboard: React.FC = () => {
  const { subjectPerformance } = useData();
  const [stats, setStats] = useState<DashboardStats>({});
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, perfData, alertsData, activityData] = await Promise.all(
        [
          dashboardAPI.getStats(),
          dashboardAPI.getPerformanceData(),
          dashboardAPI.getAlerts(),
          dashboardAPI.getRecentActivity(),
        ]
      );
      setStats(statsData);
      setPerformanceData(perfData);
      setAlerts(alertsData);
      setRecentActivity(activityData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => fetchDashboardData();

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-lg text-gray-600 mt-4">Loading dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold text-red-800 mb-2">
          Error Loading Dashboard
        </h2>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          View and analyze educational data across the district
        </p>
      </div>

      <FilterBar
        filters={filterOptions}
        onFilterChange={(type, value) => console.log(type, value)}
        onSearch={(term) => console.log("Search:", term)}
        onRefresh={handleRefresh}
        customActions={<ExportButton type="performance" className="ml-2" />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Schools"
          value={stats.total_schools || 0}
          icon={School}
          color="primary"
        />
        <StatCard
          title="Total Students"
          value={(stats.total_students || 0).toLocaleString()}
          icon={Users}
          color="secondary"
        />
        <StatCard
          title="Teachers"
          value={stats.total_teachers || 0}
          icon={UserCog}
          color="accent"
        />
        <StatCard
          title="Subjects"
          value={stats.total_subjects || 0}
          icon={BookOpen}
          color="success"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart
            data={
              performanceData.length > 0 ? performanceData : subjectPerformance
            }
            title="Subject Performance"
            subtitle="Average scores across all subjects"
          />
        </div>

        <div>
          <AlertsWidget alerts={alerts} title="Recent Alerts" />
        </div>
      </div>

      {/* Additional stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <StatCard
          title="Total Classes"
          value={stats.total_classes || 0}
          icon={BookText}
          color="primary"
        />
        <StatCard
          title="Average Attendance"
          value={`${(stats.average_attendance || 0).toFixed(1)}%`}
          icon={Users}
          color="success"
        />
        <StatCard
          title="Active Alerts"
          value={
            alerts.filter((a) => a.type === "warning" || a.type === "error")
              .length
          }
          icon={BadgeAlert}
          color="warning"
        />
      </div>

      {recentActivity.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.slice(0, 3).map((activity: ActivityItem) => (
              <div
                key={activity.id}
                className="flex items-center p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`h-5 w-5 mr-3 ${
                    activity.type === "success"
                      ? "text-green-600"
                      : activity.type === "warning"
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }`}
                >
                  {activity.icon === "school" && <School size={20} />}
                  {activity.icon === "report" && <BookText size={20} />}
                  {activity.icon === "sync" && <RefreshCw size={20} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
