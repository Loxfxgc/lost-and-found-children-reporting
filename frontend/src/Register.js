import React, { useState, useEffect } from 'react';
import { auth } from './services/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);

    // Animation effect when component mounts
    useEffect(() => {
        // Slight delay for better visual effect
        setTimeout(() => setFormVisible(true), 100);
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        // Validate form
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            // Create the user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update the user profile with display name
            await updateProfile(userCredential.user, {
                displayName: name
            });
            
            // Get the ID token
            const idToken = await userCredential.user.getIdToken();
            localStorage.setItem('token', idToken);
            
            // Register the user in our backend
            try {
                await axios.post('/api/auth/register', { 
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: name
                });
            } catch (error) {
                console.error('Backend registration error:', error);
                // Continue anyway as the Firebase user is created
            }
            
            // Navigate to role selection
            navigate('/role-selection');
        } catch (error) {
            console.error('Registration error:', error);
            if (error.code === 'auth/email-already-in-use') {
                setError('Email already in use. Please use a different email or try logging in.');
            } else {
                setError(error.message || 'Failed to register. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            backgroundColor: '#f8f9fa'
        }}>
            <div className={`register-card ${formVisible ? 'visible' : ''}`} style={{
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
                <div className="register-header" style={{
                    textAlign: 'center',
                    marginBottom: '24px'
                }}>
                    <h1 style={{
                        fontSize: '22px',
                        fontWeight: '600',
                        color: '#333',
                        margin: '0 0 8px 0'
                    }}>Create Account</h1>
                    <p style={{
                        fontSize: '14px',
                        color: '#777',
                        margin: 0
                    }}>Join Safe Connect today</p>
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
                
                <form onSubmit={handleRegister}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="name" style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: '13px',
                            color: '#666'
                        }}>Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                            placeholder="Enter your full name"
                        />
                    </div>
                    
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
                    
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="password" style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: '13px',
                            color: '#666'
                        }}>Password</label>
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
                            placeholder="Create a password"
                        />
                        <small style={{ 
                            color: '#888', 
                            fontSize: '12px', 
                            display: 'block',
                            marginTop: '4px',
                            marginLeft: '4px'
                        }}>
                            Password must be at least 6 characters
                        </small>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="confirmPassword" style={{
                            display: 'block',
                            marginBottom: '6px',
                            fontWeight: '500',
                            fontSize: '13px',
                            color: '#666'
                        }}>Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            placeholder="Confirm your password"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="register-button"
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#3f51b5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                        }}
                    >
                        {loading ? (
                            <span className="spinner" style={{
                                display: 'inline-block',
                                width: '16px',
                                height: '16px',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                borderTopColor: 'white',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }}></span>
                        ) : 'Create Account'}
                    </button>
                </form>
                
                <div className="login-link" style={{
                    textAlign: 'center',
                    marginTop: '16px',
                    fontSize: '13px',
                    color: '#777'
                }}>
                    Already have an account? <Link to="/login" style={{
                        color: '#3f51b5',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}>Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default Register; 