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
            where: { userId },
            include: {
                company: {
                    select: {
                        brandName: true,
                        companyName: true
                    }
                },
                product: {
                    select: {
                        productName: true
                    }
                }
            }
        });
        
        // Transform the data to match the frontend interface
        const transformedPurchases = purchases.map(purchase => ({
            ...purchase,
            vendor: purchase.company ? {
                brandName: purchase.company.brandName,
                companyName: purchase.company.companyName
            } : undefined,
            product: purchase.product ? {
                productName: purchase.product.productName
            } : undefined,
            company: undefined // Remove the original company field
        }));
        
        res.json(transformedPurchases);
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

const getPurchasesByStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.params;
        
        // Validate status
        const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'];
        if (!validStatuses.includes(status) && status !== 'ALL') {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Build the where clause
        const whereClause = {
            userId,
            ...(status !== 'ALL' && { status })
        };

        const purchases = await prisma.purchase.findMany({
            where: whereClause,
            include: {
                company: {
                    select: {
                        brandName: true,
                        companyName: true
                    }
                },
                product: {
                    select: {
                        productName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        // Transform the data to match the frontend interface
        const transformedPurchases = purchases.map(purchase => ({
            ...purchase,
            vendor: purchase.company ? {
                brandName: purchase.company.brandName,
                companyName: purchase.company.companyName
            } : undefined,
            product: purchase.product ? {
                productName: purchase.product.productName
            } : undefined,
            company: undefined // Remove the original company field
        }));
        
        res.json(transformedPurchases);
    } catch (error) {
        console.error('Error fetching purchases by status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
  createPurchase,
  getPurchase,
  updatePurchaseStatus,
  getPurchasesByStatus
};
