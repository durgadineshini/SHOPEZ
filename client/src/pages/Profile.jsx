import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    // Profile form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Load user data when component mounts
    useEffect(() => {
        if (user) {
            setFormData({
                ...formData,
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Update profile
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await API.put('/users/profile', {
                name: formData.name,
                email: formData.email
            });

            if (response.data.success) {
                setMessage('✅ Profile updated successfully!');
                // Update user in context
                const updatedUser = response.data.user;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                // Force refresh
                window.location.reload();
            }
        } catch (error) {
            setError('❌ Failed to update profile: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Change password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Validate passwords
        if (formData.newPassword !== formData.confirmPassword) {
            setError('❌ New passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('❌ Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await API.put('/users/password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                setMessage('✅ Password changed successfully!');
                setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            setError('❌ Failed to change password: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // View order history
    const handleViewOrders = () => {
        navigate('/orders');
    };

    // View cart
    const handleViewCart = () => {
        navigate('/cart');
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <h2>My Profile</h2>
            
            {/* Success/Error Messages */}
            {message && <div style={{ color: '#28a745', padding: '10px', background: '#d4edda', borderRadius: '4px', marginBottom: '15px' }}>{message}</div>}
            {error && <div style={{ color: '#dc3545', padding: '10px', background: '#f8d7da', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}

            {/* Profile Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center', background: '#f8f9fa' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#666' }}>👤 Name</h3>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0 0' }}>{user?.name || 'N/A'}</p>
                </div>
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center', background: '#f8f9fa' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#666' }}>📧 Email</h3>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '5px 0 0' }}>{user?.email || 'N/A'}</p>
                </div>
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center', background: '#f8f9fa' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#666' }}>🛒 Cart</h3>
                    <button onClick={handleViewCart} style={{ padding: '5px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>View Cart</button>
                </div>
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', textAlign: 'center', background: '#f8f9fa' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#666' }}>📦 Orders</h3>
                    <button onClick={handleViewOrders} style={{ padding: '5px 15px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>View Orders</button>
                </div>
            </div>

            {/* Update Profile Form */}
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                <h3>Update Profile</h3>
                <form onSubmit={handleUpdateProfile}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {loading ? 'Saving...' : 'Update Profile'}
                    </button>
                </form>
            </div>

            {/* Change Password Form */}
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                <h3>Change Password</h3>
                <form onSubmit={handleChangePassword}>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Current Password:</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>New Password:</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label>Confirm New Password:</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        {loading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                style={{
                    padding: '10px 20px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    width: '100%'
                }}
            >
                🔴 Logout
            </button>
        </div>
    );
};

export default Profile;