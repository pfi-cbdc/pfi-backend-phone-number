const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const VERIFY_SERVICE_SID = process.env.VERIFY_SERVICE_SID;
const TWILIO_BASE_URL = 'https://verify.twilio.com/v2/Services';

module.exports = {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  VERIFY_SERVICE_SID,
  TWILIO_BASE_URL
};
