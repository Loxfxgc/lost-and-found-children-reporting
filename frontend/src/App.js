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
import LandingPage from './pages/LandingPage';
import { setupStorageListener, startFormPolling, stopFormPolling, formService } from './services/api';

// Initialize global real-time updates
const initializeRealTimeUpdates = () => {
  console.log('Initializing real-time updates system');
  setupStorageListener();
  startFormPolling(30000); // Check every 30 seconds at app level
  
  // Clear any localStorage data since we're moving entirely to MongoDB
  console.log('Migrating to MongoDB - clearing any localStorage data');
  localStorage.removeItem('forms');
  localStorage.removeItem('myForms');
};

function RedirectHandler() {
  const { isAuthenticated } = useAuth();
  const { userType, currentUser } = useUserType();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [hasReports, setHasReports] = useState(true);
  
  // Check if user has submitted any reports
  useEffect(() => {
    if (isAuthenticated && userType === 'parent' && currentUser?.uid) {
      // Using the database to check for reports instead of localStorage
      const checkReports = async () => {
        try {
          setLoading(true);
          const response = await formService.getMyForms(currentUser.uid);
          const myForms = response.data || response;
          setHasReports(Array.isArray(myForms) && myForms.length > 0);
        } catch (error) {
          console.error('Error checking for user reports:', error);
          setHasReports(false);
        } finally {
          setLoading(false);
        }
      };
      
      checkReports();
    } else {
      setLoading(false);
    }
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
  // eslint-disable-next-line no-unused-vars
  const { userType } = useUserType();

  // Set up real-time updates at app level
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated, initializing real-time updates');
      initializeRealTimeUpdates();
      
      return () => {
        console.log('Cleaning up real-time updates');
        stopFormPolling();
      };
    }
  }, [isAuthenticated]);

  return (
    <>
      {isAuthenticated && <NavBar />}
      <RedirectHandler />
      <Routes>
        <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/role-selection" />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/role-selection" element={isAuthenticated ? <RoleSelection /> : <Navigate to="/login" />} />
        <Route path="/create" element={isAuthenticated ? <CreateForm /> : <Navigate to="/login" />} />
        <Route path="/view" element={isAuthenticated ? <ViewAllForms /> : <Navigate to="/login" />} />
        <Route path="/enquire" element={isAuthenticated ? <EnquireForm /> : <Navigate to="/login" />} />
        <Route path="/search" element={isAuthenticated ? <ViewAllForms filter="pending" /> : <Navigate to="/login" />} />
        <Route path="/my-enquiries" element={isAuthenticated ? <ViewMyEnquiries /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  const handleResetError = useCallback(() => {
    localStorage.removeItem('userType');
    window.location.reload();
  }, []);

  return (
    <ErrorBoundary onReset={handleResetError}>
      <UserTypeProvider>
        <Router>
          <AppContent />
        </Router>
      </UserTypeProvider>
    </ErrorBoundary>
  );
}

export default App;
