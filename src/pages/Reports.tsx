import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  category: string;
  lastGenerated: string;
  format: 'PDF' | 'Excel' | 'CSV';
}

const reportsData: Report[] = [
  {
    id: '1',
    name: 'Student Performance Summary',
    description: 'Comprehensive report on student performance across all subjects and grades',
    category: 'Academic',
    lastGenerated: '2025-02-10',
    format: 'PDF'
  },
  {
    id: '2',
    name: 'Teacher Workload Analysis',
    description: 'Detailed breakdown of teacher assignments, classes, and hours',
    category: 'Administrative',
    lastGenerated: '2025-02-12',
    format: 'Excel'
  },
  {
    id: '3',
    name: 'School Attendance Trends',
    description: 'Monthly attendance patterns by school, grade, and class',
    category: 'Attendance',
    lastGenerated: '2025-02-14',
    format: 'Excel'
  },
  {
    id: '4',
    name: 'Subject Performance Comparison',
    description: 'Cross-school comparison of subject performance and trends',
    category: 'Academic',
    lastGenerated: '2025-02-08',
    format: 'PDF'
  },
  {
    id: '5',
    name: 'Resource Utilization Report',
    description: 'Analysis of classroom, laboratory, and library utilization',
    category: 'Resources',
    lastGenerated: '2025-02-11',
    format: 'Excel'
  },
  {
    id: '6',
    name: 'Student Progression Overview',
    description: 'Year-over-year progression of student performance and growth',
    category: 'Academic',
    lastGenerated: '2025-02-09',
    format: 'PDF'
  },
  {
    id: '7',
    name: 'Data Quality Assessment',
    description: 'Analysis of data completeness, accuracy, and timeliness',
    category: 'Data Management',
    lastGenerated: '2025-02-13',
    format: 'CSV'
  },
  {
    id: '8',
    name: 'District Performance Dashboard',
    description: 'Executive summary of key performance indicators across the district',
    category: 'Executive',
    lastGenerated: '2025-02-15',
    format: 'PDF'
  },
];

const Reports: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = ['All', 'Academic', 'Administrative', 'Attendance', 'Resources', 'Data Management', 'Executive'];
  
  const filteredReports = selectedCategory === 'All' 
    ? reportsData 
    : reportsData.filter(report => report.category === selectedCategory);
  
  const formatIcon = (format: string) => {
    switch (format) {
      case 'PDF':
        return <span className="badge bg-error-100 text-error-800">PDF</span>;
      case 'Excel':
        return <span className="badge bg-success-100 text-success-800">Excel</span>;
      case 'CSV':
        return <span className="badge bg-primary-100 text-primary-800">CSV</span>;
      default:
        return null;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">Generate and download reports for analysis and review</p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="bg-white py-2 px-4 rounded-md shadow-sm border border-gray-200 flex items-center">
          <Filter size={16} className="text-gray-400 mr-2" />
          <span className="text-sm font-medium mr-3">Category:</span>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-100 text-primary-800 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="card hover:translate-y-[-4px]">
            <div className="flex items-start">
              <div className="p-3 rounded-lg bg-primary-50 text-primary-700">
                <FileText size={24} />
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                  {formatIcon(report.format)}
                </div>
                <p className="text-sm text-gray-600 mt-1 mb-3">{report.description}</p>
                
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <Calendar size={14} className="mr-1" />
                  <span>Last generated: {formatDate(report.lastGenerated)}</span>
                </div>
                
                <div className="flex gap-2">
                  <button className="btn btn-primary flex-1 flex items-center justify-center">
                    <Download size={16} className="mr-1" />
                    <span>Download</span>
                  </button>
                  <button className="btn btn-outline">
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Custom Report Section */}
      <div className="mt-10 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">Generate Custom Report</h2>
        <p className="text-gray-600 mb-6">Create a custom report by selecting parameters below</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select className="select">
              <option>Academic Performance</option>
              <option>Attendance Analysis</option>
              <option>Teacher Workload</option>
              <option>Resource Utilization</option>
              <option>Data Quality</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select className="select">
              <option>Current Academic Year</option>
              <option>Last 6 Months</option>
              <option>Last 3 Months</option>
              <option>Custom Range</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select className="select">
              <option>PDF</option>
              <option>Excel</option>
              <option>CSV</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schools</label>
            <select className="select">
              <option>All Schools</option>
              <option>Lincoln High School</option>
              <option>Washington Middle School</option>
              <option>Roosevelt Elementary</option>
              <option>Jefferson Academy</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grade/Class</label>
            <select className="select">
              <option>All Grades</option>
              <option>Grade 7</option>
              <option>Grade 8</option>
              <option>Grade 9</option>
              <option>Grade 10</option>
              <option>Grade 11</option>
              <option>Grade 12</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
            <select className="select">
              <option>All Subjects</option>
              <option>Mathematics</option>
              <option>Science</option>
              <option>English</option>
              <option>History</option>
              <option>Geography</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="btn btn-outline mr-3">
            Save As Template
          </button>
          <button className="btn btn-primary">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;