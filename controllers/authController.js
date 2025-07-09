const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const frontendUrl = process.env.FRONTEND_URL;

//  Register User
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(' Register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

//  Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    //  Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,           //  set to true in production with HTTPS
      sameSite: 'Lax',         //  important for cookie isolation
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    //  Send response (excluding token from body)
    res.status(200).json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(' Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};


//  Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.tokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${frontendUrl}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MyStore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Password',
      html: `<p>You requested a password reset</p>
             <p>Click here to reset: <a href="${resetLink}">${resetLink}</a></p>`,
    });

    res.json({ message: 'Reset link sent to your email.' });
  } catch (err) {
    console.error(' Forgot password error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
};

//  Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      tokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error(' Reset password error:', err);
    res.status(500).json({ error: 'Password reset failed' });
  }
};
