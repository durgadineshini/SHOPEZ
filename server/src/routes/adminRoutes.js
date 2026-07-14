const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
    // Order Management
    getAllOrders,
    updateOrderStatus,
    // Product Management
    adminCreateProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    // User Management
    getAllUsers,
    updateUserRole
} = require('../controllers/adminController');

// All admin routes require authentication + admin privileges
router.use(auth, adminAuth);

// ========== Order Management ==========
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// ========== Product Management ==========
router.post('/products', adminCreateProduct);
router.put('/products/:id', adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);

// ========== User Management ==========
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;