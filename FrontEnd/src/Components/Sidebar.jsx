import React from "react";
import "./Sidebar.css";

const Sidebar = ({ activeItem, onItemClick }) => {
    return (
        <aside className="sidebar">
            <ul>
                {["Dashboard", "Inventory", "Sales", "Reports", "Billing"].map((item) => (
                    <li
                        key={item}
                        className={`sidebar-item ${activeItem === item ? "active" : ""}`}
                        onClick={() => onItemClick(item, `/${item.toLowerCase()}`)} // Correct usage of onItemClick
                    >
                        <img src={`/${item.toLowerCase()}.png`} alt={`${item} icon`} className="menu-icon" />
                        {item}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
