const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/company');
const sellRoutes = require('./routes/sellRoutes');
const purchaseRoutes = require('./routes/purchase');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'PFI API is running healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Connect to Database
connectDB()
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/sell', sellRoutes);
app.use('/api/purchase', purchaseRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});