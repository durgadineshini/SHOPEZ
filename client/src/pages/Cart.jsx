import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, removeFromCart, updateCartQuantity, clearCart } from '../services/api';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await getCart();
            setCart(response.data.cart);
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        try {
            if (newQuantity < 1) {
                await handleRemoveItem(productId);
                return;
            }
            await updateCartQuantity(productId, newQuantity);
            await fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Failed to update quantity');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await removeFromCart(productId);
            await fetchCart();
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Failed to remove item');
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) return;
        try {
            await clearCart();
            await fetchCart();
        } catch (error) {
            console.error('Error clearing cart:', error);
            alert('Failed to clear cart');
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading cart...</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Your Cart is Empty</h2>
                <p>Start shopping to add items to your cart!</p>
                <button 
                    onClick={() => navigate('/products')}
                    style={{
                        padding: '10px 30px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    Browse Products
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
            <h2>Shopping Cart</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={handleClearCart}
                    style={{
                        padding: '8px 16px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Cart
                </button>
            </div>

            {cart.items.map((item) => (
                <div 
                    key={item._id}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '15px',
                        borderBottom: '1px solid #ddd',
                        gap: '20px',
                        flexWrap: 'wrap'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img
                            src={item.product.image || 'https://via.placeholder.com/80'}
                            alt={item.product.name}
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                            <h4 style={{ margin: 0 }}>{item.product.name}</h4>
                            <p style={{ margin: '5px 0', color: '#666' }}>${item.price}</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <button
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                                style={{ padding: '5px 10px', cursor: 'pointer' }}
                            >
                                -
                            </button>
                            <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                            <button
                                onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                                style={{ padding: '5px 10px', cursor: 'pointer' }}
                            >
                                +
                            </button>
                        </div>
                        <p style={{ fontWeight: 'bold', margin: 0 }}>
                            ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                            onClick={() => handleRemoveItem(item.product._id)}
                            style={{
                                padding: '5px 12px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ))}

            <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <h3>Total: ${cart.totalAmount?.toFixed(2) || '0.00'}</h3>
                <button
                    onClick={() => navigate('/checkout')}
                    style={{
                        padding: '12px 40px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginTop: '10px'
                    }}
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
};

export default Cart;