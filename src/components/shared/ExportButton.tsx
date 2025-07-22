import React, { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface ExportButtonProps {
  type: 'students' | 'schools' | 'performance';
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ type, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { exportData } = useData();

  const handleExport = (format: 'csv' | 'excel') => {
    exportData(type, format);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className={`btn btn-primary flex items-center ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Download size={16} className="mr-1" />
        <span>Export</span>
        <ChevronDown size={14} className="ml-1" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleExport('csv')}
              >
                Export as CSV
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleExport('excel')}
              >
                Export as Excel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;