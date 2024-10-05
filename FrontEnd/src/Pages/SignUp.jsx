import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import './SignUp.css';

const SignUp = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        businessType: '',
        businessLocation: '',
        helplineNumber: '',
        gstNumber: '',
    });
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;
        setPasswordStrength(strength);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        if (passwordStrength < 3) {
            setError("Password is not strong enough");
            return;
        }
        try {
            await registerUser(formData);
            setIsAuthenticated(true);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.error || 'An error occurred during registration. Please try again.');
        }
    };

    return (
        <div className="stocksmart-signup-page">
            <div className="stocksmart-signup-box">
                <h1 className="stocksmart-signup-title">Sign Up</h1>
                {error && <p className="stocksmart-signup-error">{error}</p>}
                <form onSubmit={handleSignUp} className="stocksmart-signup-form">
                    <div className="stocksmart-form-group">
                        <label htmlFor="name" className="stocksmart-form-label">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="stocksmart-form-input"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="stocksmart-form-group">
                        <label htmlFor="phone" className="stocksmart-form-label">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="stocksmart-form-input"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="stocksmart-form-group">
                        <label htmlFor="email" className="stocksmart-form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="stocksmart-form-input"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="stocksmart-form-group">
                        <label htmlFor="businessName" className="stocksmart-form-label">Business Name</label>
                        <input
                            type="text"
                            id="businessName"
                            name="businessName"
                            className="stocksmart-form-input"
                            value={formData.businessName}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="stocksmart-form-group">
                        <label htmlFor="businessType" className="stocksmart-form-label">Business Type</label>
                        <input
                            type="text"
                            id="businessType"
                            name="businessType"
                            className="stocksmart-form-input"
                            value={formData.businessType}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="stocksmart-form-group">
                        <label htmlFor="businessLocation" className="stocksmart-form-label">Business Location</label>
                        <input
                            type="text"
                            id="businessLocation"
                            name="businessLocation"
                            className="stocksmart-form-input"
                            value={formData.businessLocation}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="stocksmart-form-group">
                        <label htmlFor="helplineNumber" className="stocksmart-form-label">Helpline Number</label>
                        <input
                            type="tel"
                            id="helplineNumber"
                            name="helplineNumber"
                            className="stocksmart-form-input"
                            value={formData.helplineNumber}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="stocksmart-form-group">
                        <label htmlFor="gstNumber" className="stocksmart-form-label">GST Number</label>
                        <input
                            type="text"
                            id="gstNumber"
                            name="gstNumber"
                            className="stocksmart-form-input"
                            value={formData.gstNumber}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="stocksmart-form-group">
                        <label htmlFor="password" className="stocksmart-form-label">Create Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="stocksmart-form-input"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                        <div className="stocksmart-password-strength">
                            <div className={`stocksmart-strength-meter stocksmart-strength-${passwordStrength}`}></div>
                            <span className="stocksmart-strength-text">
                                Password strength: {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength]}
                            </span>
                        </div>
                    </div>
                    <div className="stocksmart-form-group">
                        <label htmlFor="confirmPassword" className="stocksmart-form-label">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="stocksmart-form-input"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <button type="submit" className="stocksmart-submit-button">Sign Up</button>
                </form>
                <p className="stocksmart-signin-link">
                    Already have an account? <Link to="/sign-in">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;