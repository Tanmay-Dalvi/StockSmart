import React, { useState, useEffect } from 'react';
import { getInventory, addProduct, updateProduct, deleteProduct, downloadInventory } from '../services/api';
import './Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({});
  const [currentVendor, setCurrentVendor] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const data = await getInventory(token);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError(error.message || 'Failed to fetch inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (product) => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      await addProduct(token, product);
      await fetchInventory();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product');
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      setError(null);
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const productId = productData.product_id;
      
      if (!productId) {
        throw new Error('Product ID is missing');
      }
      
      await updateProduct(token, productId, productData);
      await fetchInventory(); // Refresh the list
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteProduct = async (product) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const productId = product.product_id;
      
      if (!productId) {
        throw new Error('Product ID is missing');
      }
  
      if (window.confirm('Are you sure you want to delete this product?')) {
        const token = localStorage.getItem('token');
        await deleteProduct(token, productId);
        await fetchInventory(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.message || 'Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };
        
  const handleDownloadData = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      await downloadInventory(token);
    } catch (error) {
      console.error('Error downloading inventory data:', error);
      setError('Failed to download inventory data');
    }
  };

  const handleVendorClick = (vendor) => {
    if (vendor) {
      setCurrentVendor(vendor);
      setIsVendorModalOpen(true);
    } else {
      console.error('Vendor information is missing');
    }
  };

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="inventory-container">
      {error && <div className="error-message">{error}</div>}
      {isLoading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <h1>Products</h1>
          <button className="add-product-btn" onClick={() => setIsAddModalOpen(true)}>Add Product</button>
          <button className="download-btn" onClick={handleDownloadData}>Download Data</button>
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Vendor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product._id || product.product_id}>
                  <td>{product.product_id || product._id}</td>
                  <td>{product.product}</td>
                  <td>{product.brand}</td>
                  <td>{product.category}</td>
                  <td>₹{product.selling_price}</td>
                  <td>{product.quantity}</td>
                  <td>
                    {product.vendor ? (
                      <button 
                        className="vendor-link-button"
                        onClick={() => handleVendorClick(product.vendor)}
                      >
                        {product.vendor.name || 'View Vendor'}
                      </button>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn" 
                        onClick={() => { 
                          setCurrentProduct(product); 
                          setIsEditModalOpen(true); 
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteProduct(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            {[...Array(Math.ceil(products.length / productsPerPage)).keys()].map((number) => (
              <button key={number + 1} onClick={() => paginate(number + 1)}>{number + 1}</button>
            ))}
          </div>
          
          {isAddModalOpen && (
            <ProductModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSubmit={handleAddProduct}
              product={{}}
              title="Add Product"
            />
          )}
          
          {isEditModalOpen && (
            <ProductModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSubmit={handleUpdateProduct}
              product={currentProduct}
              title="Update Product"
            />
          )}

          {isVendorModalOpen && (
            <VendorModal
              isOpen={isVendorModalOpen}
              onClose={() => setIsVendorModalOpen(false)}
              vendor={currentVendor}
            />
          )}
        </>
      )}
    </div>
  );
};

const ProductModal = ({ isOpen, onClose, onSubmit, product, title }) => {
  const [formData, setFormData] = useState(product);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFormData(product);
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['selling_price', 'cost_price', 'quantity'].includes(name)
        ? Number(value)
        : name === 'vendor'
        ? { ...prev.vendor, [e.target.dataset.vendorField]: value }
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{title}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            name="product"
            value={formData.product || ''}
            onChange={handleChange}
            placeholder="Product Name"
            required
          />
          <input
            name="brand"
            value={formData.brand || ''}
            onChange={handleChange}
            placeholder="Brand"
            required
          />
          <input
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            placeholder="Category"
            required
          />
          <input
            name="cost_price"
            value={formData.cost_price || ''}
            onChange={handleChange}
            placeholder="Cost Price"
            type="number"
            required
          />
          <input
            name="selling_price"
            value={formData.selling_price || ''}
            onChange={handleChange}
            placeholder="Selling Price"
            type="number"
            required
          />
          <input
            name="quantity"
            value={formData.quantity || ''}
            onChange={handleChange}
            placeholder="Quantity"
            type="number"
            required
          />
          <input
            name="vendor"
            value={formData.vendor?.name || ''}
            onChange={handleChange}
            data-vendor-field="name"
            placeholder="Vendor Name"
            required
          />
          <input
            name="vendor"
            value={formData.vendor?.phone || ''}
            onChange={handleChange}
            data-vendor-field="phone"
            placeholder="Vendor Phone"
            required
          />
          <input
            name="vendor"
            value={formData.vendor?.address || ''}
            onChange={handleChange}
            data-vendor-field="address"
            placeholder="Vendor Address"
            required
          />
          <div className="modal-buttons">
            <button type="submit">Submit</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VendorModal = ({ isOpen, onClose, vendor }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Vendor Details</h2>
        <p><strong>Name:</strong> {vendor.name || 'N/A'}</p>
        <p><strong>Phone:</strong> {vendor.phone || 'N/A'}</p>
        <p><strong>Address:</strong> {vendor.address || 'N/A'}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Inventory;