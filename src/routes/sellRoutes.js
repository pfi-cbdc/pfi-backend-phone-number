const express = require('express');
const auth = require('../middleware/auth');
const { createProduct, getProduct, deleteProduct } = require('../controllers/sellController');

const router = express.Router();

// Create Purchase of products
router.post('/addProduct', auth, createProduct);
router.get('/getProducts', auth, getProduct);
router.delete('/product/:productId', auth, deleteProduct);

module.exports = router;
