import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Add token to every request
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// ==================== AUTH APIs ====================
export const register = (userData) => API.post('/auth/register', userData);
export const login = (userData) => API.post('/auth/login', userData);

// ==================== PRODUCT APIs ====================
export const getProducts = () => API.get('/products');
export const getProductById = (id) => API.get(`/products/${id}`);
export const searchProducts = (keyword) => API.get(`/products/search?keyword=${keyword}`);

// ==================== CART APIs ====================
export const getCart = () => API.get('/cart');
export const addToCart = (productId, quantity = 1) => API.post('/cart/add', { productId, quantity });
export const removeFromCart = (productId) => API.delete(`/cart/remove/${productId}`);
export const updateCartQuantity = (productId, quantity) => API.put(`/cart/update/${productId}`, { quantity });
export const clearCart = () => API.delete('/cart/clear');

// ==================== ORDER APIs ====================
export const createOrder = (orderData) => API.post('/orders/create', orderData);
export const getMyOrders = () => API.get('/orders/myorders');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);

export default API;