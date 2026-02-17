const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values without uniqueness conflicts
  },
  phoneSuffix: {
    type: String,
    required: false,
  },
  userName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null/undefined values without uniqueness conflicts
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  
  // Email OTP fields
  emailOtp: {
    type: String,
    required: false,
  },
  emailOtpExpires: {
    type: Date,
    required: false,
  },
  // ✅ ADDED: Phone OTP fields
  phoneOtp: {
    type: String,
    required: false,
  },
  phoneOtpExpires: {
    type: Date,
    required: false,
  },
  profile_picture: {
    type: String,
    required: false,
  },
  about: {
    type: String,
    required: false,
  },
  lastSeen: {
    type: Date,
    required: false,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  agreed: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;