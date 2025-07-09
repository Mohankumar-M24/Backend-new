const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../middleware/upload');

// Create product (seller only)
router.post('/', upload.single('image'), async (req, res) => {
  const { name, description, price, category, seller } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const product = new Product({ name, description, price, category, seller, image });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Get all products (with optional filters later)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

//  Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

module.exports = router;
