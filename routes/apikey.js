const express = require('express');
const router = express.Router();
const { generateKey, revokeKey } = require('../controllers/apiKeyController');
const auth = require('../middleware/auth');

router.post('/generate', auth, generateKey);
router.post('/revoke', auth, revokeKey);

module.exports = router;