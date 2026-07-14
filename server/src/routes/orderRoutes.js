const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder
} = require('../controllers/orderController');

// All order routes require authentication
router.use(auth);

// Create order from cart
router.post('/create', createOrder);

// Get user's orders
router.get('/myorders', getUserOrders);

// Get single order
router.get('/:id', getOrderById);

// Cancel order
router.put('/:id/cancel', cancelOrder);

module.exports = router;