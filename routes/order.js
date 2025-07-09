const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { placeOrder } = require('../controllers/orderController');
const Order = require('../models/Order');

//  Place a new order (after successful Razorpay payment)
router.post('/', authenticateUser, placeOrder);

//  Get all orders for the logged-in buyer
router.get('/my-orders', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name price'); // Optional: add product info

    res.status(200).json(orders);
  } catch (err) {
    console.error(' Failed to fetch orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
