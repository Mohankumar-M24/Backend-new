const Order = require('../models/Order');
const Product = require('../models/Product');

exports.placeOrder = async (req, res) => {
  const { orderItems, razorpay_payment_id, razorpay_order_id, totalPrice } = req.body;
  const userId = req.user._id;

  try {
    const populatedItems = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }

        return {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          seller: product.seller, 
          shippingStatus: 'Pending',
        };
      })
    );

    const order = new Order({
      user: userId,
      items: populatedItems, 
      totalAmount: totalPrice,
      razorpay_payment_id,
      razorpay_order_id,
      status: 'Paid',
    });

    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error(' Order creation failed:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
