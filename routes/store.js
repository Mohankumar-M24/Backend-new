const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const Store = require('../models/Store');

// POST: Create store (only once)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const existing = await Store.findOne({ seller: req.user._id });
    if (existing) return res.status(400).json({ message: 'Store already exists' });

    const store = await Store.create({ ...req.body, seller: req.user._id });
    res.status(201).json(store);
  } catch (err) {
    console.error('Store creation failed:', err);
    res.status(500).json({ message: 'Failed to create store' });
  }
});

// GET: Seller's store
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const store = await Store.findOne({ seller: req.user._id });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch store' });
  }
});

// PUT: Update store
router.put('/', authenticateUser, async (req, res) => {
  try {
    const updated = await Store.findOneAndUpdate(
      { seller: req.user._id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update store' });
  }
});

module.exports = router;
