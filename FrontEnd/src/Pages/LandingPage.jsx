import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    // References for scrolling
    const serviceSectionRef = useRef(null);
    const footerRef = useRef(null);
    const serviceCardsRef = useRef(null);

    const scrollToSection = (ref) => {
        ref.current.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToNextService = () => {
        if (serviceCardsRef.current) {
            serviceCardsRef.current.scrollBy({ left: 300, behavior: 'smooth' }); // Adjust the scroll amount as needed
        }
    };

    return (
        <div>
            {/* Header Section */}
            <header className="landingheader">
                <div className="logo">
                    <h1 style={{ fontSize: '36px', display: 'inline', color: '#0078BB' }}>Stock</h1>
                    <h1 style={{ fontSize: '36px', display: 'inline', color: '#00A3FF' }}>Smart</h1>
                </div>
                <nav className="nav">
                    <button className="nav-button" onClick={() => navigate('/sign-in')}>Sign In</button>
                    <button className="nav-button" onClick={() => scrollToSection(serviceSectionRef)}>Services</button>
                    <button className="nav-button" onClick={() => scrollToSection(footerRef)}>Contact Us</button>
                </nav>
            </header>

            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-text">
                    <h1 className="hero-heading">An Optimized Inventory Management Using Demand Prediction</h1>
                    <p className="hero-description">Your solution for effective stock management with real-time insights that help businesses optimize their inventory levels and enhance profitability.</p>
                    <button className="get-started-button" onClick={() => navigate('/sign-in')}>Get Started <span>➔</span></button>
                </div>
                <div className="hero-image">
                    <img src="../herosection.png" alt="Hero Illustration" />
                </div>
            </div>

            {/* UI Screenshot Section */}
            <div className="ui-screenshot-section">
                <img src="../uidesign.jpg" alt="UI Screenshot" />
                <p>Discover the user-friendly interface that makes inventory management a breeze.</p>
            </div>

            {/* Services Section */}
            <div className="service-section" ref={serviceSectionRef}>
                <div className="service-cards" ref={serviceCardsRef}>
                    <div className="service-card">
                        <h3>Dashboard</h3>
                        <img src="../dashboardcard.jpg" alt="Dashboard Service" />
                        <p>A quick overview of your inventory status and trends.</p>
                    </div>
                    <div className="service-card">
                        <h3>Inventory</h3>
                        <img src="../inventorycard.jpg" alt="Inventory Service" />
                        <p>Manage your stock levels efficiently.</p>
                    </div>
                    <div className="service-card">
                        <h3>Sales</h3>
                        <img src="../salescard.jpg" alt="Sales Service" />
                        <p>Analyze your sales performance.</p>
                    </div>
                    <div className="service-card">
                        <h3>Reports</h3>
                        <img src="../reportscard.jpg" alt="Reports Service" />
                        <p>Generate comprehensive reports.</p>
                    </div>
                    <div className="service-card">
                        <h3>Billing</h3>
                        <img src="../billingcard.jpg" alt="Billing Service" />
                        <p>Streamline your billing processes.</p>
                    </div>
                </div>
                <button className="scroll-button" onClick={scrollToNextService}>➔</button>
            </div>

            {/* Footer Section */}
            <div className="footer" ref={footerRef}>
                <h2>Contact Us</h2>
                <p>Email: support@stocksmart.com</p>
                <p>Phone: (123) 456-7890</p>
                <div className="feedback-container">
                    <input type="text" className="feedback-input" placeholder="Your feedback..." />
                    <button className="send-button">Send</button>
                </div>
                <p>&copy; 2024 StockSmart. All rights reserved. | Privacy Policy</p>
                <div className="social-icons">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                        <img src="../facebook.svg" alt="Facebook" className="social-icon" />
                    </a>
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                        <img src="../twitter.svg" alt="Twitter" className="social-icon" />
                    </a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                        <img src="../instagram.svg" alt="Instagram" className="social-icon" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
