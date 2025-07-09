const Order = require("../models/Order");

exports.getSellerOrders = async (req, res) => {
  const sellerId = req.user._id;

  try {
    const orders = await Order.find({ "items.seller": sellerId })
      .populate("items.product", "name price") // populate product name and price
      .populate("items.seller", "name") // optional: get seller name
      .populate("user", "name email") // get buyer info
      .sort({ createdAt: -1 }); // newest orders first

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};
