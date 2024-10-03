import React from "react";
import "./Sidebar.css";

const Sidebar = ({ activeItem, onItemClick }) => {
    const menuItems = ["Dashboard", "Inventory", "Sales", "Reports", "Billing"];

    return (
        <aside className="stocksmart-sidebar">
            <nav>
                <ul className="stocksmart-menu-list">
                    {menuItems.map((item) => (
                        <li key={item}>
                            <button
                                className={`stocksmart-sidebar-item ${activeItem === item ? "stocksmart-active" : ""}`}
                                onClick={() => onItemClick(item, `/${item.toLowerCase()}`)}
                            >
                                <img src={`/${item.toLowerCase()}.png`} alt={`${item} icon`} className="stocksmart-menu-icon" />
                                <span>{item}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;