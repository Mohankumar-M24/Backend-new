const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

//  Get current user profile
router.get('/me', authenticateUser, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

//  Update profile (name, email, phone)
router.put('/me', authenticateUser, async (req, res) => {
  const { name, email, phone } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ message: 'User not found' });

  user.name = name || user.name;
  user.email = email || user.email;
  user.phone = phone || user.phone;

  await user.save();
  res.json({ success: true, user });
});

//  Change password
router.put('/change-password', authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = router;
