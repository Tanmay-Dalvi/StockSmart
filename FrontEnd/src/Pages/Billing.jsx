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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setCurrentProduct(prev => ({ 
      ...prev, 
      product: e.target.value, 
      price: selectedProduct?.selling_price || 0,
      inventoryId: selectedProduct?._id // Store the inventory ID
    }));
  };

  const handleQuantityChange = (e) => {
    setCurrentProduct(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }));
  };

  const validateQuantity = (productName, requestedQuantity, existingQuantity = 0) => {
    const inventoryProduct = inventory.find(p => p.product === productName);
    if (!inventoryProduct) {
      setError('Product not found in inventory');
      return false;
    }

    const totalRequestedQuantity = requestedQuantity + existingQuantity;
    if (totalRequestedQuantity > inventoryProduct.quantity) {
      setError(`Only ${inventoryProduct.quantity} units available for ${productName}`);
      return false;
    }
    return true;
  };

  const addProductToBill = () => {
    if (currentProduct.product && currentProduct.quantity > 0) {
      const existingProductIndex = selectedProducts.findIndex(p => p.product === currentProduct.product);
      
      if (existingProductIndex !== -1) {
        // Validate combined quantity
        if (!validateQuantity(
          currentProduct.product, 
          currentProduct.quantity, 
          selectedProducts[existingProductIndex].quantity
        )) return;

        const updatedProducts = [...selectedProducts];
        updatedProducts[existingProductIndex].quantity += currentProduct.quantity;
        updatedProducts[existingProductIndex].total = updatedProducts[existingProductIndex].price * updatedProducts[existingProductIndex].quantity;
        setSelectedProducts(updatedProducts);
      } else {
        // Validate new quantity
        if (!validateQuantity(currentProduct.product, currentProduct.quantity)) return;

        setSelectedProducts(prev => [...prev, { 
          ...currentProduct, 
          total: currentProduct.price * currentProduct.quantity 
        }]);
      }
      setCurrentProduct({ product: '', quantity: 1 });
      setError(null);
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
      // Validate all quantities one final time
      for (const product of selectedProducts) {
        const inventoryItem = inventory.find(i => i.product === product.product);
        if (!inventoryItem || inventoryItem.quantity < product.quantity) {
          setError(`Insufficient quantity available for ${product.product}`);
          return;
        }
      }

      const token = localStorage.getItem('token');
      const billData = {
        products: selectedProducts.map(product => {
          const inventoryProduct = inventory.find(i => i.product === product.product);
          return {
            product: product.product,
            quantity: product.quantity,
            price: product.price,
            productId: inventoryProduct._id // Include the product ID for database update
          };
        }),
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
      link.download = `bill-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      // Update local inventory state
      const updatedInventory = inventory.map(item => {
        const billedProduct = selectedProducts.find(p => p.product === item.product);
        if (billedProduct) {
          return {
            ...item,
            quantity: item.quantity - billedProduct.quantity
          };
        }
        return item;
      });
      setInventory(updatedInventory);
      
      // Clear the selected products
      setSelectedProducts([]);
      setError(null);
      
      // Show success message
      alert('Bill generated and downloaded successfully! Inventory updated.');
    } catch (error) {
      console.error('Failed to generate bill:', error);
      setError('Failed to generate bill: ' + (error.response?.data?.error || error.message));
    }
  };

  // Rest of the component remains the same...
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
            <option key={product._id} value={product.product}>
              {product.product} (Available: {product.quantity})
            </option>
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