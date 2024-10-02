import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Components/Layout";
import Dashboard from "./Pages/Dashboard";
import Inventory from "./Pages/Inventory";
import Sales from "./Pages/Sales";
import Reports from "./Pages/Reports";
import Billing from "./Pages/Billing";
import LandingPage from "./Pages/LandingPage";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import Notification from "./Pages/Notification";
import Profile from "./Pages/Profile"; // Assuming you have a Profile component

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeItem, setActiveItem] = useState("Dashboard");

    const handleItemClick = (item) => {
        setActiveItem(item);
    };

    return (
        <Router>
            <Routes>
                {!isAuthenticated ? (
                    <>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/sign-in" element={<SignIn setIsAuthenticated={setIsAuthenticated} />} />
                        <Route path="/sign-up" element={<SignUp setIsAuthenticated={setIsAuthenticated} />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </>
                ) : (
                    <Route path="/" element={<Layout activeItem={activeItem} onItemClick={handleItemClick} />}>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="sales" element={<Sales />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="billing" element={<Billing />} />
                        <Route path="notification" element={<Notification />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Route>
                )}
            </Routes>
        </Router>
    );
};

export default App;