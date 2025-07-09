exports.sellerOnly = (req, res, next) => {
  if (req.user.role !== 'seller') return res.status(403).send('Access denied: Seller only');
  next();
};

exports.buyerOnly = (req, res, next) => {
  if (req.user.role !== 'buyer') return res.status(403).send('Access denied: Buyer only');
  next();
};