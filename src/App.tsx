import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import { SchoolProvider } from './contexts/SchoolContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
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
import DailyAttendance from './pages/DailyAttendance';
import ExamMarks from './pages/ExamMarks';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if(!isAuthenticated){
    return <LoginForm/>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/" element={<Layout />}>
        <Route index element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="schools" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Schools />
          </ProtectedRoute>
        } />
        <Route path="schools/:id" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <SchoolDetail />
          </ProtectedRoute>
        } />
        <Route path="class-management" element={
          <ProtectedRoute requiredRoles={['principal']}>
            <ClassManagement />
          </ProtectedRoute>
        } />
        <Route path="teachers" element={
          <ProtectedRoute requiredRoles={['admin', 'principal']}>
            <Teachers />
          </ProtectedRoute>
        } />
        <Route path="teacher-dashboard" element={
          <ProtectedRoute requiredRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="students" element={
          <ProtectedRoute requiredRoles={['admin', 'principal', 'teacher']}>
            <Students />
          </ProtectedRoute>
        } />
        <Route path="subjects" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <Subjects />
          </ProtectedRoute>
        } />
        <Route path="daily-attendance" element={
          <ProtectedRoute requiredRoles={['teacher']}>
            <DailyAttendance />
          </ProtectedRoute>
        } />
        <Route path="exam-marks" element={
          <ProtectedRoute requiredRoles={['teacher']}>
            <ExamMarks />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute requiredRoles={['admin', 'principal']}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="data" element={
          <ProtectedRoute requiredRoles={['admin']}>
            <DataManagement />
          </ProtectedRoute>
        } />
        <Route path="analytics" element={
          <ProtectedRoute requiredRoles={['admin', 'principal']}>
            <Analytics />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </SchoolProvider>
    </AuthProvider>
  );
}

export default App;