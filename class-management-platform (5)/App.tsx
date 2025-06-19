
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { UserRole } from './types';

import LoginScreen from './components/Auth/LoginScreen';
import SetPasswordScreen from './components/Auth/SetPasswordScreen'; // Import new screen
import AdminDashboard from './components/Admin/AdminDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import ParentDashboard from './components/Parent/ParentDashboard';
import LoadingSpinner from './components/UI/LoadingSpinner';
import Navbar from './components/Layout/Navbar';
import PageContainer from './components/Layout/PageContainer';

// Common Pages
import UserProfile from './components/Profile/UserProfile';
import SchoolCalendarPage from './components/Calendar/SchoolCalendarPage';

// Admin Pages
import ManagementHub from './components/Admin/ManagementHub/ManagementHub'; 
import GlobalFeedManager from './components/Admin/GlobalFeedManager';
import AdminSchoolSettings from './components/Admin/AdminSchoolSettings';
// import RoleCodeHistoryViewer from './components/Admin/RoleCodeHistoryViewer'; // No longer a direct route


// Teacher Pages
import TeacherClassView from './components/Teacher/TeacherClassView'; 
import CreatePostForm from './components/Admin/ManagementHub/CreatePostForm';
import TeacherMessages from './components/Teacher/TeacherMessages';

// Parent Pages
import ParentStudentView from './components/Parent/ParentStudentView'; 
import ParentMessages from './components/Parent/ParentMessages';


const App: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bgPage">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/set-password/:userId" element={<SetPasswordScreen />} /> {/* New Route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </HashRouter>
    );
  }

  const commonRoutes = [
    <Route key="profile" path="/profile" element={<UserProfile />} />,
    <Route key="calendar" path="/calendar" element={<SchoolCalendarPage />} />,
  ];

  const renderDashboard = () => {
    switch (currentUser.role) {
      case UserRole.ADMIN:
        return (
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/admin/management-hub" element={<ManagementHub />} /> 
            {/* <Route path="/admin/role-code-history" element={<RoleCodeHistoryViewer />} /> Removed direct route */}
            <Route path="/global-feeds" element={<GlobalFeedManager />} />
            <Route path="/admin/school-settings" element={<AdminSchoolSettings />} />
            {commonRoutes}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        );
      case UserRole.TEACHER:
        return (
          <Routes>
            <Route path="/" element={<TeacherDashboard />} />
            <Route path="/class/:classId/*" element={<TeacherClassView />} /> 
            <Route path="/create-post" element={<CreatePostForm />} />
            <Route path="/class/:classId/create-post" element={<CreatePostForm />} /> 
            <Route path="/messages" element={<TeacherMessages />} />
            {commonRoutes}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        );
      case UserRole.PARENT:
        return (
          <Routes>
            <Route path="/" element={<ParentDashboard />} />
            <Route path="/child/:studentId/*" element={<ParentStudentView />} />
            <Route path="/messages" element={<ParentMessages />} />
            {commonRoutes}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        );
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-bgPage"> {/* Use new bgPage */}
        <Navbar onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <PageContainer isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} userRole={currentUser.role}>
          {renderDashboard()}
        </PageContainer>
      </div>
    </HashRouter>
  );
};

export default App;