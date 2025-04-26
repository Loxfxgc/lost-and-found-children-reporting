import React, { useState, useEffect } from 'react';
import './LogoutButton.css';

const LogoutButton = ({ isLoggingOut, onLogout }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLogoutClick = () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsAnimating(true);
    
    // Call the parent's logout function after animation starts
    setTimeout(() => {
      onLogout();
    }, 300);
  };

  // Reset animation state when logging out completes
  useEffect(() => {
    if (!isLoggingOut && isAnimating) {
      setIsAnimating(false);
    }
  }, [isLoggingOut, isAnimating]);

  return (
    <button 
      className={`logout-button ${isAnimating ? 'animating' : ''}`} 
      onClick={handleLogoutClick}
      disabled={isLoggingOut}
    >
      <div className="door-icon">
        <div className="door-frame"></div>
        <div className="door"></div>
        <div className="doorknob"></div>
        <div className="arrow"></div>
      </div>
      <span className="logout-text">
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </span>
      {isLoggingOut && (
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      )}
    </button>
  );
};

export default LogoutButton; 