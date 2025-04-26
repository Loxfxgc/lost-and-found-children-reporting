import React, { useEffect, useState, useCallback } from 'react';
import { useUserType } from './UserTypeContext';
import { useNavigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { formService } from './services/api';

const RoleSelection = () => {
    const navigate = useNavigate();
    const { userType, setUserType } = useUserType();
    const [loading, setLoading] = useState(true);
    const [showChangeMessage, setShowChangeMessage] = useState(false);
    
    // Function to check if parent has reports and redirect accordingly
    const checkAndRedirectParent = useCallback(async (uid) => {
        try {
            const response = await formService.getMyForms(uid);
            const myForms = response.data || response;
            
            if (!Array.isArray(myForms) || myForms.length === 0) {
                // No reports, redirect to create form
                navigate('/create', { replace: true });
            } else {
                // Has reports, redirect to my reports
                navigate('/my-enquiries', { replace: true });
            }
        } catch (error) {
            console.error('Error checking for user reports:', error);
            // Default to create form if there's an error
            navigate('/create', { replace: true });
        }
    }, [navigate]);
    
    // Function to redirect based on role
    const redirectBasedOnRole = useCallback((role, uid) => {
        if (role === 'parent') {
            checkAndRedirectParent(uid);
        } else if (role === 'searcher') {
            navigate('/view', { replace: true });
        }
    }, [navigate, checkAndRedirectParent]);

    useEffect(() => {
        console.log('==== ROLE SELECTION COMPONENT MOUNTED ====');
        console.log('Current userType:', userType);
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed, user:', user ? 'authenticated' : 'not authenticated');
            
            if (!user) {
                console.log('No user, redirecting to landing page');
                navigate('/');
            } else {
                console.log('User authenticated, stopping loading state');
                setLoading(false);
                
                // Check if this is an intentional navigation to role selection
                const navbarRedirect = sessionStorage.getItem('navbarRedirect');
                const changeRole = sessionStorage.getItem('changeRole');
                const hasReferrer = document.referrer.includes(window.location.origin);
                const isIntentionalNavigation = navbarRedirect === 'true' || hasReferrer;
                
                console.log('Navigation details:', {
                    navbarRedirect,
                    changeRole,
                    hasReferrer,
                    isIntentionalNavigation,
                    currentUrl: window.location.href,
                    referrer: document.referrer
                });
                
                // Only auto-redirect if not an intentional navigation and user already has a role
                if (userType && !isIntentionalNavigation) {
                    console.log('Auto-redirecting based on existing role:', userType);
                    redirectBasedOnRole(userType, user.uid);
                } else if (userType && isIntentionalNavigation) {
                    // If user intentionally navigated here and already has a role,
                    // show a message indicating they can change their role
                    setShowChangeMessage(true);
                    console.log('Showing role selection page with change message (no auto-redirect)');
                    
                    // If the changeRole flag is set, highlight the message for better visibility
                    if (changeRole === 'true') {
                        setTimeout(() => {
                            const messageElement = document.querySelector('.role-change-message');
                            if (messageElement) {
                                messageElement.classList.add('highlight-message');
                                // Remove the highlight after animation completes
                                setTimeout(() => {
                                    messageElement.classList.remove('highlight-message');
                                }, 1000);
                            }
                        }, 300);
                    }
                } else {
                    console.log('Showing role selection page (no auto-redirect)');
                }
                
                // Clear the navigation flags
                sessionStorage.removeItem('navbarRedirect');
                sessionStorage.removeItem('changeRole');
                console.log('Navigation flags cleared from sessionStorage');
            }
        });

        return () => {
            console.log('==== ROLE SELECTION COMPONENT UNMOUNTING ====');
            unsubscribe();
        };
    }, [navigate, userType, redirectBasedOnRole]);

    const handleRoleSelect = async (type) => {
        console.log('Role selected:', type);
        try {
            // If the user is changing their role, show a message
            if (userType && userType !== type) {
                setShowChangeMessage(false);
                console.log(`Role changed from ${userType} to ${type}`);
                
                // Add transition effect
                document.body.classList.add('fade-out');
            }
            
            // Update the context and localStorage
            setUserType(type);
            localStorage.setItem('userType', type);
            
            // Get the current user and redirect based on role
            const user = auth.currentUser;
            if (user) {
                // Add a small delay for better UX when changing roles
                const isChangingRole = userType && userType !== type;
                
                if (isChangingRole) {
                    // Wait for transition effect
                    setTimeout(() => {
                        redirectBasedOnRole(type, user.uid);
                        
                        // Remove transition effect after navigation starts
                        setTimeout(() => {
                            document.body.classList.remove('fade-out');
                        }, 300);
                    }, 300);
                } else {
                    // No role change, redirect immediately
                    redirectBasedOnRole(type, user.uid);
                }
            }
        } catch (error) {
            console.error('Navigation failed:', error);
            // Remove transition effect if there was an error
            document.body.classList.remove('fade-out');
            
            // Show error message to user
            alert('Failed to update role. Please try again.');
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '800px',
            margin: '50px auto',
            padding: '20px',
            textAlign: 'center'
        }}>
            <h1 style={{ marginBottom: '20px' }}>Select Your Role</h1>
            
            {showChangeMessage && (
                <div 
                    className="role-change-message"
                    style={{
                        padding: '15px',
                        margin: '0 auto 30px',
                        backgroundColor: '#e8f4ff',
                        borderRadius: '5px',
                        border: '1px solid #4e73df',
                        maxWidth: '600px',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <p style={{ color: '#4e73df', margin: '0' }}>
                        <strong>Role Change:</strong> Your current role is <strong>{userType === 'parent' ? 'Parent/Guardian' : 'Searcher/Helper'}</strong>. 
                        You can change your role by selecting a different option below.
                    </p>
                </div>
            )}
            
            <p style={{ marginBottom: '40px', color: '#6c757d' }}>
                Please select your role to continue. This will determine the features available to you.
            </p>
            
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '30px',
                flexWrap: 'wrap'
            }}>
                <div
                    onClick={() => handleRoleSelect('parent')}
                    className={`role-card ${userType === 'parent' ? 'active' : ''}`}
                    style={{
                        width: '300px',
                        padding: '30px 20px',
                        border: '1px solid #e3e6f0',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1)',
                        position: 'relative'
                    }}
                >
                    <h3 style={{ marginBottom: '15px', color: '#4e73df' }}>Parent / Guardian</h3>
                    <p style={{ color: '#6c757d' }}>
                        If you are a parent or guardian looking to report a missing child.
                    </p>
                    {userType === 'parent' && (
                        <div className="current-role-badge">
                            Current Role
                        </div>
                    )}
                </div>
                
                <div
                    onClick={() => handleRoleSelect('searcher')}
                    className={`role-card ${userType === 'searcher' ? 'active' : ''}`}
                    style={{
                        width: '300px',
                        padding: '30px 20px',
                        border: '1px solid #e3e6f0',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1)',
                        position: 'relative'
                    }}
                >
                    <h3 style={{ marginBottom: '15px', color: '#4e73df' }}>Searcher / Helper</h3>
                    <p style={{ color: '#6c757d' }}>
                        If you want to help search for missing children or have information about a missing child.
                    </p>
                    {userType === 'searcher' && (
                        <div className="current-role-badge">
                            Current Role
                        </div>
                    )}
                </div>
            </div>
            
            {/* Add CSS for the highlight animation */}
            <style>
                {`
                    @keyframes highlightMessage {
                        0% { background-color: #e8f4ff; }
                        50% { background-color: #c5e1ff; }
                        100% { background-color: #e8f4ff; }
                    }
                    .highlight-message {
                        animation: highlightMessage 1s ease;
                    }
                `}
            </style>
        </div>
    );
};

export default RoleSelection;