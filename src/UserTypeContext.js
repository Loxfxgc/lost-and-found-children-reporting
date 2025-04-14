import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const UserTypeContext = createContext();

export function UserTypeProvider({ children }) {
    const [userType, setUserType] = useState(localStorage.getItem('userType') || '');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (!user) {
                setUserType('');
                localStorage.removeItem('userType');
            }
        });
        return () => unsubscribe();
    }, []);

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

export function useUserType() {
    return useContext(UserTypeContext);
}
