import React from 'react';
import { Link } from 'react-router-dom'; // Ensure Link is imported from react-router-dom
import './SignIn.css'; // Ensure to import the CSS file

const SignIn = ({ setIsAuthenticated }) => {
    const handleSignIn = () => {
        // Temporary logic for signing in
        setIsAuthenticated(true); // Update authentication state
    };

    return (
        <div className="sign-in-page">
            <div className="sign-in-box">
                <div className="form-container">
                    <h1>Sign In</h1>
                    <div className="form-group">
                        <label htmlFor="userid">User ID</label>
                        <input type="text" id="userid" placeholder="Enter your User ID" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="Enter your Password" />
                    </div>
                    <button className="submit-button" onClick={handleSignIn}>Submit</button>
                    <button className="forgot-password-button">Forgot Password?</button>
                </div>
                <div className="image-container">
                    {/* Replace with your vector image */}
                    <img className="vector-image" rel="preload" src="../signin.jpg" as="image" alt="Vector Art" />
                </div>
            </div>
            <div className="signup-prompt">
                Already have an account? 
                <Link to="/sign-up"> {/* Use Link to navigate to Sign Up page */}
                    <button className="signup-button">Sign Up</button>
                </Link>
            </div>
        </div>
    );
};

export default SignIn;
