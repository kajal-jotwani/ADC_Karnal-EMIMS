import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 lg:hidden"
              onClick={toggleSidebar}
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 lg:ml-0">
              <h1
                className="text-xl font-heading font-bold text-primary-800 cursor-pointer"
                onClick={() => navigate("/")}
              >
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-1.5 rounded-full text-gray-500 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
              <Bell size={20} />
            </button>

            <div className="border-l h-8 border-gray-200 mx-2"></div>

            <div className="flex items-center">
              <div className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-full hover:bg-gray-100">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                  <User size={18} />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium">
                    {user?.first_name && user?.last_name ? `${user?.first_name} ${user?.last_name}` : "User"}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.role || "Role"}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;