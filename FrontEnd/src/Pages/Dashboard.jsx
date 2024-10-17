import React, { useState, useEffect } from 'react';
import { getSalesData, getMLPredictions } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const [salesData, setSalesData] = useState({
    daily: { revenue: 0, profit: 0 },
    monthly: { revenue: 0, profit: 0 },
    yearly: { revenue: 0, profit: 0 }
  });
  const [mlPredictions, setMlPredictions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }
      const [salesResponse, predictionsResponse] = await Promise.all([
        getSalesData(token),
        getMLPredictions(token)
      ]);
      setSalesData(salesResponse);
      setMlPredictions(predictionsResponse);
    } catch (error) {
      setError('Failed to fetch data: ' + error.message);
    }
  };
  
  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr.`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(2)}K`;
    } else {
      return `₹${value.toFixed(2)}`;
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      {error && <div className="error-message">{error}</div>}
      
      <div className="sales-overview">
        <h2>Sales Overview</h2>
        <div className="sales-grid">
          <div className="sales-card">
            <h3>Today's Sales</h3>
            <p>Revenue: {formatCurrency(salesData.daily.revenue)}</p>
            <p>Profit: {formatCurrency(salesData.daily.profit)}</p>
          </div>
          <div className="sales-card">
            <h3>This Month's Sales</h3>
            <p>Revenue: {formatCurrency(salesData.monthly.revenue)}</p>
            <p>Profit: {formatCurrency(salesData.monthly.profit)}</p>
          </div>
          <div className="sales-card">
            <h3>This Year's Sales</h3>
            <p>Revenue: {formatCurrency(salesData.yearly.revenue)}</p>
            <p>Profit: {formatCurrency(salesData.yearly.profit)}</p>
          </div>
        </div>
      </div>

      {mlPredictions && (
        <>
          <div className="sales-charts">
            <h2>Sales Charts</h2>
            <img src={`data:image/png;base64,${mlPredictions.sales_graphs}`} alt="Sales Graphs" />
          </div>

          <div className="top-products">
            <h2>Top 3 Selling Products</h2>
            <img src={`data:image/png;base64,${mlPredictions.top_products_chart}`} alt="Top Products Chart" />
          </div>

          <div className="product-demand">
            <h2>Product Demand Distribution</h2>
            {mlPredictions.product_demand_data && (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={mlPredictions.product_demand_data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mlPredictions.product_demand_data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;