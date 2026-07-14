import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, searchProducts } from '../services/api';
import API from '../services/api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const navigate = useNavigate();

    // Get all unique categories from products
    const categories = ['All', ...new Set(allProducts.map(p => p.category))];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getProducts();
            const productData = response.data.products || [];
            setAllProducts(productData);
            setProducts(productData);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter by category
    const filterByCategory = (category) => {
        setSelectedCategory(category);
        if (category === 'All') {
            setProducts(allProducts);
        } else {
            const filtered = allProducts.filter(p => p.category === category);
            setProducts(filtered);
        }
        setSearchTerm('');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            filterByCategory(selectedCategory);
            return;
        }
        try {
            setLoading(true);
            const response = await searchProducts(searchTerm);
            const searchResults = response.data.products || [];
            // Filter search results by current category
            if (selectedCategory !== 'All') {
                const filtered = searchResults.filter(p => p.category === selectedCategory);
                setProducts(filtered);
            } else {
                setProducts(searchResults);
            }
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            await API.post('/cart/add', { productId, quantity: 1 });
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
        return <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>Loading products...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <h2 style={{ margin: 0 }}>Products</h2>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            padding: '10px', 
                            borderRadius: '4px', 
                            border: '1px solid #ddd', 
                            width: '250px',
                            fontSize: '14px'
                        }}
                    />
                    <button 
                        type="submit" 
                        style={{ 
                            padding: '10px 20px', 
                            background: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Search
                    </button>
                    <button 
                        type="button" 
                        onClick={() => {
                            setSearchTerm('');
                            filterByCategory('All');
                        }}
                        style={{ 
                            padding: '10px 20px', 
                            background: '#6c757d', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Reset
                    </button>
                </form>
            </div>

            {/* Category Filter */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '10px', 
                marginBottom: '20px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px'
            }}>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => {
                            setSearchTerm('');
                            filterByCategory(category);
                        }}
                        style={{
                            padding: '8px 20px',
                            background: selectedCategory === category ? '#007bff' : 'white',
                            color: selectedCategory === category ? 'white' : '#333',
                            border: selectedCategory === category ? 'none' : '1px solid #ddd',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '50px', fontSize: '18px', color: '#666' }}>
                    No products found in this category.
                </p>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                    gap: '20px' 
                }}>
                    {products.map((product) => (
                        <div 
                            key={product._id} 
                            style={{ 
                                border: '1px solid #ddd', 
                                borderRadius: '8px', 
                                padding: '15px', 
                                textAlign: 'center',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                                background: 'white'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <img
                                src={product.image || 'https://via.placeholder.com/200'}
                                alt={product.name}
                                style={{ 
                                    width: '100%', 
                                    height: '200px', 
                                    objectFit: 'cover', 
                                    borderRadius: '4px' 
                                }}
                                onClick={() => navigate(`/product/${product._id}`)}
                            />
                            <h3 style={{ margin: '10px 0', fontSize: '16px', minHeight: '40px' }}>
                                {product.name}
                            </h3>
                            <p style={{ fontWeight: 'bold', fontSize: '20px', color: '#28a745' }}>
                                ${product.price}
                            </p>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                                {product.category}
                            </p>
                            <p style={{ fontSize: '12px', color: '#999' }}>{product.subcategory}</p>
                            <p style={{ 
                                fontSize: '13px', 
                                color: product.stock > 0 ? '#28a745' : 'red',
                                fontWeight: 'bold'
                            }}>
                                {product.stock > 0 ? `✓ In Stock (${product.stock})` : '✗ Out of Stock'}
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' }}>
                                <button
                                    onClick={() => navigate(`/product/${product._id}`)}
                                    style={{ 
                                        padding: '8px 15px', 
                                        background: '#17a2b8', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer',
                                        flex: 1
                                    }}
                                >
                                    View
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart(product._id);
                                    }}
                                    disabled={product.stock === 0}
                                    style={{
                                        padding: '8px 15px',
                                        background: product.stock > 0 ? '#28a745' : '#ccc',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                                        flex: 1
                                    }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Products;