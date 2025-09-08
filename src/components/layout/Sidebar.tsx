import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  School,
  Users,
  UserCog,
  BookOpen,
  FileBarChart,
  Database,
  BarChart3,
  Settings,
  X,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150 ${
          isActive 
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:text-primary-700 hover:bg-gray-50'
        }`
      }
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['admin', 'principal', 'teacher'] },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { to: '/schools', icon: <School size={20} />, label: 'Schools', roles: ['admin'] },
        { to: '/teachers', icon: <UserCog size={20} />, label: 'Teachers', roles: ['admin'] },
        { to: '/students', icon: <Users size={20} />, label: 'Students', roles: ['admin'] },
        { to: '/subjects', icon: <BookOpen size={20} />, label: 'Subjects', roles: ['admin'] },
        { to: '/reports', icon: <FileBarChart size={20} />, label: 'Reports', roles: ['admin'] },
        { to: '/data', icon: <Database size={20} />, label: 'Data Management', roles: ['admin'] },
        { to: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics', roles: ['admin'] },
      ];
    } else if (user?.role === 'principal') {
      return [
        ...baseItems,
        { to: '/class-management', icon: <GraduationCap size={20} />, label: 'Class Management', roles: ['principal'] },
        { to: '/teachers', icon: <UserCog size={20} />, label: 'Teachers', roles: ['principal'] },
        { to: '/students', icon: <Users size={20} />, label: 'Students', roles: ['principal'] },
        { to: '/reports', icon: <FileBarChart size={20} />, label: 'Reports', roles: ['principal'] },
        { to: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics', roles: ['principal'] },
      ];
    } else if (user?.role === 'teacher') {
      return [
        ...baseItems,
        { to: '/teacher-dashboard', icon: <GraduationCap size={20} />, label: 'My Classes', roles: ['teacher'] },
        { to: '/students', icon: <Users size={20} />, label: 'Students', roles: ['teacher'] },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header with close button on mobile */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 lg:h-auto lg:border-none">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-md bg-primary-600 flex items-center justify-center">
                <School size={20} className="text-white" />
              </div>
              <span className="text-lg font-heading font-bold text-gray-900">EMIS</span>
            </div>
            <button
              className="lg:hidden text-gray-500 hover:text-gray-600"
              onClick={toggleSidebar}
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} />
            ))}
            
            <div className="pt-4 mt-4 border-t border-gray-200">
              <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
            </div>
          </nav>
          
          {/* Help section */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <HelpCircle size={20} className="text-primary-600 mr-2" />
                <h4 className="text-sm font-medium text-primary-700">Need help?</h4>
              </div>
              <p className="text-xs text-primary-600 mb-3">
                Check our documentation or contact support for assistance.
              </p>
              <button className="text-xs bg-white text-primary-700 hover:bg-primary-700 hover:text-white px-3 py-1.5 rounded border border-primary-300 transition-colors duration-150 w-full">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;