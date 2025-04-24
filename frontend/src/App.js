import React, { useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { UserTypeProvider, useUserType } from './UserTypeContext';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import Login from './Login';
import Register from './Register';
import CreateForm from './components/CreateForm';
import EnquireForm from './components/EnquireForm';
import RoleSelection from './RoleSelection';
import ViewAllForms from './components/ViewAllForms';
import ViewMyEnquiries from './components/ViewMyEnquiries';
import { useAuth } from './services/authService';

function RedirectHandler() {
  const { isAuthenticated } = useAuth();
  const { userType, currentUser } = useUserType();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [hasReports, setHasReports] = useState(true);
  
  // Check if user has submitted any reports
  useEffect(() => {
    if (isAuthenticated && userType === 'parent' && currentUser?.uid) {
      const storedForms = JSON.parse(localStorage.getItem('myForms')) || [];
      const myForms = storedForms.filter(form => form.userId === currentUser.uid);
      setHasReports(myForms.length > 0);
    }
    setLoading(false);
  }, [isAuthenticated, userType, currentUser]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If authenticated and on root route, redirect based on role and reports
  if (isAuthenticated && location.pathname === '/') {
    // If userType exists, skip role selection
    if (userType) {
      // For parent with no reports, go directly to create form
      if (userType === 'parent' && !hasReports) {
        return <Navigate to="/create" replace />;
      }
      
      // For parent with reports, go to my reports
      if (userType === 'parent' && hasReports) {
        return <Navigate to="/my-enquiries" replace />;
      }
      
      // For searcher, go to search page
      if (userType === 'searcher') {
        return <Navigate to="/enquire" replace />;
      }
    }
    
    // No userType, go to role selection
    return <Navigate to="/role-selection" replace />;
  }
  
  return null;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const { userType } = useUserType();

  return (
    <Router>
      {isAuthenticated && <NavBar />}
      <RedirectHandler />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={<Navigate to="/role-selection" replace />} />
        <Route path="/role-selection" element={isAuthenticated ? <RoleSelection /> : <Navigate to="/login" />} />
        <Route path="/create" element={isAuthenticated ? <CreateForm /> : <Navigate to="/login" />} />
        <Route path="/view" element={isAuthenticated ? <ViewAllForms /> : <Navigate to="/login" />} />
        <Route path="/enquire" element={isAuthenticated ? <EnquireForm /> : <Navigate to="/login" />} />
        <Route path="/search" element={isAuthenticated ? <ViewAllForms filter="pending" /> : <Navigate to="/login" />} />
        <Route path="/my-enquiries" element={isAuthenticated ? <ViewMyEnquiries /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
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
