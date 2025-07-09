const razorpay = require('../utils/razorpay');

exports.createRazorpayOrder = async (req, res) => {
  const { amount } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: 'order_rcptid_' + Math.random()
    });
    res.json(order);
  } catch (err) {
    res.status(500).send('Payment order creation failed');
  }
};