import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import './NavBar.css';

const NavBar = ({ userType }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('userType');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Lost & Found</Link>
      </div>
      <div className="navbar-links">
        {userType === 'parent' && (
          <>
            <Link to="/create" className="nav-button">Create Enquiry</Link>
            <Link to="/view" className="nav-button">View Submissions</Link>
            <Link to="/my-enquiries" className="nav-button">View My Enquiries</Link>
          </>
        )}
        {userType === 'finder' && (
          <>
            <Link to="/enquire" className="nav-button">All Forms</Link>
            <Link to="/search" className="nav-button">Pending Forms</Link>
          </>
        )}
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </nav>
  );
};

export default NavBar;
