import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUp = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        businessName: '',
        userName: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        agreeTerms: false
    });

    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        // Here you would typically send a request to your authentication API
        // For now, we'll just set isAuthenticated to true and navigate
        setIsAuthenticated(true);
        navigate('/dashboard');
    };

    return (
        <div className="sign-up-page">
            <div className="sign-up-box">
                <h1>Sign Up</h1>
                <form onSubmit={handleSignUp}>
                    <div className="form-group">
                        <label htmlFor="businessName">Business Name</label>
                        <input 
                            type="text" 
                            id="businessName" 
                            value={formData.businessName}
                            onChange={handleInputChange}
                            placeholder="Enter your Business Name" 
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userName">User Name</label>
                        <input 
                            type="text" 
                            id="userName" 
                            value={formData.userName}
                            onChange={handleInputChange}
                            placeholder="Enter your User Name" 
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your Email" 
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input 
                            type="tel" 
                            id="phone" 
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your Phone Number" 
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Business Address</label>
                        <input 
                            type="text" 
                            id="address" 
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter your Business Address" 
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Generate Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Generate a Password" 
                            required
                        />
                    </div>
                    <div className="checkbox-group">
                        <input 
                            type="checkbox" 
                            id="agreeTerms" 
                            checked={formData.agreeTerms}
                            onChange={handleInputChange}
                            required 
                        />
                        <label htmlFor="agreeTerms">I agree to the Terms and Conditions and Privacy Policy</label>
                    </div>
                    <button type="submit" className="submit-button">Sign Up</button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;