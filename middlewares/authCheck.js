const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

const authCheck = async (req, res, next) => {
  let token
  let authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Not authorized, please login" })
  }

  token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const foundUser = await User.findById(decoded.userId)

    if (!foundUser) {
      return res.status(401).json({ message: "User no longer exists" })
    }

    req.user = foundUser
    next()
  } catch (err) {
    return res.status(401).json({ message: "Token is invalid or expired" })
  }
}

module.exports = authCheck
