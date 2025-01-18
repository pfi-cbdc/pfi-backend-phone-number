const { prisma } = require('../config/db');

const createPurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vendorId, productId, quantity, totalAmount } = req.body;
    const purchase = await prisma.purchase.create({
      data: {
        companyId: vendorId,
        productId,
        quantity,
        price: totalAmount / quantity,
        status: "PENDING",
        userId
      },
    });
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPurchase = async (req, res) => {
    try {
        const userId = req.user.id;
        const purchases = await prisma.purchase.findMany({
            where: { userId }
        });
        res.json(purchases);
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updatePurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const purchase = await prisma.purchase.update({
      where: { id },
      data: { status },
    });
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPurchase,
  getPurchase,
  updatePurchaseStatus
};
