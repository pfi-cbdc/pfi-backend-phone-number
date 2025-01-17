const express = require('express');
const auth = require('../middleware/auth');
const { createPurchase, getPurchase, updatePurchaseStatus } = require('../controllers/purchaseConroller');

const router = express.Router();

router.post('/create', auth, createPurchase);
router.get('/all', auth, getPurchase);
router.put('/:id/status', updatePurchaseStatus);

module.exports = router;
