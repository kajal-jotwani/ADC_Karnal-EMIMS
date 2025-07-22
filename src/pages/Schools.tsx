import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import FilterBar from '../components/shared/FilterBar';
import ExportButton from '../components/shared/ExportButton';
import DataTable from '../components/shared/DataTable';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { MapPin, Phone, Users, BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Types
interface School {
  id: string;
  name: string;
  category: string;
  location: string;
  type: string;
  students: number;
  teachers: number;
  performance: number;
  trend: 'up' | 'down' | 'neutral';
}

// Mock data
const schoolsData: School[] = [
  { id: '1', name: 'Lincoln High School', category: 'High School', location: 'North District', type: 'Public', students: 1245, teachers: 87, performance: 82, trend: 'up' },
  { id: '2', name: 'Washington Middle School', category: 'Middle School', location: 'North District', type: 'Public', students: 870, teachers: 56, performance: 78, trend: 'neutral' },
  { id: '3', name: 'Roosevelt Elementary', category: 'Elementary', location: 'South District', type: 'Public', students: 620, teachers: 42, performance: 85, trend: 'up' },
  { id: '4', name: 'Jefferson Academy', category: 'High School', location: 'East District', type: 'Private', students: 780, teachers: 65, performance: 88, trend: 'up' },
  { id: '5', name: 'Madison Primary School', category: 'Primary', location: 'West District', type: 'Public', students: 450, teachers: 30, performance: 75, trend: 'down' },
  { id: '6', name: 'Franklin Middle School', category: 'Middle School', location: 'South District', type: 'Public', students: 695, teachers: 48, performance: 79, trend: 'neutral' },
  { id: '7', name: 'Kennedy High School', category: 'High School', location: 'West District', type: 'Public', students: 1120, teachers: 92, performance: 81, trend: 'up' },
  { id: '8', name: 'Adams Elementary', category: 'Elementary', location: 'North District', type: 'Public', students: 580, teachers: 38, performance: 77, trend: 'down' },
  { id: '9', name: 'Monroe Academy', category: 'Middle School', location: 'East District', type: 'Private', students: 420, teachers: 36, performance: 86, trend: 'up' },
  { id: '10', name: 'Quincy Primary School', category: 'Primary', location: 'Central District', type: 'Public', students: 510, teachers: 33, performance: 80, trend: 'neutral' },
];

// Mock filter options
const filterOptions = {
  districts: [
    { value: 'north', label: 'North District' },
    { value: 'south', label: 'South District' },
    { value: 'east', label: 'East District' },
    { value: 'west', label: 'West District' },
    { value: 'central', label: 'Central District' },
  ],
  categories: [
    { value: 'primary', label: 'Primary' },
    { value: 'elementary', label: 'Elementary' },
    { value: 'middle', label: 'Middle School' },
    { value: 'high', label: 'High School' },
  ],
};

const Schools: React.FC = () => {
  const navigate = useNavigate();
  const { schoolData } = useData();
  
  // Performance trend indicator component
  const TrendIndicator = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
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
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <div className="text-gray-700">{row.original.category}</div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => (
        <div className="flex items-center">
          <MapPin size={14} className="mr-1 text-gray-400" />
          <span>{row.original.location}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className={`badge ${row.original.type === 'Public' ? 'bg-primary-100 text-primary-800' : 'bg-accent-100 text-accent-800'}`}>
          {row.original.type}
        </span>
      ),
    },
    {
      accessorKey: 'students',
      header: 'Students',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Users size={14} className="mr-1 text-gray-400" />
          <span>{row.original.students}</span>
        </div>
      ),
    },
    {
      accessorKey: 'teachers',
      header: 'Teachers',
      cell: ({ row }) => (
        <div className="flex items-center">
          <BookOpen size={14} className="mr-1 text-gray-400" />
          <span>{row.original.teachers}</span>
        </div>
      ),
    },
    {
      accessorKey: 'performance',
      header: 'Performance',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div 
              className={`h-2.5 rounded-full ${
                row.original.performance >= 85 ? 'bg-success-500' :
                row.original.performance >= 75 ? 'bg-primary-500' : 
                'bg-warning-500'
              }`}
              style={{ width: `${row.original.performance}%` }}
            ></div>
          </div>
          <div className="flex items-center min-w-[70px]">
            <span className="mr-1">{row.original.performance}%</span>
            <TrendIndicator trend={row.original.trend} />
          </div>
        </div>
      ),
    },
  ];

  const handleSchoolClick = (school: School) => {
    navigate(`/schools/${school.id}`);
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Schools</h1>
        <p className="text-gray-600 mt-1">View and manage schools in your district</p>
      </div>
      
      <FilterBar 
        filters={{
          districts: filterOptions.districts,
        }}
        onSearch={() => {}}
        onRefresh={() => {}}
        customActions={
          <ExportButton type="schools" className="ml-2" />
        }
      />
      
      <DataTable 
        data={schoolData.map(school => ({
          ...school,
          trend: 'neutral' as const // You can implement trend calculation based on historical data
        }))} 
        columns={columns} 
        onRowClick={handleSchoolClick}
      />
    </div>
  );
};

export default Schools;