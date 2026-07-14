const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/product');

// ==================== CREATE ORDER ====================
exports.createOrder = async (req, res) => {
    try {
        console.log('🔵 STEP 1: Order creation started');
        console.log('📝 User ID:', req.userId);
        console.log('📦 Request body:', req.body);

        const { shippingAddress, paymentMethod } = req.body;

        if (!shippingAddress || !paymentMethod) {
            console.log('❌ Missing shippingAddress or paymentMethod');
            return res.status(400).json({
                success: false,
                message: 'Please provide shipping address and payment method'
            });
        }

        console.log('✅ STEP 2: Validation passed');

        // Get user's cart
        const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
        console.log('🛒 Cart found:', cart ? 'Yes' : 'No');

        if (!cart || cart.items.length === 0) {
            console.log('❌ Cart is empty');
            return res.status(400).json({
                success: false,
                message: 'Cart is empty. Add items before placing order.'
            });
        }

        console.log('✅ STEP 3: Cart has items');
        console.log('📊 Cart items:', cart.items.length);
        console.log('💰 Total amount:', cart.totalAmount);

        // Check stock
        for (let item of cart.items) {
            console.log(`🔍 Checking stock for: ${item.product.name}`);
            const product = await Product.findById(item.product._id);
            if (!product) {
                console.log(`❌ Product not found: ${item.product.name}`);
                return res.status(404).json({
                    success: false,
                    message: `Product not found`
                });
            }
            if (product.stock < item.quantity) {
                console.log(`❌ Insufficient stock for: ${product.name}`);
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }
        }

        console.log('✅ STEP 4: Stock check passed');

        // Create order items
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.price
        }));

        console.log('✅ STEP 5: Order items created');

        // Create order
        const order = new Order({
            user: req.userId,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            totalAmount: cart.totalAmount,
            status: 'pending'
        });

        console.log('✅ STEP 6: Order object created');

        await order.save();
        console.log('✅ STEP 7: Order saved to database');

        // Reduce stock
        for (let item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }
            });
        }
        console.log('✅ STEP 8: Stock updated');

        // Clear cart
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        console.log('✅ STEP 9: Cart cleared');

        res.status(201).json({
            success: true,
            message: 'Order placed successfully!',
            order
        });

    } catch (error) {
        console.error('❌❌❌ ORDER ERROR:', error);
        console.error('📋 Error details:', error.message);
        console.error('📚 Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack
        });
    }
};

// ==================== GET USER ORDERS ====================
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== GET SINGLE ORDER ====================
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this order'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== CANCEL ORDER ====================
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.user.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        if (order.status !== 'pending' && order.status !== 'processing') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.status}`
            });
        }

        // Restore product stock
        for (let item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        order.status = 'cancelled';
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};