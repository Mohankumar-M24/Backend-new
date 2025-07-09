const express = require('express');
const router = express.Router();
const { addReview, getReviews } = require('../controllers/review');

router.post('/', addReview);
router.get('/', getReviews);

module.exports = router;