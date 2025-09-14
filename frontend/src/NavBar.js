import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from './services/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from './services/authService';
import { useUserType } from './UserTypeContext';
import LogoutButton from './components/LogoutButton';
import { useTheme } from './ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { userType } = useUserType();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Don't show navbar on login/register pages
  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await signOut(auth);
      logout();
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      
      // Add transition effect before navigation
      document.body.classList.add('fade-out');
      
      // Wait for transition to complete before navigating
      setTimeout(() => {
        navigate('/');
        // Remove the class after navigation
        setTimeout(() => {
          document.body.classList.remove('fade-out');
          setIsLoggingOut(false);
        }, 300);
      }, 300);
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };
  
  const handleLogoClick = () => {
    // Set a flag to indicate this is an intentional navigation to change roles
    sessionStorage.setItem('navbarRedirect', 'true');
    sessionStorage.setItem('changeRole', 'true');
    
    console.log('==== LOGO CLICKED ====');
    console.log('Current location:', location.pathname);
    console.log('Current user type:', userType);
    console.log('Navigating to role selection page to change role...');
    
    // Apply transition effect
    document.body.classList.add('fade-out');
    
    // Navigate to role selection with slight delay for animation
    setTimeout(() => {
      try {
        navigate('/role-selection');
        setTimeout(() => {
          document.body.classList.remove('fade-out');
        }, 300);
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to direct location change if needed
        window.location.href = '/role-selection';
      }
    }, 300);
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
      <div className="logo" style={{ position: 'relative' }}>
        <button 
          onClick={handleLogoClick} 
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
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
          aria-label="Change role"
        >
         Safe connect
        </button>
        
        {showTooltip && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            marginTop: '5px',
            zIndex: 100,
            whiteSpace: 'nowrap'
          }}>
            Click to change your role
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5a5c69',
            fontSize: '1.2rem',
            padding: '5px',
            borderRadius: '50%',
            transition: 'all 0.3s ease'
          }}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
        
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
            <Link to="/view" style={{ 
              textDecoration: 'none', 
              color: location.pathname === '/view' ? '#4e73df' : '#5a5c69',
              fontWeight: location.pathname === '/view' ? 'bold' : 'normal'
            }}>
              View Reports
            </Link>
          </>
        )}
        
        <LogoutButton isLoggingOut={isLoggingOut} onLogout={handleLogout} />
      </div>
    </nav>
  );
};

export default NavBar;