const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

//  GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

//  UPDATE PROFILE (Name, Email, Avatar) 
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updatedFields = { name, email };
    if (avatar) updatedFields.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updatedFields,
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// FORGOT PASSWORD 
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = token;
    user.tokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    // Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset</p>
             <p><a href="${resetLink}">Click to reset</a></p>`
    });

    res.json({ message: 'Reset link sent to email' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reset link' });
  }
};

// RESET PASSWORD 
exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      tokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    const hash = await bcrypt.hash(req.body.newPassword, 10);
    user.password = hash;
    user.resetToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
