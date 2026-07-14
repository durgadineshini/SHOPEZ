import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '10px 20px',
            background: '#333',
            color: 'white'
        }}>
            <div>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' }}>
                    ShopEZ
                </Link>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Products</Link>
                {user && (
                    <>
                        <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>Cart</Link>
                        <Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>My Orders</Link>
                        <span style={{ color: '#aaa' }}>| {user.name}</span>
                        <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                            Logout
                        </button>
                    </>
                )}
                {!user && (
                    <>
                        <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;