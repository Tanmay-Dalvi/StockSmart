import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const handleApiError = (error) => {  
  if (error.response) {  
    throw error;  // This allows the component to handle the error
  } else if (error.request) {  
    throw new Error('No response received from server');  
  } else {  
    throw new Error(`Request setup error: ${error.message}`);  
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