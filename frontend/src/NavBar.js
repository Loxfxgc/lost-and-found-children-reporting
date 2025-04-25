import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from './services/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from './services/authService';
import { useUserType } from './UserTypeContext';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { userType } = useUserType();
  
  // Don't show navbar on login/register pages
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleLogoClick = () => {
    console.log('==== LOGO CLICKED ====');
    console.log('Current location:', location.pathname);
    console.log('Attempting navigation to role selection page...');
    
    // Set a flag to indicate this is an intentional navigation from navbar
    sessionStorage.setItem('navbarRedirect', 'true');
    console.log('Navigation flag set in sessionStorage:', sessionStorage.getItem('navbarRedirect'));
    
    // Try direct navigation
    try {
      navigate('/role-selection');
      console.log('Navigation function called successfully');
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location if React Router navigation fails
      window.location.href = '/role-selection';
    }
  };
  
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 20px',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #e3e6f0'
    }}>
      <div className="logo">
        <button 
          onClick={handleLogoClick} 
          style={{ 
            textDecoration: 'none', 
            fontWeight: 'bold', 
            fontSize: '1.5rem', 
            color: '#4e73df',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
         Safe connect
        </button>
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Parent role links */}
        {userType === 'parent' && (
          <>
            <Link to="/create" style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/create' ? '#4e73df' : '#5a5c69',
              fontWeight: location.pathname === '/create' ? 'bold' : 'normal'
            }}>
              Report Missing
            </Link>
            <Link to="/my-enquiries" style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/my-enquiries' ? '#4e73df' : '#5a5c69',
              fontWeight: location.pathname === '/my-enquiries' ? 'bold' : 'normal'
            }}>
              My Reports
            </Link>
          </>
        )}
        
        {/* Searcher role links */}
        {userType === 'searcher' && (
          <>
            <Link to="/enquire" style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/enquire' ? '#4e73df' : '#5a5c69',
              fontWeight: location.pathname === '/enquire' ? 'bold' : 'normal'
            }}>
              Search Missing
            </Link>
            <Link to="/view" style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/view' ? '#4e73df' : '#5a5c69',
              fontWeight: location.pathname === '/view' ? 'bold' : 'normal'
            }}>
              View All Reports
            </Link>
          </>
        )}
        
        <button 
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#e74a3b',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar; 