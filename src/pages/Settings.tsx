import React from 'react';
import { Bell, Lock, Database, Users, Globe, LineChart, Mail, LayoutDashboard } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto py-4 px-6">
            <button className="px-4 py-2 text-sm font-medium rounded-md bg-primary-50 text-primary-700 mr-2">
              General
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md mr-2">
              Appearance
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md mr-2">
              Notifications
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md mr-2">
              Data Sources
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md mr-2">
              Permissions
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
              Advanced
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input type="text" className="input" value="Admin User" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" className="input" value="admin@education.gov" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select className="select">
                    <option>District Administrator</option>
                    <option>Block Administrator</option>
                    <option>School Administrator</option>
                    <option>Teacher</option>
                    <option>Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Level</label>
                  <select className="select">
                    <option>Full Access</option>
                    <option>View Only</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button className="btn btn-outline">
                  Cancel
                </button>
                <button className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
            
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Password</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input type="password" className="input" placeholder="••••••••" />
                </div>
                <div className="md:col-span-2">
                  <div className="h-0.5 w-full bg-gray-100 my-1"></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input type="password" className="input" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input type="password" className="input" placeholder="••••••••" />
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button className="btn btn-outline">
                  Cancel
                </button>
                <button className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="p-2 bg-primary-50 rounded-md text-primary-700">
                    <Bell size={20} />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                        <p className="text-sm text-gray-500 mt-1">Receive alerts and notification about system events</p>
                      </div>
                      <div className="flex items-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-2 bg-primary-50 rounded-md text-primary-700">
                    <Database size={20} />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Data Sync Frequency</h3>
                        <p className="text-sm text-gray-500 mt-1">How often to sync data with the Education MIS</p>
                      </div>
                      <div>
                        <select className="select w-40">
                          <option>Daily</option>
                          <option>Twice daily</option>
                          <option>Hourly</option>
                          <option>Manual only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-2 bg-primary-50 rounded-md text-primary-700">
                    <LayoutDashboard size={20} />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Default Dashboard</h3>
                        <p className="text-sm text-gray-500 mt-1">Set your preferred view when opening the application</p>
                      </div>
                      <div>
                        <select className="select w-40">
                          <option>Overview</option>
                          <option>Schools</option>
                          <option>Teachers</option>
                          <option>Students</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="p-2 bg-primary-50 rounded-md text-primary-700">
                    <LineChart size={20} />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Chart Display</h3>
                        <p className="text-sm text-gray-500 mt-1">Set preferred chart type for performance visualization</p>
                      </div>
                      <div>
                        <select className="select w-40">
                          <option>Bar charts</option>
                          <option>Line charts</option>
                          <option>Area charts</option>
                          <option>Combined</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button className="btn btn-outline">
                  Reset to Defaults
                </button>
                <button className="btn btn-primary">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;