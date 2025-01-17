const { prisma } = require('../config/db');

// Get company details
const getCompanyDetails = async (req, res) => {
  try {
    const company = await prisma.company.findFirst({
      where: { userId: req.user.id }
    });
    
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
      companyName: req.body.companyName,
      gstin: req.body.gstin,
      brandName: req.body.brandName,
      email: req.body.email,
      pan: req.body.pan,
      alternateContact: req.body.alternateContact,
      website: req.body.website
    };

    // First try to find existing company
    const existingCompany = await prisma.company.findFirst({
      where: { userId: req.user.id }
    });

    let company;
    if (existingCompany) {
      // Update existing company
      company = await prisma.company.update({
        where: { id: existingCompany.id },
        data: updates
      });
    } else {
      // Create new company
      company = await prisma.company.create({
        data: {
          ...updates,
          userId: req.user.id
        }
      });
    }

    res.json(company);
  } catch (error) {
    console.error('Error updating company details:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Duplicate entry found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllCompanies = async (req, res) => {
  try {
    if(!req.user.id) {
      console.log('User not found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const companies = await prisma.company.findMany();
    res.json(companies);
  } catch (error) {
    console.error('Error fetching all companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAssociatedProducts = async (req, res) => {
  try {
    const companyId = req.params.id;
    const company = await prisma.company.findFirst({
      where: { id: companyId }
    });
    const userId = company.userId;
    const products = await prisma.product.findMany({
      where: { userId }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching associated products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCompanyDetails,
  updateCompanyDetails,
  getAllCompanies,
  getAssociatedProducts
};
