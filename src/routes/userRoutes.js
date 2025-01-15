const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendOTP, verifyOTP, logout, getUserInfo } = require('../controllers/userController');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/logout', auth, logout);

router.post('/userInfo', getUserInfo);

module.exports = router;
