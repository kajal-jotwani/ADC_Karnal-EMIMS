import React, { useState } from 'react';
import FileUpload from '../components/shared/FileUpload';
import ExportButton from '../components/shared/ExportButton';
import { useData } from '../contexts/DataContext';
import { Upload, Database, FileText, Users, School } from 'lucide-react';

const DataManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'schools'>('students');
  const { studentData, schoolData } = useData();

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Data Management</h1>
        <p className="text-gray-600 mt-1">Upload and manage your educational data</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'students'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('students')}
            >
              <Users size={16} className="inline mr-2" />
              Student Data
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'schools'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('schools')}
            >
              <School size={16} className="inline mr-2" />
              School Data
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Student Data Upload</h2>
                  <p className="text-sm text-gray-600">
                    Upload student performance and attendance data
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    Current records: {studentData.length}
                  </span>
                  <ExportButton type="students" />
                </div>
              </div>
              <FileUpload type="students" />
            </div>
          )}

          {activeTab === 'schools' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">School Data Upload</h2>
                  <p className="text-sm text-gray-600">
                    Upload school information and performance data
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    Current records: {schoolData.length}
                  </span>
                  <ExportButton type="schools" />
                </div>
              </div>
              <FileUpload type="schools" />
            </div>
          )}
        </div>
      </div>

      {/* Sample Data Templates */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Sample Data Templates</h2>
        <p className="text-gray-600 mb-6">
          Download sample templates to understand the expected data format
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FileText size={20} className="text-primary-600 mr-2" />
              <h3 className="font-medium text-gray-900">Student Data Template</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Template with sample student records including grades and attendance
            </p>
            <button 
              className="btn btn-outline w-full"
              onClick={() => {
                const sampleData = [
                  {
                    name: 'John Doe',
                    grade: '10',
                    section: 'A',
                    school: 'Sample High School',
                    math: 85,
                    science: 78,
                    english: 92,
                    attendance: 95
                  }
                ];
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleData, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "student_template.json");
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}
            >
              Download Template
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <FileText size={20} className="text-secondary-600 mr-2" />
              <h3 className="font-medium text-gray-900">School Data Template</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Template with sample school information and performance metrics
            </p>
            <button 
              className="btn btn-outline w-full"
              onClick={() => {
                const sampleData = [
                  {
                    name: 'Sample High School',
                    category: 'High School',
                    location: 'North District',
                    type: 'Public',
                    students: 1200,
                    teachers: 85,
                    performance: 82
                  }
                ];
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleData, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "school_template.json");
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
              }}
            >
              Download Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;