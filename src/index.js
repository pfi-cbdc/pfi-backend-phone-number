const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Twilio Verify Service configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const VERIFY_SERVICE_SID = process.env.VERIFY_SERVICE_SID;
const TWILIO_BASE_URL = 'https://verify.twilio.com/v2/Services';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
});

// Generate auth token method
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET);
  
  user.tokens = user.tokens.concat({ token });
  await user.save();
  
  return token;
};

const User = mongoose.model('User', userSchema);

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Routes
app.post('/api/users/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    console.log('Sending OTP to:', phoneNumber);

    // Find or create user
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber });
      await user.save();
    }

    // For development/testing, always return success
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating OTP send');
      // The test verification code will be '123456'
      res.status(200).json({ message: 'Verification code sent successfully' });
      return;
    }

    // Send verification code using Twilio Verify
    const verifyUrl = `${TWILIO_BASE_URL}/${VERIFY_SERVICE_SID}/Verifications`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await axios.post(verifyUrl, 
      new URLSearchParams({
        'To': phoneNumber,
        'Channel': 'sms'
      }).toString(),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Twilio response:', response.data);
    res.status(200).json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Error:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

app.post('/api/users/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    console.log('Verifying OTP for:', phoneNumber);

    // Verify the code using Twilio Verify
    const verifyUrl = `${TWILIO_BASE_URL}/${VERIFY_SERVICE_SID}/VerificationCheck`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await axios.post(verifyUrl,
      new URLSearchParams({
        'To': phoneNumber,
        'Code': code
      }).toString(),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Verification response:', response.data);

    if (response.data.status === 'approved') {
      // Find and update user
      const user = await User.findOne({ phoneNumber });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.verified = true;
      await user.save();

      // Generate token
      const token = await user.generateAuthToken();
      
      res.status(200).json({ 
        message: 'Phone number verified successfully',
        user,
        token 
      });
    } else {
      res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Logout endpoint
app.post('/api/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});