const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);
router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrder);
router.get('/', requireAdmin, getAllOrders);
router.put('/:id/status', requireAdmin, updateOrderStatus);

module.exports = router;
