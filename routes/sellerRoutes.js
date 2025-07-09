const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const Order = require('../models/Order');

//  GET all orders for a seller
router.get('/orders', authenticateUser, async (req, res) => {
  try {
    const sellerId = req.user._id.toString();
    console.log(' Authenticated seller ID:', sellerId);

    const orders = await Order.find({ 'items.seller': sellerId })
      .populate('items.product', 'name price')
      .populate('user', 'name email');

    console.log(' Seller orders found:', orders.length);

    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error(' Failed to fetch seller orders:', err);
    res.status(500).json({ error: 'Failed to fetch seller orders' });
  }
});

//  PUT: Update shipping status of an item in an order
router.put('/orders/:orderId/items/:itemId/status', authenticateUser, async (req, res) => {
  const { orderId, itemId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found in order' });

    item.shippingStatus = status || 'Shipped';
    await order.save();

    console.log(` Shipping status updated: ${item.product} → ${item.shippingStatus}`);
    res.json({ success: true, item });
  } catch (err) {
    console.error(' Failed to update shipping status:', err);
    res.status(500).json({ error: 'Failed to update shipping status' });
  }
});

module.exports = router;
