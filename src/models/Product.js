const { prisma } = require('../config/db');

class Product {
  static async create(data) {
    return prisma.product.create({
      data: {
        ...data,
        user: {
          connect: { id: data.userId }
        }
      }
    });
  }

  static async findByUserId(userId) {
    return prisma.product.findMany({
      where: {
        userId
      }
    });
  }

  static async findById(id) {
    return prisma.product.findUnique({
      where: { id }
    });
  }
}

module.exports = Product;
