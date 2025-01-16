const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find the token in the database
    const dbToken = await prisma.token.findFirst({
      where: {
        token: token
      },
      include: {
        user: true
      }
    });

    if (!dbToken || !dbToken.user) {
      throw new Error('Token not found or invalid');
    }

    req.token = token;
    req.user = dbToken.user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth;
