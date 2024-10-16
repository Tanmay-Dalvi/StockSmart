import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // Get the token from localStorage or wherever you store it after login
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('/api/ml-predictions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setReportData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch report data');
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) return <div className="loading">Loading...It takes few time!</div>;
  if (error) return <div className="error">{error}</div>;
  if (!reportData) return null;

  const { stock_predictions, product_demand_category, top_products, top_products_chart } = reportData;

  return (
    <div className="reports-container">
      <h1>Reports</h1>

      <section className="stock-predictions">
        <h2>Predictions for Next Month's Stock Quantity</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Recommended Stock</th>
              <th>MAE</th>
              <th>RMSE</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stock_predictions).map(([product, data]) => (
              <tr key={product}>
                <td>{product}</td>
                <td>{data.recommended_stock}</td>
                <td>{data.mae ? data.mae.toFixed(2) : 'N/A'}</td>
                <td>{data.rmse ? data.rmse.toFixed(2) : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="product-demand">
        <h2>Product Demand</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Demand</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(product_demand_category).map(([product, demand]) => (
              <tr key={product}>
                <td>{product}</td>
                <td>{demand}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="top-products">
        <h2>Top 3 Products</h2>
        <div className="top-products-cards">
          {Object.entries(top_products).map(([product, quantity], index) => (
            <div key={product} className="product-card">
              <div className="product-rank">{index + 1}</div>
              <h3>{product}</h3>
              <p>Quantity Sold: {quantity}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="top-products-chart">
        <h2>Top 3 Products Chart</h2>
        <img src={`data:image/png;base64,${top_products_chart}`} alt="Top 3 Products Chart" />
      </section>
    </div>
  );
};

export default Reports;