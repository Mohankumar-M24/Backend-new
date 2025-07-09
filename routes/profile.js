const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

//  Setup multer for avatar upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

//  GET /api/profile/me
router.get('/me', authenticateUser, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

//  PUT /api/profile/me
router.put('/me', authenticateUser, upload.single('avatar'), async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  if (req.file) {
    user.avatar = `/uploads/${req.file.filename}`;
  }

  await user.save();
  res.json(user);
});

//  PUT /api/profile/change-password
router.put('/change-password', authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

module.exports = router;
