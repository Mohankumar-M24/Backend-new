const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();

const app = express();

// ✅ CORS middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://unique-yeot-c1eed6.netlify.app', // e.g., https://courageous-horse-18f999.netlify.app
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// ✅ Body parser & cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Serve static images (e.g. product uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Root route for sanity check
app.get('/', (req, res) => {
  res.send('✅ Welcome to the E-Commerce API (Backend)');
});

// ✅ Health check route for frontend to ping
app.get('/api/health', (req, res) => {
  res.send('✅ Backend is live');
});

// ✅ API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/profile', require('./routes/profile'));
// app.use('/api/products', require('./routes/product')); // optional legacy
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/seller', require('./routes/sellerRoutes'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/store', require('./routes/store'));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
