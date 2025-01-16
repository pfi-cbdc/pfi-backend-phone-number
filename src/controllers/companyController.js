const Company = require('../models/Company');

// Get company details
const getCompanyDetails = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    
    if (!company) {
      return res.status(404).json({ error: 'Company details not found' });
    }
    
    res.json(company);
  } catch (error) {
    console.error('Error fetching company details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create or update company details
const updateCompanyDetails = async (req, res) => {
  try {
    const updates = {
      userId: req.user._id,
      companyName: req.body.companyName,
      gstin: req.body.gstin,
      brandName: req.body.brandName,
      email: req.body.email,
      pan: req.body.pan,
      alternateContact: req.body.alternateContact,
      website: req.body.website
    };

    const company = await Company.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, upsert: true, runValidators: true }
    );

    res.json(company);
  } catch (error) {
    console.error('Error updating company details:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid input data' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCompanyDetails,
  updateCompanyDetails
};
