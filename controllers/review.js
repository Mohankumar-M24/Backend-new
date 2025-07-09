const reviews = [];

exports.addReview = (req, res) => {
  reviews.push(req.body);
  res.send('Review submitted');
};

exports.getReviews = (req, res) => {
  res.json(reviews);
};