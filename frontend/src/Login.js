import React, { useState } from 'react';
import { auth, provider } from './services/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './services/authService';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const storeAuthToken = async (user) => {
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
        
        try {
            // Send token to backend for validation
            const response = await axios.post('/api/auth/login', { idToken: token });
            if (response.data.success) {
                login(token);
            }
        } catch (error) {
            console.error('Backend validation error:', error);
            // Continue anyway as Firebase auth is still valid
            login(token);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, provider);
            await storeAuthToken(result.user);
            navigate('/role-selection');
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/popup-blocked') {
                setError('Please enable popups for this website to use Google login');
            } else if (error.code === 'auth/cancelled-popup-request') {
                // User cancelled the popup, no error needed
            } else {
                setError('Failed to login with Google. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await storeAuthToken(result.user);
            navigate('/role-selection');
        } catch (error) {
            console.error('Login error:', error);
            setError('Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            maxWidth: '400px', 
            margin: '50px auto', 
            padding: '20px', 
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            borderRadius: '5px'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
            
            {error && (
                <div style={{ 
                    backgroundColor: '#f8d7da', 
                    color: '#721c24', 
                    padding: '10px', 
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}
            
            <form onSubmit={handleEmailLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ 
                            width: '100%', 
                            padding: '10px', 
                            borderRadius: '4px',
                            border: '1px solid #ced4da'
                        }}
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ 
                            width: '100%', 
                            padding: '10px', 
                            borderRadius: '4px',
                            border: '1px solid #ced4da'
                        }}
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        backgroundColor: '#4e73df', 
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            
            <div style={{ 
                margin: '20px 0', 
                textAlign: 'center',
                position: 'relative'
            }}>
                <span style={{ 
                    display: 'inline-block',
                    backgroundColor: 'white',
                    padding: '0 10px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    OR
                </span>
                <hr style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    margin: 0,
                    zIndex: 0
                }}/>
            </div>
            
            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{ 
                    width: '100%', 
                    padding: '10px', 
                    backgroundColor: 'white', 
                    color: '#757575',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}
            >
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Continue with Google
            </button>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                Don't have an account? <Link to="/register" style={{ color: '#4e73df' }}>Register here</Link>
            </div>
        </div>
    );
};

export default Login; 