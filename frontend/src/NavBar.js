import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from './services/authService';

const NavBar = ({ userType }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      logout();
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
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
        <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold', fontSize: '1.5rem', color: '#4e73df' }}>
          Lost & Found Children
        </Link>
      </div>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        {userType === 'parent' && (
          <>
            <Link to="/create" style={{ textDecoration: 'none', color: '#5a5c69' }}>Report Missing</Link>
            <Link to="/my-reports" style={{ textDecoration: 'none', color: '#5a5c69' }}>My Reports</Link>
          </>
        )}
        
        {userType === 'searcher' && (
          <>
            <Link to="/search" style={{ textDecoration: 'none', color: '#5a5c69' }}>Search Missing</Link>
            <Link to="/enquire" style={{ textDecoration: 'none', color: '#5a5c69' }}>Make Enquiry</Link>
            <Link to="/my-enquiries" style={{ textDecoration: 'none', color: '#5a5c69' }}>My Enquiries</Link>
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