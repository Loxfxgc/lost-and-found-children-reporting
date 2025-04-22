import React, { useState } from 'react';
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
        <div style={{ 
            maxWidth: '400px', 
            margin: '50px auto', 
            padding: '20px', 
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            borderRadius: '5px'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Register</h2>
            
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
            
            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Full Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                    <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                        Password must be at least 6 characters
                    </small>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px' }}>Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                Already have an account? <Link to="/login" style={{ color: '#4e73df' }}>Login here</Link>
            </div>
        </div>
    );
};

export default Register; 