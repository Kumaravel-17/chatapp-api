const User = require("../models/User");
const Conversation = require("../models/Conversation");
const { sendToEmail } = require("../services/emailService");
const twilioService = require("../services/twilioservice");
const otpGenerator = require("../utils/otpGenerator");
const responseHandler = require("../utils/responseHandler");
const generateToken = require("../utils/tokenGenerator");

const sendOtp = async (req, res) => {
  const { email, phoneNumber, phoneSuffix } = req.body;

  try {
    // ========== EMAIL FLOW ==========
    if (email) {
      const otp = otpGenerator(6);
      const expiry = new Date(Date.now() + 5 * 60 * 1000);
      let foundUser = await User.findOne({ email });
      
      if (!foundUser) {
        // Create new user with email
        foundUser = new User({ 
          email, 
          emailOtp: otp,
          emailOtpExpires: expiry
        });
      } else {
        // Update existing user
        foundUser.emailOtp = otp;
        foundUser.emailOtpExpires = expiry;
      }
      
      await foundUser.save();
      await sendToEmail(email, otp);
      
      return responseHandler(res, 200, true, "OTP sent to your email", { email });
    }

    // ========== PHONE FLOW (TWILIO VERIFY) ==========
    if (phoneNumber) {
      if (!phoneSuffix) {
        return responseHandler(res, 400, false, "Phone suffix is required");
      }

      // Store full phone number (suffix + number)
      const fullPhoneNumber = phoneSuffix + phoneNumber;
      
      let foundUser = await User.findOne({ phoneNumber: fullPhoneNumber });

      if (!foundUser) {
        // Create new user with phone
        foundUser = new User({ 
          phoneNumber: fullPhoneNumber,
          phoneSuffix
          // No phoneOtp or phoneOtpExpires needed - Twilio handles it
        });
      } else {
        // Update suffix in case it changed
        foundUser.phoneSuffix = phoneSuffix;
      }
      
      await foundUser.save();
      
      // Send OTP via Twilio Verify (Twilio generates the OTP)
      await twilioService.sentOtpTonumber(fullPhoneNumber);
      
      return responseHandler(res, 200, true, "OTP sent to your phone", { 
        phoneNumber: fullPhoneNumber 
      });
    }

    return responseHandler(res, 400, false, "Email or phone number is required");
    
  } catch (error) {
    console.log("Error sending OTP:", error);
    return responseHandler(res, 500, false, "Failed to send OTP");
  }
};

const verifyOtp = async (req, res) => {
  const { email, phoneNumber, phoneSuffix, otp } = req.body;

  try {
    let foundUser;

    // ========== EMAIL VERIFICATION ==========
    if (email) {
      foundUser = await User.findOne({ email });
      console.log("Found user for email verification:", foundUser);
      
      if (!foundUser) {
        return responseHandler(res, 404, false, "User not found");
      }

      // Check expiry
      const now = new Date();
      if (now > foundUser.emailOtpExpires) {
        return responseHandler(res, 400, false, "OTP has expired");
      }

      // Verify OTP
      if (foundUser.emailOtp !== otp) {
        return responseHandler(res, 400, false, "Invalid OTP");
      }

      // Clear OTP and verify user
      foundUser.isVerified = true;
      foundUser.emailOtp = null;
      foundUser.emailOtpExpires = null;
      await foundUser.save();

      // Generate token
      const token = generateToken(foundUser._id);
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });

      return responseHandler(res, 200, true, "OTP verified successfully", {
        token,
        user: foundUser,
      });
    }

    // ========== PHONE VERIFICATION (TWILIO VERIFY) ==========
    if (phoneNumber && phoneSuffix) {
      const fullPhoneNumber = phoneSuffix + phoneNumber;
      
      foundUser = await User.findOne({ phoneNumber: fullPhoneNumber });

      if (!foundUser) {
        return responseHandler(res, 404, false, "User not found");
      }

      // Verify OTP with Twilio Verify API
      const result = await twilioService.verifyOtp(fullPhoneNumber, otp);
      
      if (result.status !== "approved") {
        return responseHandler(res, 400, false, "Invalid or expired OTP");
      }

      // Mark user as verified
      foundUser.isVerified = true;
      await foundUser.save();

      // Generate token
      const token = generateToken(foundUser._id);
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });

      return responseHandler(res, 200, true, "OTP verified successfully", {
        token,
        user: foundUser,
      });
    }

    return responseHandler(res, 400, false, "Email or phone number with suffix is required");
    
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return responseHandler(res, 500, false, "Failed to verify OTP");
  }
};

const updateProfile = async (req, res) => {
  const { agreed, userName ,about} = req.body;

const userId = req.user.userId;


   console.log(req.user.userId);
  try {
    const foundUser = await User.findById(userId);

    if (!foundUser) {
      return responseHandler(res, 404, false, "User not found");
    }
    const file = req.file;
    if (file) {
      const { uploadFileToCloudinary } = require("../config/clouldinaryConfig");
      const result = await uploadFileToCloudinary(file);
      foundUser.profile_picture = result.secure_url;
    }else if(req.body.profile_picture){
      foundUser.profile_picture=req.body.profile_picture;
    }
    
  
    
    if (agreed ) foundUser.agreed = agreed;
    if (userName ) foundUser.userName = userName;
    if (about ) foundUser.about = about;
    console.log("Updated user data:", {
      agreed: foundUser.agreed,
      userName: foundUser.userName,
      about: foundUser.about,
      profile_picture: foundUser.profile_picture
    });
    await foundUser.save();

    return responseHandler(res, 200, true, "Profile updated successfully", {
      user: foundUser,
    });
  } catch (error) {
    return responseHandler(res, 500, false, "internal server error");
  }
}
const checkAuthenticated = async (req, res) => {
  const userId = req.user.userId;

  try {
    const foundUser = await User.findById(userId);

    if (!foundUser) {
      return responseHandler(res, 404, false, "User not found");
    }

    return responseHandler(res, 200, true, "User is authenticated", {
      user: foundUser,
    });
  } catch (error) {
    return responseHandler(res, 500, false, "Internal server error");
  }
}
const getAllUsers = async (req, res) => {
  const activeUser = req.user;
  try {
    const users = await User.find({ _id: { $ne: activeUser.userId } }).select("-emailOtp -emailOtpExpires -phoneOtp -phoneOtpExpires -__v -createdAt -updatedAt   -agreed -phoneSuffix").lean();
 const userWithConversation = await Promise.all(
  users.map(async (user) => {
    const conversation = await Conversation.findOne({
      members: { $all: [activeUser.userId, user._id] }
    })
      .populate({
        path: "lastMessage",
        select: "content createdAt sender receiver"
      })
      .lean();

    return {
      ...user,
      conversation: conversation || 0
    };
  })
);

    
    return responseHandler(res, 200, true, "Users retrieved successfully", { userWithConversation });
  } catch (error) {
    return responseHandler(res, 500, false, "Internal server error");
  }
}

const logout = async (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return responseHandler(res, 200, true, "Logged out successfully");
}



module.exports = { sendOtp, verifyOtp, updateProfile,logout,checkAuthenticated,getAllUsers };