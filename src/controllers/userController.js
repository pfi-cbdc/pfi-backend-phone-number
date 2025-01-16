const axios = require('axios');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VERIFY_SERVICE_SID, TWILIO_BASE_URL } = require('../config/twilio');

const sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    console.log('Sending OTP to:', phoneNumber);

    let user = await prisma.user.findUnique({
      where: { phoneNumber }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber,
          verified: false
        }
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating OTP send');
      return res.status(200).json({ message: 'Verification code sent successfully' });
    }

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

    res.status(200).json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Error sending verification code' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Simulating OTP verification');
      const user = await prisma.user.findUnique({
        where: { phoneNumber }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const token = await generateAuthToken(user.id);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { verified: true }
      });

      return res.status(200).json({ user, token });
    }

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

    if (response.data.status === 'approved') {
      const user = await prisma.user.findUnique({
        where: { phoneNumber }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const token = await generateAuthToken(user.id);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { verified: true }
      });

      res.status(200).json({ user, token });
    } else {
      res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Error verifying code' });
  }
};

const logout = async (req, res) => {
  try {
    console.log('Logging out user:', req.user.id, 'token:', req.token);
    
    // Delete the specific token used for authentication
    await prisma.token.deleteMany({
      where: {
        token: req.token
      }
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Error logging out' });
  }
};

const generateAuthToken = async (userId) => {
  const token = jwt.sign({ _id: userId }, process.env.JWT_SECRET || 'your-secret-key');
  
  await prisma.token.create({
    data: {
      token,
      userId
    }
  });

  return token;
};

module.exports = {
  sendOTP,
  verifyOTP,
  logout
};
