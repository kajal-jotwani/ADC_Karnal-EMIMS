import React, { useState, useEffect } from 'react';
import FilterBar from '../components/shared/FilterBar';
import ExportButton from '../components/shared/ExportButton';
import DataTable from '../components/shared/DataTable';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { MapPin, Phone, Users, BookOpen, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { schoolsAPI } from '../services/api';

// Types
interface School {
  id: number;
  name: string;
  district_id: number;
  address: string | null;
  phone: string | null;
  email: string | null;
  students?: number;
  teachers?: number;
  performance?: number;
  trend?: 'up' | 'down' | 'neutral';
}

const Schools: React.FC = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await schoolsAPI.getAll();
      setSchools(data);
    } catch (err: any) {
      console.error('Error fetching schools:', err);
      setError(err.message || 'Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  // Performance trend indicator component
  const TrendIndicator = ({ trend }: { trend?: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') {
      return <TrendingUp size={16} className="text-success-500" />;
    } else if (trend === 'down') {
      return <TrendingDown size={16} className="text-error-500" />;
    } else {
      return <Minus size={16} className="text-gray-400" />;
    }
  };

  // Table columns definition
  const columns: ColumnDef<School>[] = [
    {
      accessorKey: 'name',
      header: 'School Name',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Location',
      cell: ({ row }) => (
        <div className="flex items-center">
          <MapPin size={14} className="mr-1 text-gray-400" />
          <span>{row.original.address || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Contact',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Phone size={14} className="mr-1 text-gray-400" />
          <span>{row.original.phone || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">{row.original.email || 'N/A'}</div>
      ),
    },
    {
      accessorKey: 'students',
      header: 'Students',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Users size={14} className="mr-1 text-gray-400" />
          <span>{row.original.students || 0}</span>
        </div>
      ),
    },
    {
      accessorKey: 'teachers',
      header: 'Teachers',
      cell: ({ row }) => (
        <div className="flex items-center">
          <BookOpen size={14} className="mr-1 text-gray-400" />
          <span>{row.original.teachers || 0}</span>
        </div>
      ),
    },
  ];

  const handleSchoolClick = (school: School) => {
    navigate(`/schools/${school.id}`);
  };

  if (loading) {
    return (
      <div className="fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Schools</h1>
          <p className="text-gray-600 mt-1">View and manage schools in your district</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading schools...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Schools</h1>
          <p className="text-gray-600 mt-1">View and manage schools in your district</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-red-800 font-medium mb-1">Error Loading Schools</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Schools</h1>
        <p className="text-gray-600 mt-1">View and manage schools in your district</p>
      </div>
      
      <FilterBar 
        filters={{}}
        onSearch={() => {}}
        onRefresh={fetchSchools}
        customActions={
          <ExportButton type="schools" className="ml-2" />
        }
      />
      
      {schools.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Schools Found</h3>
          <p className="text-gray-600">There are no schools in the system yet.</p>
        </div>
      ) : (
        <DataTable 
          data={schools} 
          columns={columns} 
          onRowClick={handleSchoolClick}
        />
      )}
    </div>
  );
};

export default Schools;