import React, { useState, useEffect } from 'react';
import { getSalesData } from '../services/api';
import './Sales.css';

const Sales = () => {
  const [salesData, setSalesData] = useState({
    daily: { revenue: 0, profit: 0 },
    weekly: { revenue: 0, profit: 0 },
    monthly: { revenue: 0, profit: 0 },
    yearly: { revenue: 0, profit: 0 }
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }
      const data = await getSalesData(token);
      setSalesData(data);
    } catch (error) {
      setError('Failed to fetch sales data: ' + error.message);
    }
  };
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  return (
    <div className="sales-container">
      <h1>Sales Overview</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="sales-grid">
        <div className="sales-card">
          <h2>Today's Sales</h2>
          <p>Revenue: {formatCurrency(salesData.daily.revenue)}</p>
          <p>Profit: {formatCurrency(salesData.daily.profit)}</p>
        </div>
        <div className="sales-card">
          <h2>This Week's Sales</h2>
          <p>Revenue: {formatCurrency(salesData.weekly.revenue)}</p>
          <p>Profit: {formatCurrency(salesData.weekly.profit)}</p>
        </div>
        <div className="sales-card">
          <h2>This Month's Sales</h2>
          <p>Revenue: {formatCurrency(salesData.monthly.revenue)}</p>
          <p>Profit: {formatCurrency(salesData.monthly.profit)}</p>
        </div>
        <div className="sales-card">
          <h2>This Year's Sales</h2>
          <p>Revenue: {formatCurrency(salesData.yearly.revenue)}</p>
          <p>Profit: {formatCurrency(salesData.yearly.profit)}</p>
        </div>
      </div>
    </div>
  );
};

export default Sales;