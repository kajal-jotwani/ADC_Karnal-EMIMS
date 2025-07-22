import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color
}) => {
  const colorMap = {
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-secondary-100 text-secondary-700',
    accent: 'bg-accent-100 text-accent-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    error: 'bg-error-100 text-error-700',
  };
  
  const iconBackground = colorMap[color];
  
  return (
    <div className="card hover:translate-y-[-4px]">
      <div className="flex items-start">
        <div className={`p-3 rounded-lg ${iconBackground}`}>
          <Icon size={24} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold text-gray-900 mt-1">{value}</h3>
          
          {change && (
            <div className="flex items-center mt-1">
              <span className={`text-xs font-medium ${change.isPositive ? 'text-success-600' : 'text-error-600'}`}>
                {change.isPositive ? '+' : ''}{change.value}
              </span>
              <span className="text-xs text-gray-500 ml-1">vs. last period</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;