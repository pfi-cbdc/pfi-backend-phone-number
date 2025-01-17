const express = require('express');
const auth = require('../middleware/auth');
const { getCompanyDetails, updateCompanyDetails, getAllCompanies, getAssociatedProducts } = require('../controllers/companyController');

const router = express.Router();

// Get company details
router.get('/details', auth, getCompanyDetails);

// Create or update company details
router.post('/details', auth, updateCompanyDetails);

// Get all the companies
router.get('/all', auth, getAllCompanies);

// Get all associated products when company id is passed in params
router.get('/products/:id', auth, getAssociatedProducts);

module.exports = router;
