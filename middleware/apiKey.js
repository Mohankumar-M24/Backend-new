const ApiKey = require('../models/ApiKey');

module.exports = async (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key) return res.status(401).json({ error: 'API key required' });

  const found = await ApiKey.findOne({ key, active: true });
  if (!found) return res.status(403).json({ error: 'Invalid or revoked API key' });

  next();
};