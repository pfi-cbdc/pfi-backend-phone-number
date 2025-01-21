const express = require('express');
const auth = require('../middleware/auth');
const { createPurchase, getPurchase, updatePurchaseStatus, getPurchasesByStatus } = require('../controllers/purchaseController');

const router = express.Router();

router.post('/create', auth, createPurchase);
router.get('/all', auth, getPurchase);
router.put('/:id/status', auth, updatePurchaseStatus);
router.get('/status/:status', auth, getPurchasesByStatus);

module.exports = router;
