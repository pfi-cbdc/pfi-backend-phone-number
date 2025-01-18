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

module.exports = { createProduct, getProduct };
