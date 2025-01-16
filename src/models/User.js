const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

class User {
  static async generateAuthToken(userId) {
    const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET || 'your-secret-key');
    
    await prisma.token.create({
      data: {
        token,
        userId
      }
    });

    return token;
  }

  static async findByToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await prisma.user.findUnique({
        where: { id: decoded._id }
      });
      return user;
    } catch (error) {
      return null;
    }
  }
}

module.exports = User;
