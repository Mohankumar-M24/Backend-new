const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateUser } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

/**
 * @route   POST /api/products
 * @desc    Create product
 * @access  Private (seller)
 */
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

/**
 * @route   GET /api/products
 * @desc    Get all products with filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (category && category !== '') {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    console.log(' Filter used:', filter);

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(' Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (seller)
 */
router.put('/:id', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (!product.seller || product.seller.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    console.error(' Update error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product
 * @access  Private (seller)
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (!product.seller || product.seller.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });

  } catch (err) {
    console.error(' Delete error:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Add review
 * @access  Private (buyer)
 */
router.post('/:id/reviews', authenticateUser, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    
    const user = await require('../models/User').findById(req.user._id);

    const newReview = {
      user: user._id,
      name: user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(newReview);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({ message: 'Review added successfully' });
  } catch (err) {
    console.error(' Review error:', err);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

module.exports = router;
