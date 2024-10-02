import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './SignUp.css'; // Import CSS

const SignUp = ({ setIsAuthenticated }) => { // Accept setIsAuthenticated as a prop
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSignUp = () => {
        // Temporary logic for signing up
        // You can add more logic here for handling form submission
        setIsAuthenticated(true); // Update authentication state
        navigate('/dashboard'); // Redirect to the dashboard after successful sign-up
    };

    return (
        <div className="sign-up-page">
            <div className="sign-up-box">
                <h1>Sign Up</h1>
                <div className="form-group">
                    <label htmlFor="business-name">Business Name</label>
                    <input type="text" id="business-name" placeholder="Enter your Business Name" />
                </div>
                <div className="form-group">
                    <label htmlFor="user-name">User Name</label>
                    <input type="text" id="user-name" placeholder="Enter your User Name" />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" placeholder="Enter your Email" />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input type="tel" id="phone" placeholder="Enter your Phone Number" />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Business Address</label>
                    <input type="text" id="address" placeholder="Enter your Business Address" />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Generate Password</label>
                    <input type="password" id="password" placeholder="Generate a Password" />
                </div>
                <div className="checkbox-group">
                    <input type="checkbox" id="terms" required />
                    <label htmlFor="terms">I agree to the Terms and Conditions and Privacy Policy</label>
                </div>
                <button className="submit-button" onClick={handleSignUp}>Sign Up</button>
            </div>
        </div>
    );
};

export default SignUp;
