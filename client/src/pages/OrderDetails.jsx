import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/api';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await getOrderById(id);
            setOrder(response.data.order);
        } catch (error) {
            console.error('Error fetching order:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                alert('Order not found');
                navigate('/orders');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading order details...</div>;
    }

    if (!order) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Order not found</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <button 
                onClick={() => navigate('/orders')}
                style={{
                    padding: '8px 16px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '20px'
                }}
            >
                ← Back to Orders
            </button>

            <h2>Order Details</h2>
            
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#f9f9f9' }}>
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Status:</strong> 
                    <span style={{
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: order.status === 'delivered' ? '#28a745' : 
                                   order.status === 'cancelled' ? '#dc3545' : '#ffc107',
                        color: order.status === 'delivered' || order.status === 'cancelled' ? 'white' : 'black',
                        marginLeft: '5px'
                    }}>
                        {order.status}
                    </span>
                </p>
                <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                <p><strong>Total Amount:</strong> <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#28a745' }}>${order.totalAmount}</span></p>

                <h3 style={{ marginTop: '20px' }}>Items</h3>
                <div style={{ borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                    {order.items.map((item, index) => (
                        <div key={index} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: '8px 0',
                            borderBottom: '1px solid #eee'
                        }}>
                            <span>{item.name || item.product?.name} × {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <h3 style={{ marginTop: '20px' }}>Shipping Address</h3>
                <div style={{ padding: '10px', background: 'white', borderRadius: '4px' }}>
                    <p><strong>Street:</strong> {order.shippingAddress?.street}</p>
                    <p><strong>City:</strong> {order.shippingAddress?.city}</p>
                    <p><strong>State:</strong> {order.shippingAddress?.state}</p>
                    <p><strong>ZIP:</strong> {order.shippingAddress?.zip}</p>
                    <p><strong>Country:</strong> {order.shippingAddress?.country}</p>
                </div>
            </div>

            {order.status === 'pending' && (
                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this order?')) {
                            // You can call cancelOrder API here
                            alert('Order cancelled!');
                            navigate('/orders');
                        }
                    }}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '16px'
                    }}
                >
                    🗑️ Cancel Order
                </button>
            )}
        </div>
    );
};

export default OrderDetails;