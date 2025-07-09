const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const productRoutes = require('./routes/productRoutes');

dotenv.config();
const app = express();

//  Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

//  Serve static files (avatar, product images, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  Health Check Route
app.get('/api/health', (req, res) => {
  res.send(' Backend is live');
});

//  API Routes
app.use('/api/auth', require('./routes/auth'));              
app.use('/api/users', require('./routes/user'));             
app.use('/api/profile', require('./routes/profile'));        
//app.use('/api/products', require('./routes/product'));       
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

//  Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
