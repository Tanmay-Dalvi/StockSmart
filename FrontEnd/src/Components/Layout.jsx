import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import "./Layout.css";

const Layout = ({ activeItem, onItemClick }) => {
    const navigate = useNavigate();

    const handleNavigation = (item, path) => {
        onItemClick(item);
        navigate(path);
    };

    return (
        <div className="stocksmart-layout">
            <Header />
            <div className="stocksmart-main-container">
                <Sidebar activeItem={activeItem} onItemClick={handleNavigation} />
                <main className="stocksmart-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;