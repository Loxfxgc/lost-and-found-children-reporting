import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Create a context for user type (parent or searcher)
const UserTypeContext = createContext();

// Custom hook to use the user type context
export const useUserType = () => useContext(UserTypeContext);

// Provider component to wrap the application
export function UserTypeProvider({ children }) {
    const [userType, setUserType] = useState(localStorage.getItem('userType') || '');
    const [currentUser, setCurrentUser] = useState(null);

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (!user) {
                // Clear user type if signed out
                setUserType('');
                localStorage.removeItem('userType');
            }
        });
        return () => unsubscribe();
    }, []);

    // Persist user type to localStorage whenever it changes
    useEffect(() => {
        if (userType) {
            localStorage.setItem('userType', userType);
        }
    }, [userType]);
    
    return (
        <UserTypeContext.Provider value={{ 
            userType, 
            setUserType,
            currentUser
        }}>
            {children}
        </UserTypeContext.Provider>
    );
} 