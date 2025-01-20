const { prisma } = require('../config/db');

const createProduct = async (req, res) => {
    try {
        const { productName, sellingPrice, units } = req.body;
        const description = req.body.description || "";
        
        const product = await prisma.product.create({
            data: {
                userId: req.user.id,
                productName,
                units,
                sellingPrice: parseInt(sellingPrice),
                description
            }
        });
        
        console.log("Creation Success");
        res.json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to add new product' });
    }
};

const getProduct = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                userId: req.user.id
            }
        });
        console.log(products);
        res.json(products);
    } catch(error) {
        console.error("Not found");
        res.status(500).json({error: "Not found"});
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        
        // Check if product exists and belongs to the user
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                userId: req.user.id
            },
            include: {
                purchases: true
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found or unauthorized' });
        }

        // Check if product has associated purchases
        if (product.purchases && product.purchases.length > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete product with existing purchases. Please delete associated purchases first.',
                hasPurchases: true
            });
        }

        // Delete the product
        await prisma.product.delete({
            where: {
                id: productId
            }
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

module.exports = { createProduct, getProduct, deleteProduct };
