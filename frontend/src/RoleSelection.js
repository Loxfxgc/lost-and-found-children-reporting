import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserType } from './UserTypeContext';
import { useTheme } from './ThemeContext';
import { FaUserShield, FaSearch, FaCheck } from 'react-icons/fa';
import './RoleSelection.css';

const RoleSelection = () => {
    const navigate = useNavigate();
    const { userType, setUserType } = useUserType();
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);

    const handleRoleSelect = async (role) => {
        setLoading(true);
        try {
            await setUserType(role);
            navigate(role === 'parent' ? '/create' : '/view');
        } catch (error) {
            console.error('Error setting role:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="role-selection-container">
            {/* Removed the theme toggle button */}
            
            <div className="role-header">
                <h1>Select Your Role</h1>
            </div>

            {userType && (
                <div className="current-role-banner">
                    Your current role is <strong>{userType}</strong>. You can change your role by selecting a different option below.
                </div>
            )}

            <div className="role-cards-container">
                <div 
                    className={`role-card ${userType === 'parent' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('parent')}
                    role="button"
                    tabIndex={0}
                >
                    <FaUserShield className="role-icon" />
                    <h2 className="role-title">Parent / Guardian</h2>
                    <p className="role-description">
                        If you are a parent or guardian looking to report a missing child.
                    </p>
                    <div className="role-features">
                        <div className="feature-item">
                            <FaCheck className="feature-icon" />
                            Create missing child reports
                        </div>
                        <div className="feature-item">
                            <FaCheck className="feature-icon" />
                            Track report status
                        </div>
                        <div className="feature-item">
                            <FaCheck className="feature-icon" />
                            Receive updates
                        </div>
                    </div>
                </div>

                <div 
                    className={`role-card ${userType === 'searcher' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('searcher')}
                    role="button"
                    tabIndex={0}
                >
                    <FaSearch className="role-icon" />
                    <h2 className="role-title">Searcher / Helper</h2>
                    <p className="role-description">
                        If you want to help search for missing children or have information about a missing child.
                    </p>
                    <div className="role-features">
                        <div className="feature-item">
                            <FaCheck className="feature-icon" />
                            View missing child reports
                        </div>
                        <div className="feature-item">
                            <FaCheck className="feature-icon" />
                            Submit information
                        </div>
                        <div className="feature-item">
                            <FaCheck className="feature-icon" />
                            Help in the search
                        </div>
                    </div>
                </div>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div>Processing your selection...</div>
                </div>
            )}
        </div>
    );
};

export default RoleSelection;