const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const User = require("../models/userModel")
const sendMail = require("../helpers/mailer")

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" })
}

const signup = async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill all fields" })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password should be minimum 6 characters" })
  }

  try {
    let userExists = await User.findOne({ email: email })
    if (userExists) {
      return res.status(409).json({ message: "This email is already taken" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    })
    await newUser.save()

    const token = createToken(newUser._id)

    res.status(201).json({
      message: "Registration successful",
      token,
      data: newUser
    })
  } catch (err) {
    res.status(500).json({ message: "Server error during registration" })
  }
}

const signin = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" })
  }

  try {
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(400).json({ message: "No account found with this email" })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" })
    }

    const token = createToken(user._id)

    res.status(200).json({
      message: "Login successful",
      token: token,
      data: user
    })
  } catch (err) {
    res.status(500).json({ message: "Login failed, try again" })
  }
}

const myProfile = async (req, res) => {
  const user = req.user
  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  })
}

const signout = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" })
}

const forgotPass = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ message: "Please provide your email" })
  }

  try {
    const user = await User.findOne({ email }).select("+resetToken +resetTokenExpiry")

    const msg = "If an account exists with this email, a reset link will be sent"

    if (!user) {
      return res.status(200).json({ message: msg })
    }

    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex")

    user.resetToken = hashed
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()

    const resetUrl = `http://localhost:${process.env.PORT || 5000}/api/auth/reset-password/${rawToken}`

    const emailBody = "You requested a password reset.\n\n" +
      "Reset token: " + rawToken + "\n\n" +
      "Reset API endpoint: " + resetUrl + "\n\n" +
      "This link expires in 15 minutes. Ignore this email if you didn't request it."

    try {
      await sendMail(user.email, "Password Reset Request", emailBody)
    } catch (emailErr) {
      user.resetToken = null
      user.resetTokenExpiry = null
      await user.save()
      console.log("Failed to send email:", emailErr.message)
      return res.status(500).json({ message: "Could not send reset email, please try later" })
    }

    return res.status(200).json({ message: msg })
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" })
  }
}

const resetPass = async (req, res) => {
  const token = req.params.token
  const { password } = req.body

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" })
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    }).select("+password +resetToken +resetTokenExpiry")

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or has expired" })
    }

    const salt = await bcrypt.genSalt(12)
    user.password = await bcrypt.hash(password, salt)
    user.resetToken = null
    user.resetTokenExpiry = null
    await user.save()

    res.status(200).json({ message: "Password has been reset. Please login with new password" })
  } catch (err) {
    res.status(500).json({ message: "Password reset failed" })
  }
}

module.exports = { signup, signin, myProfile, signout, forgotPass, resetPass }
