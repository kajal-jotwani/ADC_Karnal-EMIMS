import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between text-gray-500 text-xs">
        <div>
          &copy; {new Date().getFullYear()} Education Department Dashboard
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-primary-600 transition-colors duration-150">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-primary-600 transition-colors duration-150">
            Terms of Service
          </a>
          <a href="#" className="hover:text-primary-600 transition-colors duration-150">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;