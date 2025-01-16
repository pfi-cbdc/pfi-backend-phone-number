const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/company');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB()
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});