import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../services/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getMyOrders();
            // ✅ FILTER OUT CANCELLED ORDERS - THEY WON'T SHOW
            const activeOrders = response.data.orders.filter(
                order => order.status !== 'cancelled'
            );
            setOrders(activeOrders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login first');
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                alert('✅ Order cancelled successfully!');
                await fetchOrders(); // Refresh the list (cancelled orders will be hidden)
            } else {
                alert('❌ Failed to cancel order: ' + data.message);
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('❌ Error cancelling order. Please try again.');
        }
    };

    const handleViewDetails = (orderId) => {
        navigate(`/order/${orderId}`);
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading orders...</div>;
    }

    if (orders.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>No Active Orders</h2>
                <p>You have no pending or processing orders.</p>
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
            <h2>My Orders</h2>
            
            {orders.map((order) => (
                <div 
                    key={order._id}
                    style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '20px',
                        marginBottom: '20px',
                        background: '#f9f9f9'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <div>
                            <p><strong>Order ID:</strong> {order._id}</p>
                            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p><strong>Status:</strong> 
                                <span style={{
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    background: order.status === 'delivered' ? '#28a745' : '#ffc107',
                                    color: order.status === 'delivered' ? 'white' : 'black',
                                    marginLeft: '5px'
                                }}>
                                    {order.status}
                                </span>
                            </p>
                            <p><strong>Total:</strong> ${order.totalAmount}</p>
                            <p><strong>Payment:</strong> {order.paymentMethod}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={() => handleViewDetails(order._id)}
                                style={{
                                    padding: '8px 16px',
                                    background: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    width: '120px'
                                }}
                            >
                                View Details
                            </button>
                            
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => handleCancelOrder(order._id)}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        width: '120px'
                                    }}
                                >
                                    🗑️ Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Orders;