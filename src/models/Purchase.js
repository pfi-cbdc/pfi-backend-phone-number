const { prisma } = require('../config/db');

class Purchase {
    static async create(data) {
        return prisma.purchase.create({
            data: {
                ...data,
                user: {
                    connect: { id: data.userId }
                }
            }
        });
    }

    static async update(id, data) {
        return prisma.purchase.update({
            where: { id },
            data: {
                ...data
            }
        });
    }

    static async findMany(where) {
        return prisma.purchase.findMany({
            where
        });
    }
}

module.exports = Purchase;

