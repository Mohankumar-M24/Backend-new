const ApiKey = require('../models/ApiKey');
const crypto = require('crypto');

exports.generateKey = async (req, res) => {
  const { name } = req.body;
  const key = crypto.randomBytes(32).toString('hex');

  const apiKey = new ApiKey({
    name,
    key,
    owner: req.user.id
  });

  await apiKey.save();
  res.json({ key });
};

exports.revokeKey = async (req, res) => {
  const { key } = req.body;
  const apiKey = await ApiKey.findOne({ key, owner: req.user.id });

  if (!apiKey) return res.status(404).json({ error: 'API key not found' });

  apiKey.active = false;
  await apiKey.save();

  res.json({ message: 'API key revoked' });
};