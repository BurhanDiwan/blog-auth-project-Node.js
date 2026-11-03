const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  resetToken: {
    type: String,
    default: null,
    select: false
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
    select: false
  }
}, { timestamps: true })

const User = mongoose.model("User", userSchema)

module.exports = User
