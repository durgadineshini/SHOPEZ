const Cart = require('../models/cart');
const Product = require('../models/product');

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.userId })
            .populate('items.product', 'name price image category');
        
        if (!cart) {
            return res.json({
                success: true,
                message: 'Cart is empty',
                cart: { items: [], totalAmount: 0 }
            });
        }
        
        res.json({
            success: true,
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        
        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Not enough stock available'
            });
        }
        
        // Find or create cart
        let cart = await Cart.findOne({ user: req.userId });
        
        if (!cart) {
            cart = new Cart({
                user: req.userId,
                items: [],
                totalAmount: 0
            });
        }
        
        // Check if product already in cart
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.price = product.price;
        } else {
            cart.items.push({
                product: productId,
                quantity: quantity,
                price: product.price
            });
        }
        
        // Update total
        cart.totalAmount = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        await cart.save();
        
        // Populate product details
        await cart.populate('items.product', 'name price image category');
        
        res.json({
            success: true,
            message: 'Item added to cart successfully',
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        
        let cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );
        
        cart.totalAmount = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        await cart.save();
        await cart.populate('items.product', 'name price image category');
        
        res.json({
            success: true,
            message: 'Item removed from cart',
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update item quantity
exports.updateQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        
        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }
        
        let cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        const item = cart.items.find(
            item => item.product.toString() === productId
        );
        
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }
        
        // Check stock
        const product = await Product.findById(productId);
        if (product && product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Not enough stock available'
            });
        }
        
        item.quantity = quantity;
        
        cart.totalAmount = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        await cart.save();
        await cart.populate('items.product', 'name price image category');
        
        res.json({
            success: true,
            message: 'Quantity updated successfully',
            cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Clear cart
exports.clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        
        res.json({
            success: true,
            message: 'Cart cleared successfully',
            cart: { items: [], totalAmount: 0 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};