const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
} = require('../controllers/cartController');

// All cart routes require authentication
router.use(auth);

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/remove/:productId', removeFromCart);
router.put('/update/:productId', updateQuantity);
router.delete('/clear', clearCart);

module.exports = router;