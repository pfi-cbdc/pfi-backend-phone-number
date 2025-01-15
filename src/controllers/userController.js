const axios = require('axios');
const User = require('../models/User');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VERIFY_SERVICE_SID, TWILIO_BASE_URL } = require('../config/twilio');

const sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    console.log('Sending OTP to:', phoneNumber);

    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber });
      await user.save();
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
      const user = await User.findOne({ phoneNumber });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.verified = true;
      await user.save();

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
};

const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
    await req.user.save();
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  logout
};
