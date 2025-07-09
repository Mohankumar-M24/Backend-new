// controllers/productController.js or routes/product.js
const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;

    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // case-insensitive
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};
