import React from 'react';
import { useData } from '../contexts/DataContext';
import StatCard from '../components/dashboard/StatCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import TeacherWorkload from '../components/dashboard/TeacherWorkload';
import AlertsWidget from '../components/dashboard/AlertsWidget';
import FilterBar from '../components/shared/FilterBar';
import ExportButton from '../components/shared/ExportButton';
import { School, Users, UserCog, BookOpen, BookText, BadgeAlert } from 'lucide-react';

// Mock data
const subjectPerformanceData = [
  { subject: 'Math', average: 78, district: 75, state: 73 },
  { subject: 'Science', average: 82, district: 79, state: 77 },
  { subject: 'English', average: 85, district: 82, state: 80 },
  { subject: 'History', average: 79, district: 76, state: 74 },
  { subject: 'Computer', average: 88, district: 84, state: 81 },
];

const teacherWorkloadData = [
  { teacher: 'Jane Smith', monday: 6, tuesday: 8, wednesday: 4, thursday: 7, friday: 5, saturday: 0 },
  { teacher: 'John Doe', monday: 7, tuesday: 5, wednesday: 8, thursday: 6, friday: 4, saturday: 2 },
  { teacher: 'Alice Johnson', monday: 5, tuesday: 6, wednesday: 7, thursday: 8, friday: 4, saturday: 0 },
  { teacher: 'Bob Wilson', monday: 8, tuesday: 7, wednesday: 6, thursday: 3, friday: 7, saturday: 1 },
  { teacher: 'Carol White', monday: 4, tuesday: 6, wednesday: 8, thursday: 7, friday: 5, saturday: 2 },
];

const alertsData = [
  { id: '1', type: 'error', message: 'Missing attendance data for Grade 8B (Feb 15, 2025)', time: '2 hours ago' },
  { id: '2', type: 'warning', message: 'Low engagement detected in Science Class 9A', time: '3 hours ago' },
  { id: '3', type: 'warning', message: 'Teacher John Doe has 8+ hours scheduled on Tuesday', time: '5 hours ago' },
  { id: '4', type: 'success', message: 'All Math assessment data successfully imported', time: '1 day ago' },
];

const filterOptions = {
  districts: [
    { value: 'district1', label: 'North District' },
    { value: 'district2', label: 'South District' },
    { value: 'district3', label: 'East District' },
  ],
  schools: [
    { value: 'school1', label: 'Lincoln High School' },
    { value: 'school2', label: 'Washington Middle School' },
    { value: 'school3', label: 'Roosevelt Elementary' },
  ],
};

const Dashboard: React.FC = () => {
  const { studentData, schoolData, subjectPerformance } = useData();
  
  const handleFilterChange = (filterType: string, value: any) => {
    console.log('Filter changed:', filterType, value);
  };

  const handleSearch = (searchTerm: string) => {
    console.log('Search term:', searchTerm);
  };

  const handleExport = () => {
    // This will be handled by the ExportButton component
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">View and analyze educational data across the district</p>
      </div>
      
      <FilterBar 
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
        customActions={
          <ExportButton type="performance" className="ml-2" />
        }
      />
      
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Schools"
          value={schoolData.length}
          change={{ value: "2", isPositive: true }}
          icon={School}
          color="primary"
        />
        <StatCard
          title="Total Students"
          value={studentData.length.toLocaleString()}
          change={{ value: "3.2%", isPositive: true }}
          icon={Users}
          color="secondary"
        />
        <StatCard
          title="Teachers"
          value={756}
          change={{ value: "5", isPositive: true }}
          icon={UserCog}
          color="accent"
        />
        <StatCard
          title="Subjects"
          value={24}
          icon={BookOpen}
          color="success"
        />
      </div>
      
      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Performance Chart - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <PerformanceChart 
            data={subjectPerformance} 
            title="Subject Performance"
            subtitle="Average scores compared to district and state benchmarks"
          />
        </div>
        
        {/* Alerts Widget - 1/3 width on large screens */}
        <div>
          <AlertsWidget 
            alerts={alertsData} 
            title="Recent Alerts"
          />
        </div>
        
        {/* Teacher Workload - Full width */}
        <div className="lg:col-span-3 mt-6">
          <TeacherWorkload 
            data={teacherWorkloadData} 
            title="Teacher Workload Distribution"
          />
        </div>
      </div>
      
      {/* Additional stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <StatCard
          title="Classes Conducted"
          value="1,254"
          change={{ value: "12%", isPositive: true }}
          icon={BookText}
          color="primary"
        />
        <StatCard
          title="Average Attendance"
          value="92.7%"
          change={{ value: "1.5%", isPositive: true }}
          icon={Users}
          color="success"
        />
        <StatCard
          title="Data Quality Alerts"
          value={8}
          change={{ value: "3", isPositive: false }}
          icon={BadgeAlert}
          color="warning"
        />
      </div>
    </div>
  );
};

export default Dashboard;