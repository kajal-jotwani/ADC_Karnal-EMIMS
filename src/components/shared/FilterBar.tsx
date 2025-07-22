import React from 'react';
import Select from 'react-select';
import { Search, Download, RefreshCw } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  filters: {
    districts?: FilterOption[];
    schools?: FilterOption[];
    grades?: FilterOption[];
    subjects?: FilterOption[];
  };
  onFilterChange?: (filterType: string, value: any) => void;
  onSearch?: (searchTerm: string) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  customActions?: React.ReactNode;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onSearch,
  onExport,
  onRefresh,
  customActions,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="input pl-10"
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            {filters.districts && (
              <div className="w-full sm:w-48">
                <Select
                  placeholder="District"
                  options={filters.districts}
                  isClearable
                  className="text-sm"
                  onChange={(selected) => onFilterChange && onFilterChange('district', selected)}
                />
              </div>
            )}
            
            {filters.schools && (
              <div className="w-full sm:w-48">
                <Select
                  placeholder="School"
                  options={filters.schools}
                  isClearable
                  className="text-sm"
                  onChange={(selected) => onFilterChange && onFilterChange('school', selected)}
                />
              </div>
            )}
            
            {filters.grades && (
              <div className="w-full sm:w-36">
                <Select
                  placeholder="Grade"
                  options={filters.grades}
                  isClearable
                  className="text-sm"
                  onChange={(selected) => onFilterChange && onFilterChange('grade', selected)}
                />
              </div>
            )}
            
            {filters.subjects && (
              <div className="w-full sm:w-40">
                <Select
                  placeholder="Subject"
                  options={filters.subjects}
                  isClearable
                  className="text-sm"
                  onChange={(selected) => onFilterChange && onFilterChange('subject', selected)}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 self-end">
          {onRefresh && (
            <button 
              className="btn btn-outline p-2" 
              onClick={onRefresh}
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
          )}
          
          {onExport && (
            <button 
              className="btn btn-primary flex items-center" 
              onClick={onExport}
            >
              <Download size={16} className="mr-1" />
              <span>Export</span>
            </button>
          )}
          
          {customActions}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;