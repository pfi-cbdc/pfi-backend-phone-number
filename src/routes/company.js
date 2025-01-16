const express = require('express');
const auth = require('../middleware/auth');
const { getCompanyDetails, updateCompanyDetails } = require('../controllers/companyController');

const router = express.Router();

// Get company details
router.get('/details', auth, getCompanyDetails);

// Create or update company details
router.post('/details', auth, updateCompanyDetails);

module.exports = router;
