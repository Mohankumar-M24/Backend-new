const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkApiKey = require('../middleware/apiKey');

// POST /api/cart/add
router.post('/add', auth, checkApiKey, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity required' });
  }

  // Simulate cart logic (DB saving can be added here)
  res.json({ message: `Added ${quantity} of product ${productId} to cart` });
});

module.exports = router;