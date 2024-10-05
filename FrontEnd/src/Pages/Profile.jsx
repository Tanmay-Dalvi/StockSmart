import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserInfo, updateUserInfo, changePassword } from '../services/api';
import './Profile.css';

const Profile = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        businessType: '',
        businessLocation: '',
        helplineNumber: '',
        gstNumber: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editedInfo, setEditedInfo] = useState({});
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });

    const fetchUserInfo = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                navigate('/sign-in');
                return;
            }
            const data = await getUserInfo(token);
            setUserInfo(data);
            setEditedInfo(data);
        } catch (error) {
            console.error('Error fetching user info:', error);
            if (error.response) {
                if (error.response.status === 401) {
                    setIsAuthenticated(false);
                    navigate('/sign-in');
                } else {
                    setError(`Failed to fetch user information. Status: ${error.response.status}`);
                }
            } else {
                setError('Failed to fetch user information. Please try again.');
            }
        }
    }, [navigate, setIsAuthenticated]);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedInfo(userInfo);
        setError('');
        setSuccessMessage('');
    };

    const handleSave = async () => {  
        try {  
            const token = localStorage.getItem('token');  
            const response = await updateUserInfo(token, editedInfo);  
            setUserInfo(response.user);  
            setIsEditing(false);  
            setSuccessMessage('Profile updated successfully!');  
            setError('');  
        } catch (error) {  
            console.error('Error updating profile:', error);
            if (error.response) {
                const errorMessage = error.response.data.error || 'An error occurred';
                const errorDetails = error.response.data.details ? ` Details: ${error.response.data.details}` : '';
                setError(`Error ${error.response.status}: ${errorMessage}${errorDetails}`);
            } else if (error.request) {
                setError('No response received from server. Please check your connection.');
            } else {
                setError('An error occurred while updating your profile. Please try again later.');
            }
        }  
    };
                  
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setError("New passwords don't match");
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await changePassword(token, passwordData.oldPassword, passwordData.newPassword);
            setSuccessMessage('Password changed successfully!');
            setError('');
            setIsChangingPassword(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (error) {
            console.error('Error changing password:', error);
            if (error.response) {
                setError(`Error ${error.response.status}: ${error.response.data.error || 'Failed to change password'}`);
            } else if (error.request) {
                setError('No response received from server. Please check your connection.');
            } else {
                setError('An error occurred while changing the password. Please try again later.');
            }
        }
    };
  
    const handleSignOut = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/sign-in');
    };

    return (
        <div className="profile-container">            <h1>User Profile</h1>
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            <div className="profile-card">
                {isEditing ? (
                    <form className="edit-profile-form">
                        <input name="name" value={editedInfo.name} onChange={handleInputChange} placeholder="Name" />
                        <input name="email" value={editedInfo.email} onChange={handleInputChange} placeholder="Email" />
                        <input name="phone" value={editedInfo.phone} onChange={handleInputChange} placeholder="Phone" />
                        <input name="businessName" value={editedInfo.businessName} onChange={handleInputChange} placeholder="Business Name" />
                        <input name="businessType" value={editedInfo.businessType} onChange={handleInputChange} placeholder="Business Type" />
                        <input name="businessLocation" value={editedInfo.businessLocation} onChange={handleInputChange} placeholder="Business Location" />
                        <input name="helplineNumber" value={editedInfo.helplineNumber} onChange={handleInputChange} placeholder="Helpline Number" />
                        <input name="gstNumber" value={editedInfo.gstNumber} onChange={handleInputChange} placeholder="GST Number" />
                        <div className="form-actions">
                            <button type="button" onClick={handleSave} className="save-profile-btn">Save</button>
                            <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <p><strong>Name:</strong> {userInfo.name || 'Not specified'}</p>
                        <p><strong>Email:</strong> {userInfo.email || 'Not specified'}</p>
                        <p><strong>Phone:</strong> {userInfo.phone || 'Not specified'}</p>
                        <p><strong>Business Name:</strong> {userInfo.businessName || 'Not specified'}</p>
                        <p><strong>Business Type:</strong> {userInfo.businessType || 'Not specified'}</p>
                        <p><strong>Business Location:</strong> {userInfo.businessLocation || 'Not specified'}</p>
                        <p><strong>Helpline Number:</strong> {userInfo.helplineNumber || 'Not specified'}</p>
                        <p><strong>GST Number:</strong> {userInfo.gstNumber || 'Not specified'}</p>
                        <div className="profile-actions">
                            <button onClick={handleEdit} className="edit-profile-btn">Edit Profile</button>
                            <button onClick={() => setIsChangingPassword(true)} className="change-password-btn">Change Password</button>
                            <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
                        </div>
                    </>
                )}
            </div>
            {isChangingPassword && (
                <div className="change-password-form">
                    <h2>Change Password</h2>
                    <form onSubmit={handleChangePassword}>
                        <input
                            type="password"
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordInputChange}
                            placeholder="Old Password"
                            required
                        />
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordInputChange}
                            placeholder="New Password"
                            required
                        />
                        <input
                            type="password"
                            name="confirmNewPassword"
                            value={passwordData.confirmNewPassword}
                            onChange={handlePasswordInputChange}
                            placeholder="Confirm New Password"
                            required
                        />
                        <div className="form-actions">
                            <button type="submit" className="save-profile-btn">Change Password</button>
                            <button type="button" onClick={() => setIsChangingPassword(false)} className="cancel-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Profile;