import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder } from '../services/api';

const Checkout = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        paymentMethod: 'UPI'
    });
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.street || !formData.city || !formData.state || !formData.zip) {
            alert('Please fill in all shipping address fields');
            return;
        }

        setSubmitting(true);
        try {
            const orderData = {
                shippingAddress: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    country: formData.country
                },
                paymentMethod: formData.paymentMethod
            };
            
            const response = await createOrder(orderData);
            alert('✅ Order placed successfully!');
            navigate('/orders');
        } catch (error) {
            console.error('Error placing order:', error);
            alert('❌ Failed to place order: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Your Cart is Empty</h2>
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
                    Shop Now
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <h2>Checkout</h2>

            {/* Order Summary */}
            <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '20px', 
                marginBottom: '20px',
                background: '#f8f9fa'
            }}>
                <h3>Order Summary</h3>
                {cart.items.map((item) => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                        <span>{item.product.name} × {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginTop: '10px' }}>
                    <span>Total:</span>
                    <span>${cart.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
            </div>

            {/* Shipping Form */}
            <form onSubmit={handleSubmit}>
                <h3>Shipping Address</h3>
                <div style={{ marginBottom: '15px' }}>
                    <label>Street:</label>
                    <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        placeholder="123 Main St"
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>City:</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        placeholder="Mumbai"
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>State:</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        placeholder="Maharashtra"
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>ZIP Code:</label>
                    <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                        placeholder="400001"
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>Country:</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Payment Method:</label>
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                    >
                        <option value="UPI">UPI</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                        <option value="Net Banking">Net Banking</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: submitting ? '#ccc' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}
                >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                </button>
            </form>
        </div>
    );
};

export default Checkout;