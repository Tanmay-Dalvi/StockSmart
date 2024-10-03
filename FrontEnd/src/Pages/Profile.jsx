import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [businessContact, setBusinessContact] = useState('');
  const [businessType, setBusinessType] = useState('');

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  return (
    <div className="stocksmart-profile-page">
      <h1 className="stocksmart-profile-title">Profile</h1>
      
      {!isEditing && (
        <div className="stocksmart-profile-card">
          <div className="stocksmart-profile-info">
            <h2>{name || "Your Name"}</h2>
            <p><strong>Email:</strong> {email || "Not Provided"}</p>
            <p><strong>Business Name:</strong> {businessName || "Not Provided"}</p>
            <p><strong>Business Address:</strong> {businessAddress || "Not Provided"}</p>
            <p><strong>GST Number:</strong> {gstNumber || "Not Provided"}</p>
            <p><strong>Business Contact:</strong> {businessContact || "Not Provided"}</p>
            <p><strong>Business Type:</strong> {businessType || "Not Provided"}</p>
          </div>
          <button className="stocksmart-edit-profile-button" onClick={handleEditProfile}>
            Edit Profile
          </button>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSaveProfile} className="stocksmart-profile-form">
          <div className="stocksmart-form-field">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="stocksmart-form-field">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="stocksmart-form-field">
            <label>Business Name:</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>

          <div className="stocksmart-form-field">
            <label>Business Address:</label>
            <input
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              required
            />
          </div>

          <div className="stocksmart-form-field">
            <label>GST Number:</label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              required
            />
          </div>

          <div className="stocksmart-form-field">
            <label>Business Contact Number:</label>
            <input
              type="text"
              value={businessContact}
              onChange={(e) => setBusinessContact(e.target.value)}
              required
            />
          </div>

          <div className="stocksmart-form-field">
            <label>Business Type:</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              required
            >
              <option value="">Select Business Type</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="Limited Liability Company">Limited Liability Company</option>
              <option value="Corporation">Corporation</option>
              <option value="Non-Profit">Non-Profit</option>
            </select>
          </div>

          <button type="submit" className="stocksmart-save-profile-button">
            Save Profile
          </button>
        </form>
      )}
      
      {!isEditing && (
        <div className="stocksmart-sign-out-container">
            <button className="stocksmart-sign-out-button" onClick={() => navigate('/sign-in')}>Sign Out</button>
        </div>
      )}
    </div>
  );
};

export default Profile;