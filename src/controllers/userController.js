const axios = require('axios');
const { PrismaClient } = require('@prisma/client'); // Imported Prisma Client
const jwt = require('jsonwebtoken'); // Added JWT for token generation
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VERIFY_SERVICE_SID, TWILIO_BASE_URL } = require('../config/twilio');

const prisma = new PrismaClient(); // Initialize Prisma Client

// Generate a JWT token for the user
const generateAuthToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    console.log('Sending OTP to:', phoneNumber);

    // Find user by phone number using Prisma
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    // Create user if not found
    if (!user) {
      user = await prisma.user.create({
        data: { phoneNumber },
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating OTP send');
      return res.status(200).json({ message: 'Verification code sent successfully' });
    }

    const verifyUrl = `${TWILIO_BASE_URL}/${VERIFY_SERVICE_SID}/Verifications`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await axios.post(
      verifyUrl,
      new URLSearchParams({
        'To': phoneNumber,
        'Channel': 'sms',
      }).toString(),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('Twilio response:', response.data);
    res.status(200).json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Error:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    console.log('Verifying OTP for:', phoneNumber);

    const verifyUrl = `${TWILIO_BASE_URL}/${VERIFY_SERVICE_SID}/VerificationCheck`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await axios.post(
      verifyUrl,
      new URLSearchParams({
        'To': phoneNumber,
        'Code': code,
      }).toString(),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('Verification response:', response.data);

    if (response.data.status === 'approved') {
      // Fetch the user using Prisma
      const user = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user's verified status
      await prisma.user.update({
        where: { phoneNumber },
        data: { verified: true },
      });

      // Generate a JWT token
      const token = generateAuthToken(user.id);

      // Store the token in the Token table
      await prisma.token.create({
        data: {
          token,
          userId: user.id,
        },
      });

      res.status(200).json({
        message: 'Phone number verified successfully',
        user,
        token,
      });
    } else {
      res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const { token } = req.body;
    const existingToken = await prisma.token.findFirst({
      where: { token },
      include: { user: true },
    });
    const user = existingToken?.user;
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    const { token } = req.body;

    // Find the token in the Token table using Prisma
    const existingToken = await prisma.token.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return res.status(404).json({ error: 'Token not found' });
    }

    // Delete the token from the Token table
    await prisma.token.delete({
      where: { id: existingToken.id },
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  logout,
  getUserInfo,
};
