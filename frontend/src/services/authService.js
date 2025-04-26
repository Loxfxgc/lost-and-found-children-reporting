import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (token) => {
    setAuthLoading(true);
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsAuthenticated(true);
    
    // Add transition effect
    document.body.classList.add('fade-in');
    setTimeout(() => {
      document.body.classList.remove('fade-in');
      setAuthLoading(false);
    }, 500);
  };

  const logout = async () => {
    setAuthLoading(true);
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsAuthenticated(false);
    setAuthLoading(false);
  };

  return { isAuthenticated, login, logout, authLoading };
};
