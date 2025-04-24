import React, { useEffect, useState, useCallback } from 'react';
import { useUserType } from './UserTypeContext';
import { useNavigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const RoleSelection = () => {
    const navigate = useNavigate();
    const { userType, setUserType } = useUserType();
    const [loading, setLoading] = useState(true);
    
    // Function to check if parent has reports and redirect accordingly
    const checkAndRedirectParent = useCallback(async (uid) => {
        const storedForms = JSON.parse(localStorage.getItem('myForms')) || [];
        const myForms = storedForms.filter(form => form.userId === uid);
        
        if (myForms.length === 0) {
            // No reports, redirect to create form
            navigate('/create', { replace: true });
        } else {
            // Has reports, redirect to my reports
            navigate('/my-enquiries', { replace: true });
        }
    }, [navigate]);
    
    // Function to redirect based on role
    const redirectBasedOnRole = useCallback((role, uid) => {
        if (role === 'parent') {
            checkAndRedirectParent(uid);
        } else if (role === 'searcher') {
            navigate('/enquire', { replace: true });
        }
    }, [navigate, checkAndRedirectParent]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                navigate('/login');
            } else {
                setLoading(false);
                
                // If user already has a role, redirect to appropriate page
                if (userType) {
                    redirectBasedOnRole(userType, user.uid);
                }
            }
        });

        return () => unsubscribe();
    }, [navigate, userType, redirectBasedOnRole]);

    const handleRoleSelect = async (type) => {
        console.log('Role selected:', type);
        try {
            // Update the context and localStorage
            setUserType(type);
            localStorage.setItem('userType', type);
            
            // Get the current user and redirect based on role
            const user = auth.currentUser;
            if (user) {
                redirectBasedOnRole(type, user.uid);
            }
        } catch (error) {
            console.error('Navigation failed:', error);
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
            <h1 style={{ marginBottom: '30px' }}>Select Your Role</h1>
            
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
                    style={{
                        width: '300px',
                        padding: '30px 20px',
                        border: '1px solid #e3e6f0',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1)',
                        backgroundColor: userType === 'parent' ? '#e8f4ff' : 'white'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 0.3rem 2rem 0 rgba(58, 59, 69, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1)';
                    }}
                >
                    <h3 style={{ marginBottom: '15px', color: '#4e73df' }}>Parent / Guardian</h3>
                    <p style={{ color: '#6c757d' }}>
                        If you are a parent or guardian looking to report a missing child.
                    </p>
                </div>
                
                <div
                    onClick={() => handleRoleSelect('searcher')}
                    style={{
                        width: '300px',
                        padding: '30px 20px',
                        border: '1px solid #e3e6f0',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1)',
                        backgroundColor: userType === 'searcher' ? '#e8f4ff' : 'white'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 0.3rem 2rem 0 rgba(58, 59, 69, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1)';
                    }}
                >
                    <h3 style={{ marginBottom: '15px', color: '#4e73df' }}>Searcher / Helper</h3>
                    <p style={{ color: '#6c757d' }}>
                        If you want to help search for missing children or have information about a missing child.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;