const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL with Prisma');
  } catch (err) {
    console.error('Prisma connection error:', err);
    process.exit(1);
  }
};

connectDB();

module.exports = prisma;