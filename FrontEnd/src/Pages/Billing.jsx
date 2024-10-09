import React, { useState, useEffect } from 'react';
import { getUserInfo, getInventory, generateBill } from '../services/api';
import './Billing.css';

const Billing = () => {
  const [businessDetails, setBusinessDetails] = useState({});
  const [inventory, setInventory] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({ product: '', quantity: 1 });
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusinessDetails();
    fetchInventory();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [selectedProducts]);

  const fetchBusinessDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getUserInfo(token);
      setBusinessDetails(data);
    } catch (error) {
      setError('Failed to fetch business details');
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getInventory(token);
      setInventory(data);
    } catch (error) {
      setError('Failed to fetch inventory');
    }
  };

  const handleProductChange = (e) => {
    const selectedProduct = inventory.find(p => p.product === e.target.value);
    setCurrentProduct(prev => ({ ...prev, product: e.target.value, price: selectedProduct?.selling_price || 0 }));
  };

  const handleQuantityChange = (e) => {
    setCurrentProduct(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }));
  };

const addProductToBill = () => {
    if (currentProduct.product && currentProduct.quantity > 0) {
      const existingProductIndex = selectedProducts.findIndex(p => p.product === currentProduct.product);
      if (existingProductIndex !== -1) {
        const updatedProducts = [...selectedProducts];
        updatedProducts[existingProductIndex].quantity += currentProduct.quantity;
        updatedProducts[existingProductIndex].total = updatedProducts[existingProductIndex].price * updatedProducts[existingProductIndex].quantity;
        setSelectedProducts(updatedProducts);
      } else {
        setSelectedProducts(prev => [...prev, { ...currentProduct, total: currentProduct.price * currentProduct.quantity }]);
      }
      setCurrentProduct({ product: '', quantity: 1 });
    }
  };

const removeProductFromBill = (index) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const total = selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    setTotalAmount(total);
  };

  const handleGenerateBill = async () => {
    try {
      const token = localStorage.getItem('token');
      const billData = {
        products: selectedProducts,
        totalAmount,
        businessDetails
      };
      const response = await generateBill(token, billData);
      
      // Create a Blob from the response data
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bill.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      // Optionally, show a success message to the user
      alert('Bill generated and downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate bill:', error);
      setError('Failed to generate bill: ' + (error.response?.data?.error || error.message));
    }
  };
    
  return (
    <div className="billing-container">
      <h1>Billing</h1>
      {error && <div className="error-message">{error}</div>}
      
      <div className="business-details">
        <h2>Business Details</h2>
        <p>Name: {businessDetails.businessName}</p>
        <p>Address: {businessDetails.businessLocation}</p>
        <p>GST: {businessDetails.gstNumber}</p>
      </div>

      <div className="product-input">
        <select value={currentProduct.product} onChange={handleProductChange}>
          <option value="">Select a product</option>
          {inventory.map(product => (
            <option key={product._id} value={product.product}>{product.product}</option>
          ))}
        </select>
        <input 
          type="number" 
          value={currentProduct.quantity} 
          onChange={handleQuantityChange} 
          min="1"
        />
        <button onClick={addProductToBill}>Add to Bill</button>
      </div>

      <table className="bill-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {selectedProducts.map((product, index) => (
            <tr key={index}>
              <td>{product.product}</td>
              <td>{product.quantity}</td>
              <td>₹{product.price}</td>
              <td>₹{product.price * product.quantity}</td>
              <td>
                <button onClick={() => removeProductFromBill(index)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bill-summary">
        <h3>Total Amount: ₹{totalAmount}</h3>
        <button onClick={handleGenerateBill}>Generate Bill</button>
      </div>
    </div>
  );
};

export default Billing;