import React from 'react';
import './Notification.css';

const Notification = () => {
    const notifications = [
        {
            icon: '../alert.png', // Replace with actual image path
            title: 'Stockout Alert',
            description: 'iPhone 13 is currently out of stock.',
        },
        {
            icon: '../alert.png', // Replace with actual image path
            title: 'Overstock Alert',
            description: 'Samsung Galaxy S21 has excess inventory.',
        },
        {
            icon: '../alert.png', // Replace with actual image path
            title: 'Stockout Alert',
            description: 'MacBook Pro is running low on stock.',
        },
    ];

    return (
        <div className="notification-page">
            <h1>Notifications</h1>
            <div className="notification-container">
                {notifications.map((notification, index) => (
                    <div className="notification-box" key={index}>
                        <img
                            src={notification.icon}
                            alt={notification.title}
                            className="notification-icon"
                        />
                        <div className="notification-content">
                            <h3>{notification.title}</h3>
                            <p>{notification.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notification;
