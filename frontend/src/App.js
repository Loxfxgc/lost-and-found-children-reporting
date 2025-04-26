import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { UserTypeProvider, useUserType } from './UserTypeContext';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import Login from './Login';
import Register from './Register';
import CreateForm from './components/CreateForm';
import ViewAllForms from './components/ViewAllForms';
import RoleSelection from './RoleSelection';
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
      
      // For searcher, go to view all reports page with camera functionality
      if (userType === 'searcher') {
        return <Navigate to="/view" replace />;
      }
    } else {
      // No userType, go to role selection only if not already there
      return <Navigate to="/role-selection" replace />;
    }
  }
  
  // Special case: if user is trying to access role-selection directly but already has a role
  if (isAuthenticated && location.pathname === '/role-selection') {
    console.log('Role selection page accessed with auth:', isAuthenticated, 'userType:', userType);
    
    // Check if this is an intentional navigation from the navbar
    const isNavbarNavigation = sessionStorage.getItem('navbarRedirect') === 'true';
    const isChangeRole = sessionStorage.getItem('changeRole') === 'true';
    const isInternalNavigation = document.referrer.includes(window.location.origin);
    
    console.log('Navigation source check:', {
      isNavbarNavigation, 
      isChangeRole,
      isInternalNavigation,
      navbarRedirect: sessionStorage.getItem('navbarRedirect'),
      changeRole: sessionStorage.getItem('changeRole'),
      referrer: document.referrer
    });
    
    // Always allow access to role selection if changing roles
    if (isChangeRole) {
      console.log('Allowing role selection page for role change');
      // Don't remove the changeRole flag here, let RoleSelection handle it
      return null;
    }
    
    // Don't auto-redirect if coming from navbar or internal navigation
    if ((isNavbarNavigation || isInternalNavigation) && userType) {
      console.log('Allowing role selection page to be viewed from intentional navigation');
      // Clear the flag after using it
      if (isNavbarNavigation) {
        sessionStorage.removeItem('navbarRedirect');
      }
      return null;
    }
    
    // Only redirect if they already have a user type and it's not an intentional navigation
    if (userType && !isNavbarNavigation && !isInternalNavigation && !isChangeRole) {
      console.log('User has role, redirecting from role selection to appropriate page');
      if (userType === 'parent' && !hasReports) {
        return <Navigate to="/create" replace />;
      } else if (userType === 'parent' && hasReports) {
        return <Navigate to="/my-enquiries" replace />;
      } else if (userType === 'searcher') {
        return <Navigate to="/view" replace />;
      }
    }
  }
  
  return null;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const { userType } = useUserType();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

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

  // Create custom transition effect without TransitionGroup
  useEffect(() => {
    // Add transition effect on route change
    const pageContainer = document.querySelector('.page-container');
    if (pageContainer) {
      // Check if this is a role-related navigation
      const isRoleChange = 
        (prevPathRef.current === '/role-selection' && location.pathname !== '/role-selection') ||
        (prevPathRef.current !== '/role-selection' && location.pathname === '/role-selection');
      
      // If this is a role change, we already have a fade effect in the handlers
      if (!isRoleChange) {
        pageContainer.classList.add('page-transition-active');
        
        const timer = setTimeout(() => {
          pageContainer.classList.remove('page-transition-active');
        }, 400);
        
        return () => clearTimeout(timer);
      }
    }
    
    // Update the ref with current path for next comparison
    prevPathRef.current = location.pathname;
  }, [location.key, location.pathname]);

  return (
    <>
      {isAuthenticated && <NavBar />}
      <RedirectHandler />
      <div className="page-container">
        <Routes location={location}>
          <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/role-selection" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="/role-selection" element={isAuthenticated ? <RoleSelection /> : <Navigate to="/" />} />
          <Route path="/create" element={isAuthenticated ? <CreateForm /> : <Navigate to="/" />} />
          <Route path="/view" element={isAuthenticated ? <ViewAllForms /> : <Navigate to="/" />} />
          <Route path="/my-enquiries" element={isAuthenticated ? <ViewMyEnquiries /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
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
