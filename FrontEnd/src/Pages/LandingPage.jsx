import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const lp_serviceSectionRef = useRef(null);
    const lp_footerRef = useRef(null);
    const lp_serviceCardsRef = useRef(null);

    const scrollToSection = (ref) => {
        ref.current.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToNextService = () => {
        if (lp_serviceCardsRef.current) {
            lp_serviceCardsRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    return (
        <div className="lp-container">
            <header className="lp-header">
                <div className="lp-logo">
                    <h1 className="lp-logo-text">StockSmart</h1>
                </div>
                <nav className="lp-nav">
                    <button className="lp-nav-button" onClick={() => navigate('/sign-in')}>Sign In</button>
                    <button className="lp-nav-button" onClick={() => scrollToSection(lp_serviceSectionRef)}>Services</button>
                    <button className="lp-nav-button" onClick={() => scrollToSection(lp_footerRef)}>Contact Us</button>
                </nav>
            </header>

            <div className="lp-hero-section">
                <div className="lp-hero-text">
                    <h1 className="lp-hero-heading">An Optimized Inventory Management Using Demand Prediction</h1>
                    <p className="lp-hero-description">Your solution for effective stock management with real-time insights that help businesses optimize their inventory levels and enhance profitability.</p>
                    <button className="lp-get-started-button" onClick={() => navigate('/sign-in')}>Get Started <span>➔</span></button>
                </div>
                <div className="lp-hero-image">
                    <img src="../herosection.jpeg" alt="Hero Illustration" />
                </div>
            </div>

            <div className="lp-ui-screenshot-section">
                <img src="../uidesign.jpg" alt="UI Screenshot" />
                <p>Discover the user-friendly interface that makes inventory management a breeze.</p>
            </div>

            <div className="lp-service-section" ref={lp_serviceSectionRef}>
                <div className="lp-service-cards-container">
                    <div className="lp-service-cards" ref={lp_serviceCardsRef}>
                        <div className="lp-service-card">
                            <h3>Dashboard</h3>
                            <img src="../dashboardcard.jpg" alt="Dashboard Service" />
                            <p>A quick overview of your inventory status and trends.</p>
                        </div>
                        <div className="lp-service-card">
                            <h3>Inventory</h3>
                            <img src="../inventorycard.jpg" alt="Inventory Service" />
                            <p>Manage your stock levels efficiently.</p>
                        </div>
                        <div className="lp-service-card">
                            <h3>Sales</h3>
                            <img src="../salescard.jpg" alt="Sales Service" />
                            <p>Analyze your sales performance.</p>
                        </div>
                        <div className="lp-service-card">
                            <h3>Reports</h3>
                            <img src="../reportscard.jpg" alt="Reports Service" />
                            <p>Generate comprehensive reports.</p>
                        </div>
                        <div className="lp-service-card">
                            <h3>Billing</h3>
                            <img src="../billingcard.jpg" alt="Billing Service" />
                            <p>Streamline your billing processes.</p>
                        </div>
                    </div>
                    <button className="lp-scroll-button" onClick={scrollToNextService}>➔</button>
                </div>
            </div>

            <div className="lp-footer" ref={lp_footerRef}>
                <h2>Contact Us</h2>
                <p>Email: support@stocksmart.com</p>
                <p>Phone: (123) 456-7890</p>
                <div className="lp-feedback-container">
                    <input type="text" className="lp-feedback-input" placeholder="Your feedback..." />
                    <button className="lp-send-button">Send</button>
                </div>
                <p>&copy; 2024 StockSmart. All rights reserved. | Privacy Policy</p>
                <div className="lp-social-icons">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                        <img src="../facebook.svg" alt="Facebook" className="lp-social-icon" />
                    </a>
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                        <img src="../twitter.svg" alt="Twitter" className="lp-social-icon" />
                    </a>
                    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                        <img src="../instagram.svg" alt="Instagram" className="lp-social-icon" />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;