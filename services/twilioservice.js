const twilio = require("twilio");
//twilio credentials from .env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

//create twilio client
const client = twilio(accountSid, authToken);

const sentOtpTonumber = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({ to: `+${phoneNumber}`, channel: "sms" });

    return verification;
  } catch (error) {
    throw error;
  }
};

const verifyOtp = async (phoneNumber, code) => {
  try {
    if (!phoneNumber) {
      throw new Error("Phone number and OTP code are required");
    }
    if (!code) {
      throw new Error("OTP code is required");
    }
    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: `+${phoneNumber}`, code });
    return verificationCheck;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sentOtpTonumber,
  verifyOtp,
};
