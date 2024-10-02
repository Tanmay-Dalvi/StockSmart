import React, { useState } from 'react';
import './Profile.css'; // Import the CSS file

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('/path/to/default/image.png'); // Default image path
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [businessContact, setBusinessContact] = useState('');
  const [businessType, setBusinessType] = useState(''); // New state for business type

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditing(false); // Close the edit form
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl); // Set the profile image to the selected file
    }
  };

  return (
    <div className="profile-page">
      <h1 className="profile-title">Profile</h1>
      
      {!isEditing && (
        <div>
          <h2>Your Details</h2>
          <div className="profile-info">
            <img src={profileImage} alt="Profile" className="profile-image" />
            <p>Name: {name || "Not Provided"}</p>
            <p>Email: {email || "Not Provided"}</p>
            <p>Business Name: {businessName || "Not Provided"}</p>
            <p>Business Address: {businessAddress || "Not Provided"}</p>
            <p>GST Number: {gstNumber || "Not Provided"}</p>
            <p>Business Contact Number: {businessContact || "Not Provided"}</p>
            <p>Business Type: {businessType || "Not Provided"}</p> {/* Display Business Type */}
          </div>
          <div className="button-container">
            <button className="edit-profile-button" onClick={handleEditProfile}>
              Edit Profile
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSaveProfile}>
          <div className="profile-picture-container">
            <img src={profileImage} alt="Profile" className="profile-image" />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="form-field"
              style={{ display: 'none' }} // Hide the default file input
              id="profileImageUpload"
            />
            <label htmlFor="profileImageUpload" className="upload-picture-button">
              Upload Your Picture
            </label>
          </div>

          <div className="form-field">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>Business Name:</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>Business Address:</label>
            <input
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>GST Number:</label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>Business Contact Number:</label>
            <input
              type="text"
              value={businessContact}
              onChange={(e) => setBusinessContact(e.target.value)}
              required
            />
          </div>

          {/* New Business Type Dropdown */}
          <div className="form-field">
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
              {/* Add more options as needed */}
            </select>
          </div>

          <button type="submit" className="save-profile-button">
            Save Profile
          </button>
        </form>
      )}
      
      {/* Sign Out Button displayed only when not editing */}
      {!isEditing && (
        <div className="sign-out-container">
          <button className="sign-out-button">Sign Out</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
