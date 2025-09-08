import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import { SchoolProvider } from './contexts/SchoolContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import SchoolDetail from './pages/SchoolDetail';
import Teachers from './pages/Teachers';
import TeacherDashboard from './pages/TeacherDashboard';
import ClassManagement from './pages/ClassManagement';
import Students from './pages/Students';
import Subjects from './pages/Subjects';
import Reports from './pages/Reports';
import DataManagement from './pages/DataManagement';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Analytics from './pages/Analytics';

function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <DataProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="schools" element={<Schools />} />
              <Route path="schools/:id" element={<SchoolDetail />} />
              <Route path="class-management" element={<ClassManagement />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="reports" element={<Reports />} />
              <Route path="data" element={<DataManagement />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </DataProvider>
      </SchoolProvider>
    </AuthProvider>
  );
}

export default App;