import React, { useState } from 'react';
import { auth, provider } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import GoogleButton from 'react-google-button';
import { useAuth } from './authService';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            console.log('Login successful:', result.user);
            await result.user.getIdToken().then((token) => {
              login(token);
            });
            navigate('/role-selection');
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/popup-blocked') {
                alert('Please enable popups for this website to use Google login');
            } else if (error.code === 'auth/cancelled-popup-request') {
                return;
            } else {
                alert('Failed to login with Google. Please try again.');
            }
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await result.user.getIdToken().then((token) => {
              login(token);
            });
            navigate('/role-selection');
        } catch (error) {
            console.error('Login error:', error);
            alert('Failed to login. Please check your credentials.');
        }
    };

    return (
        <div className="login-page">
            <h1>Safe Connect</h1>
            <h2>Login</h2>
            <div className="login-container">
                <form onSubmit={handleEmailLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <GoogleButton
                    onClick={handleGoogleLogin}
                    label="Login with Google"
                    style={{ margin: '20px auto' }}
                />

                <div className="register-prompt">
                    Don't have an account?{' '}
                    <Link to="/register" style={{color: '#3498db'}}>
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;