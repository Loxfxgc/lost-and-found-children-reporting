import React, { useCallback } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { UserTypeProvider, useUserType } from './UserTypeContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './NavBar';
import Login from './Login';
import Register from './Register';
import CreateForm from './components/CreateForm';
import EnquireForm from './components/EnquireForm';
import RoleSelection from './RoleSelection';
import ViewAllForms from './components/ViewAllForms';
import ViewMyEnquiries from './components/ViewMyEnquiries';
import { useAuth } from './services/authService';


function AppContent() {
  const { isAuthenticated } = useAuth();
  const { userType } = useUserType();

  return (
    <Router>
      {isAuthenticated && userType && !['/login', '/register'].includes(window.location.pathname) && <NavBar userType={userType} />}
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={<Navigate to="/role-selection" replace />} />
        <Route path="/role-selection" element={isAuthenticated ? <RoleSelection /> : <Navigate to="/login" />} />
        <Route path="/create" element={isAuthenticated ? <CreateForm /> : <Navigate to="/" />} />
        <Route path="/view" element={isAuthenticated ? <ViewAllForms /> : <Navigate to="/" />} />
        <Route path="/enquire" element={isAuthenticated ? <EnquireForm /> : <Navigate to="/" />} />
        <Route path="/search" element={isAuthenticated ? <ViewAllForms filter="pending" /> : <Navigate to="/" />} />
        <Route path="/my-enquiries" element={isAuthenticated ? <ViewMyEnquiries /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function App() {
  const handleResetError = useCallback(() => {
    // Clear any problematic state
    localStorage.removeItem('userType');
    window.location.reload();
  }, []);

  return (
    <ErrorBoundary onReset={handleResetError}>
      <UserTypeProvider>
        <AppContent />
      </UserTypeProvider>
    </ErrorBoundary>
  );
}

export default App;
