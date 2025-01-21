const { prisma } = require('../config/db');

const createPurchase = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vendorId, productId, quantity, totalAmount } = req.body;
    
    console.log('📦 Creating purchase with details:', {
      userId,
      vendorId,
      productId,
      quantity,
      totalAmount
    });

    const purchase = await prisma.purchase.create({
      data: {
        companyId: vendorId,
        productId,
        quantity,
        price: totalAmount / quantity,
        status: "PENDING",
        userId,
        vendorId,
        isVendorAccepted: false
      },
      include: {
        company: true,
        product: true,
        user: true
      }
    });

    console.log('✅ Purchase created successfully:', purchase);
    res.json(purchase);
  } catch (error) {
    console.error('❌ Error creating purchase:', error);
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
        
        const transformedPurchases = purchases.map(purchase => ({
            ...purchase,
            vendor: purchase.company ? {
                brandName: purchase.company.brandName,
                companyName: purchase.company.companyName
            } : undefined,
            product: purchase.product ? {
                productName: purchase.product.productName
            } : undefined,
            company: undefined
        }));
        
        res.json(transformedPurchases);
    } catch (error) {
        console.error('Error fetching purchases:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getVendorSales = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('🔍 Finding company for user:', userId);

        // First get the company ID for this user
        const company = await prisma.company.findFirst({
            where: { userId }
        });

        if (!company) {
            console.warn('⚠️ No company found for user:', userId);
            return res.status(404).json({ error: 'No company found for this user' });
        }

        const vendorId = company.id;
        console.log('🏢 Found company:', { companyId: vendorId, companyName: company.companyName });

        console.log('🔍 Fetching sales for vendor:', vendorId);

        const sales = await prisma.purchase.findMany({
            where: { vendorId },
            include: {
                user: {
                    select: {
                        phoneNumber: true
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
        
        console.log(`📊 Found ${sales.length} sales for vendor:`, {
            vendorId,
            sales: sales.map(s => ({
                id: s.id,
                status: s.status,
                productId: s.productId,
                buyerPhone: s.user?.phoneNumber
            }))
        });

        const transformedSales = sales.map(sale => ({
            ...sale,
            buyer: {
                phoneNumber: sale.user?.phoneNumber
            },
            product: sale.product ? {
                productName: sale.product.productName
            } : undefined,
            user: undefined
        }));
        
        res.json(transformedSales);
    } catch (error) {
        console.error('❌ Error fetching sales:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updatePurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // First, get the purchase to check permissions
    const purchase = await prisma.purchase.findUnique({
      where: { id }
    });

    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    // Check if the user is either the buyer or the vendor
    if (purchase.userId !== userId && purchase.vendorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this purchase' });
    }

    // If the user is the vendor and trying to accept/reject
    if (purchase.vendorId === userId) {
      if (status === 'IN_PROGRESS') {
        await prisma.purchase.update({
          where: { id },
          data: { 
            status,
            isVendorAccepted: true 
          }
        });
      } else if (status === 'FAILED') {
        await prisma.purchase.update({
          where: { id },
          data: { 
            status,
            isVendorAccepted: false 
          }
        });
      }
    }
    // If the user is the buyer
    else if (purchase.userId === userId) {
      // Buyer can only update if vendor has accepted
      if (purchase.isVendorAccepted || status === 'FAILED') {
        await prisma.purchase.update({
          where: { id },
          data: { status }
        });
      } else {
        return res.status(400).json({ error: 'Cannot update status until vendor accepts' });
      }
    }

    const updatedPurchase = await prisma.purchase.findUnique({
      where: { id },
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

    res.json(updatedPurchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPurchasesByStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.params;
        const { type } = req.query; // 'purchase' or 'sale'
        
        console.log('🔍 Fetching', type, 'by status:', {
            userId,
            status,
            type
        });

        // Validate status
        const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'];
        if (!validStatuses.includes(status) && status !== 'ALL') {
            console.warn('⚠️ Invalid status requested:', status);
            return res.status(400).json({ error: 'Invalid status' });
        }

        let whereClause;
        
        if (type === 'sale') {
            // For sales, first get the company ID
            const company = await prisma.company.findFirst({
                where: { userId }
            });

            if (!company) {
                console.warn('⚠️ No company found for user:', userId);
                return res.status(404).json({ error: 'No company found for this user' });
            }

            console.log('🏢 Found company:', { companyId: company.id, companyName: company.companyName });
            
            whereClause = {
                ...(status !== 'ALL' && { status }),
                vendorId: company.id
            };
        } else {
            whereClause = {
                ...(status !== 'ALL' && { status }),
                userId
            };
        }

        console.log('🔎 Using where clause:', whereClause);

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
                },
                user: {
                    select: {
                        phoneNumber: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        console.log(`📊 Found ${purchases.length} ${type}s:`, {
            items: purchases.map(p => ({
                id: p.id,
                status: p.status,
                vendorId: p.vendorId,
                userId: p.userId
            }))
        });

        // Transform based on type
        const transformedData = purchases.map(item => ({
            ...item,
            ...(type === 'sale' 
                ? {
                    buyer: { phoneNumber: item.user?.phoneNumber },
                    user: undefined
                  }
                : {
                    vendor: item.company ? {
                        brandName: item.company.brandName,
                        companyName: item.company.companyName
                    } : undefined,
                    company: undefined
                  }
            ),
            product: item.product ? {
                productName: item.product.productName
            } : undefined
        }));
        
        res.json(transformedData);
    } catch (error) {
        console.error('❌ Error fetching by status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    createPurchase,
    getPurchase,
    updatePurchaseStatus,
    getPurchasesByStatus,
    getVendorSales
};
