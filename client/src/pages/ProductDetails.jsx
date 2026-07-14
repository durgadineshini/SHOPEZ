import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import API from '../services/api';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await getProductById(id);
                setProduct(response.data.product);
            } catch (error) {
                console.error('Error fetching product:', error);
                navigate('/products');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    const addToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            await API.post('/cart/add', { productId: id, quantity });
            alert('✅ Product added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                alert('❌ Failed to add to cart');
            }
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;
    }

    if (!product) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Product not found</div>;
    }

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
            <button 
                onClick={() => navigate('/products')}
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
                ← Back
            </button>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <img
                        src={product.image || 'https://via.placeholder.com/400'}
                        alt={product.name}
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ flex: '1', minWidth: '300px' }}>
                    <h1>{product.name}</h1>
                    <p style={{ color: '#666' }}>{product.description}</p>
                    <p style={{ fontWeight: 'bold', fontSize: '28px', color: '#28a745' }}>${product.price}</p>
                    <p>Category: <strong>{product.category}</strong></p>
                    <p style={{ color: product.stock > 0 ? '#28a745' : 'red' }}>
                        {product.stock > 0 ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
                    </p>

                    {product.stock > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <label>Quantity:</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ padding: '8px 15px', background: '#ddd', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                                <span style={{ fontSize: '18px', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} style={{ padding: '8px 15px', background: '#ddd', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={addToCart}
                        disabled={product.stock === 0}
                        style={{
                            marginTop: '30px',
                            padding: '14px 40px',
                            background: product.stock > 0 ? '#28a745' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            width: '100%'
                        }}
                    >
                        {product.stock > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;