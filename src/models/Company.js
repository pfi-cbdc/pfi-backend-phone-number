const { prisma } = require('../config/db');

class Company {
  static async create(data) {
    return prisma.company.create({
      data: {
        ...data,
        user: {
          connect: { id: data.userId }
        }
      }
    });
  }

  static async findByUserId(userId) {
    return prisma.company.findMany({
      where: {
        userId
      }
    });
  }

  static async findById(id) {
    return prisma.company.findUnique({
      where: { id }
    });
  }
}

module.exports = Company;
