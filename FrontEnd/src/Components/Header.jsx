import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
    return (
        <header className="stocksmart-header">
            <div className="stocksmart-logo">StockSmart</div>
            <div className="stocksmart-header-icons">
                <div className="stocksmart-search-container">
                    <input type="text" placeholder="Search..." className="stocksmart-search-box" />
                    <button className="stocksmart-icon-button stocksmart-search-button">
                        <img src="/search.png" alt="Search" />
                    </button>
                </div>
                <Link to="/notification" className="stocksmart-icon-button">
                    <img src="/notification.png" alt="Notifications" />
                </Link>
                <Link to="/profile" className="stocksmart-icon-button">
                    <img src="/profile.png" alt="Profile" />
                </Link>
            </div>
        </header>
    );
};

export default Header;