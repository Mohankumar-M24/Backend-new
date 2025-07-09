const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

//  Serve static files (e.g. uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  Root route (prevents "Cannot GET /")
app.get('/', (req, res) => {
  res.send(' Welcome to the E-Commerce API (Backend)');
});

//  Health check
app.get('/api/health', (req, res) => {
  res.send(' Backend is live');
});

//  API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/profile', require('./routes/profile'));
// app.use('/api/products', require('./routes/product')); // optional legacy
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/seller', require('./routes/sellerRoutes'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/store', require('./routes/store'));

//  Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log(' MongoDB connected'))
  .catch((err) => console.error(' MongoDB error:', err));

//  Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
