import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SignIn.css';

const SignIn = ({ setIsAuthenticated }) => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = (e) => {
        e.preventDefault();
        // Temporary logic for signing in
        setIsAuthenticated(true);
        // Here you would typically send a request to your authentication API
    };

    return (
        <div className="sign-in-page">
            <div className="sign-in-box">
                <div className="form-container">
                    <h2 className="sign-in-title">Sign In</h2>
                    <form onSubmit={handleSignIn}>
                        <div className="form-group">
                            <label htmlFor="userId">User ID</label>
                            <input
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
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
                        <button type="submit" className="submit-button">Submit</button>
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