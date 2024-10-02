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
        <div className="layout">
            <Header />
            <Sidebar activeItem={activeItem} onItemClick={handleNavigation} />
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;