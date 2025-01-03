import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    throw new Error(error.response.data.error || error.response.statusText);
  } else if (error.request) {
    throw new Error('No response received from server');
  } else {
    throw new Error(`Request setup error: ${error.message}`);
  }
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getUserInfo = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateUserInfo = async (token, userInfo) => {
  try {
    const response = await axios.put(`${API_URL}/update-profile`, userInfo, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const changePassword = async (token, oldPassword, newPassword) => {
  try {
    const response = await axios.post(
      `${API_URL}/change-password`, 
      { oldPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const initializeAuth = () => {
  const token = localStorage.getItem('token');
  setAuthToken(token);
};

export const getInventory = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 500) {
      console.error('Server error:', error.response.data);
      throw new Error('Internal server error. Please try again later.');
    }
    throw handleApiError(error);
  }
};

export const addProduct = async (token, productData) => {
  try {
    const response = await axios.post(`${API_URL}/inventory`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateProduct = async (token, productId, productData) => {
  try {
    // Remove _id from the data before sending
    const { _id, ...dataToSend } = productData;
    
    const response = await axios.put(
      `${API_URL}/inventory/${productId}`,
      dataToSend,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteProduct = async (token, productId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/inventory/${productId}`,
      {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const downloadInventory = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/inventory/download`,
      {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        responseType: 'blob'
      }
    );
    
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventory.csv');
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

export const generateBill = async (token, billData) => {
  try {
    const response = await axios.post(`${API_URL}/generate-bill`, billData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      responseType: 'blob'
    });
    
    // Check if the response is actually a blob
    if (response.data instanceof Blob) {
      return response.data;
    } else {
      throw new Error('Received invalid data format from server');
    }
  } catch (error) {
    console.error('Generate bill error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw handleApiError(error);
  }
};

export const getSalesData = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/sales`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getMLPredictions = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/ml-predictions`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};