const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded:', decoded);

    const existingToken = await prisma.token.findUnique({
      where: { token },
      include: { user: true }, // Include associated user
    });
    console.log('Existing token:', existingToken);
    if (!existingToken || !existingToken.user) {
      throw new Error();
    }

    req.token = token; // Attach the token to the request
    req.user = existingToken.user; // Attach the user to the request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth;
