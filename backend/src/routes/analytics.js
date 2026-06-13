const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/analyticsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);
router.get('/dashboard', getDashboard);

module.exports = router;
