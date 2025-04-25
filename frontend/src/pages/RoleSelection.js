import React, { useEffect, useState } from 'react';
import { useUserType } from './UserTypeContext';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import './Forms.css';

const RoleSelection = () => {
    const navigate = useNavigate();
    const userTypeContext = useUserType();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                navigate('/');
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    if (!userTypeContext) {
        console.error('UserTypeContext is not available');
        return <div>Error: Missing context provider</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    const { setUserType } = userTypeContext;

    const handleRoleSelect = async (type) => {
        console.log('Role selected:', type);
        try {
            // First update the context and localStorage
            await new Promise(resolve => {
                setUserType(type);
                localStorage.setItem('userType', type);
                resolve();
            });
            
            // Verify the update took effect
            console.log('Updated userType:', userTypeContext.userType);
            console.log('LocalStorage userType:', localStorage.getItem('userType'));
            
            // Then navigate
            const path = type === 'parent' ? '/create' : '/enquire';
            console.log('Navigating to:', path);
            navigate(path, { replace: true });
        } catch (error) {
            console.error('Navigation failed:', error);
            // Fallback to manual redirect if navigation fails
            window.location.href = type === 'parent' ? '/create' : '/enquire';
        }
    };

    return (
        <div className="role-selection">
            <h1>Select Your Role</h1>
            <div className="role-options">
                <button 
                    onClick={(e) => {
                        console.log('Parent button clicked', e);
                        handleRoleSelect('parent');
                    }}
                    className="role-button parent"
                >
                    I'm a Parent
                    <p>Create and view enquiries about missing children</p>
                </button>
                <button 
                    onClick={(e) => {
                        console.log('Finder button clicked', e);
                        handleRoleSelect('finder');
                    }}
                    className="role-button finder"
                >
                    I Found a Child
                    <p>View and search all pending cases</p>
                </button>
            </div>
        </div>
    );
};
export default RoleSelection;