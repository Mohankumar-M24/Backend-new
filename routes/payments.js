const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticateUser } = require('../middleware/auth');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

//  Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ order });
  } catch (err) {
    console.error(' Razorpay create-order failed:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

//  Verify Razorpay payment and save full order in DB
router.post('/verify', authenticateUser, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cart,
      totalAmount,
      shippingInfo,
    } = req.body;

    // Step 1: Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Step 2: Save order
    const newOrder = new Order({
      user: req.user._id,
      items: cart,
      totalAmount,
      razorpay_payment_id,
      razorpay_order_id,
      status: 'Paid',
      shippingInfo, //  new field
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order saved', order: newOrder });
  } catch (err) {
    console.error(' Payment verification error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
