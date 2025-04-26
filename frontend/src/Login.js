import React, { useState, useEffect } from 'react';
import { auth, provider } from './services/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './services/authService';
import { useUserType } from './UserTypeContext';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const { login, authLoading } = useAuth();
    const { setUserType } = useUserType();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);

    // Animation effect when component mounts
    useEffect(() => {
        // Slight delay for better visual effect
        setTimeout(() => setFormVisible(true), 100);
    }, []);

    const storeAuthToken = async (user) => {
        const token = await user.getIdToken();
        localStorage.setItem('token', token);
        
        try {
            // Send token to backend for validation
            const response = await axios.post('/api/auth/login', { idToken: token });
            if (response.data.success) {
                await login(token);
            }
        } catch (error) {
            console.error('Backend validation error:', error);
            // Continue anyway as Firebase auth is still valid
            await login(token);
        }
    };

    // Handle redirection after authentication
    const handlePostLoginRedirect = (user) => {
        const storedUserType = localStorage.getItem('userType');
        
        if (storedUserType) {
            setUserType(storedUserType);
            
            // Check if parent and has reports
            if (storedUserType === 'parent') {
                const storedForms = JSON.parse(localStorage.getItem('myForms')) || [];
                const myForms = storedForms.filter(form => form.userId === user.uid);
                
                if (myForms.length === 0) {
                    // No reports, go to create form
                    navigate('/create', { replace: true });
                } else {
                    // Has reports, go to my reports
                    navigate('/my-enquiries', { replace: true });
                }
            } else if (storedUserType === 'searcher') {
                // Searcher, go to enquiry page
                navigate('/enquire', { replace: true });
            }
        } else {
            // No role selected, go to role selection
            navigate('/role-selection', { replace: true });
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, provider);
            await storeAuthToken(result.user);
            handlePostLoginRedirect(result.user);
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
            handlePostLoginRedirect(result.user);
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Failed to login. Please check your credentials.';
            
            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password. Please try again.';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email. Please register.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format. Please check your email.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            backgroundColor: '#f8f9fa'
        }}>
            <div className={`login-card ${formVisible ? 'visible' : ''}`} style={{
                width: '100%',
                maxWidth: '360px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                padding: '28px',
                transition: 'all 0.4s ease-in-out',
                opacity: formVisible ? 1 : 0,
                transform: formVisible ? 'translateY(0)' : 'translateY(20px)',
            }}>
                <div className="login-header" style={{
                    textAlign: 'center',
                    marginBottom: '24px'
                }}>
                    <h1 style={{
                        fontSize: '22px',
                        fontWeight: '600',
                        color: '#333',
                        margin: '0 0 8px 0'
                    }}>Welcome Back</h1>
                    <p style={{
                        fontSize: '14px',
                        color: '#777',
                        margin: 0
                    }}>Sign in to continue to Safe Connect</p>
                </div>
                
                {error && (
                    <div className="error-alert" style={{
                        backgroundColor: '#fff0f0',
                        color: '#e53935',
                        padding: '10px 12px',
                        borderRadius: '4px',
                        marginBottom: '16px',
                        fontSize: '13px',
                        animation: 'shake 0.5s'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleEmailLogin} style={{ marginBottom: '16px' }}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="email" style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: '13px',
                            color: '#666'
                        }}>Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                borderRadius: '20px',
                                border: '1px solid #e0e0e0',
                                outline: 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Enter your email"
                        />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '6px'
                        }}>
                            <label htmlFor="password" style={{
                                fontWeight: '500',
                                fontSize: '13px',
                                color: '#666'
                            }}>Password</label>
                            <a href="#" style={{
                                fontSize: '12px',
                                color: '#3f51b5',
                                textDecoration: 'none'
                            }}>Forgot password?</a>
                        </div>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                borderRadius: '20px',
                                border: '1px solid #e0e0e0',
                                outline: 'none',
                                transition: 'border 0.2s, box-shadow 0.2s',
                                boxSizing: 'border-box'
                            }}
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading || authLoading}
                        className="login-button"
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#3f51b5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: (loading || authLoading) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }}
                    >
                        {(loading || authLoading) ? (
                            <span className="spinner" style={{
                                display: 'inline-block',
                                width: '16px',
                                height: '16px',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                borderTopColor: 'white',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }}></span>
                        ) : 'Sign In'}
                    </button>
                </form>
                
                <div className="divider" style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '16px 0',
                    color: '#aaa',
                    fontSize: '12px'
                }}>
                    <span style={{
                        flex: 1,
                        height: '1px',
                        backgroundColor: '#eee'
                    }}></span>
                    <span style={{
                        margin: '0 10px'
                    }}>OR</span>
                    <span style={{
                        flex: 1,
                        height: '1px',
                        backgroundColor: '#eee'
                    }}></span>
                </div>
                
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading || authLoading}
                    className="google-button"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'white',
                        color: '#666',
                        border: '1px solid #e0e0e0',
                        borderRadius: '20px',
                        cursor: (loading || authLoading) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: '500',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                        marginBottom: '16px'
                    }}
                >
                    {(loading || authLoading) && (
                        <span className="spinner" style={{
                            display: 'inline-block',
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(0, 0, 0, 0.1)',
                            borderTopColor: '#4285f4',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                        }}></span>
                    )}
                    {!(loading || authLoading) && (
                        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                    )}
                    <span>{(loading || authLoading) ? 'Signing in...' : 'Continue with Google'}</span>
                </button>
                
                <div className="signup-link" style={{
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#777'
                }}>
                    Don't have an account? <Link to="/register" style={{
                        color: '#3f51b5',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}>Sign Up</Link>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                .login-button:hover {
                    background-color: #303f9f;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                
                .google-button:hover {
                    background-color: #f1f3f4;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                }
                
                input:focus {
                    border-color: #3f51b5;
                    box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
                }
                
                .form-group:hover label {
                    color: #3f51b5;
                }
            `}</style>
        </div>
    );
};

export default Login; 