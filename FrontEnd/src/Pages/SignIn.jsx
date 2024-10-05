import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import './SignIn.css';

const SignIn = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ email, password });
            localStorage.setItem('token', response.access_token);
            setIsAuthenticated(true);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.error || 'Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="sign-in-page">
            <div className="sign-in-box">
                <div className="form-container">
                    <h2 className="sign-in-title">Sign In</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleSignIn}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="submit-button">Sign In</button>
                    </form>
                    <button className="forgot-password-button">Forgot Password?</button>
                    <p className="signup-prompt">
                        Don't have an account? <Link to="/sign-up" className="signup-button">Sign Up</Link>
                    </p>
                </div>
                <div className="image-container">
                    <img src="/signin.png" alt="Sign In" className="vector-image" />
                </div>
            </div>
        </div>
    );
};

export default SignIn;