import React from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { UserCog, School, Shield } from 'lucide-react';

const RoleSelector: React.FC = () => {
  const { user, switchRole } = useAuth();

  const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { role: 'admin', label: 'Admin', icon: <Shield size={16} />, color: 'bg-purple-100 text-purple-700' },
    { role: 'principal', label: 'Principal', icon: <School size={16} />, color: 'bg-blue-100 text-blue-700' },
    { role: 'teacher', label: 'Teacher', icon: <UserCog size={16} />, color: 'bg-green-100 text-green-700' },
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Role:</span>
      <div className="flex space-x-1">
        {roles.map(({ role, label, icon, color }) => (
          <button
            key={role}
            onClick={() => switchRole(role)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
              user?.role === role
                ? color
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;