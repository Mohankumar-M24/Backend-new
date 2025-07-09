const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

const authenticateUser = async (req, res, next) => {
  const token = req.cookies.token; //  Read token from cookies

  console.log(" Incoming cookie token:", token); //  Debug log

  if (!token) {
    console.log(" No token found in cookies");
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(" Token verified. Decoded:", decoded);

    
    req.user = {
      _id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error(" Token verification failed:", err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { authenticateUser };
