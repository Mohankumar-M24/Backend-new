// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      price: Number,
      quantity: Number,
      seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

      //  Add this field for per-item shipping tracking
      shippingStatus: {
        type: String,
        enum: ['Pending', 'Shipped', 'Out for Delivery', 'Delivered'],
        default: 'Pending',
      },
    },
  ],

  totalAmount: Number,
  razorpay_payment_id: String,
  razorpay_order_id: String,
  status: { type: String, default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
