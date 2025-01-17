const express = require('express');
const auth = require('../middleware/auth');
const { createProduct, getProduct } = require('../controllers/sellController');

const router = express.Router();

// Create Purchase of products
router.post('/addProduct', auth, createProduct);
router.get('/getProducts', auth, getProduct);

module.exports = router;
