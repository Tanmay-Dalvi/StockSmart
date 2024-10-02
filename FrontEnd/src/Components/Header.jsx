import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
    return (
        <header className="header">
            <div className="logo">
                <span style={{ color: "#0078BB" }}>Stock</span>
                <span style={{ color: "#00A3FF" }}>Smart</span>
            </div>
            <div className="header-icons">
                <div className="search-container">
                    <input type="text" placeholder="Search..." className="search-box" />
                    <button className="icon-button">
                        <img src="/search.png" alt="Search Icon" className="search-icon" />
                    </button>
                </div>
                <Link to="/notification" className="icon-button">
                    <img src="/notification.png" alt="Notification Icon" className="notification" />
                </Link>
                <Link to="/profile" className="icon-button">
                    <img src="/profile.png" alt="Profile Icon" className="profile-icon" />
                </Link>
            </div>
        </header>
    );
};

export default Header;