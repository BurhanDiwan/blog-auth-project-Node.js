const express = require("express")
const router = express.Router()
const { signup, signin, myProfile, signout, forgotPass, resetPass } = require("../controllers/userController")
const authCheck = require("../middlewares/authCheck")

router.post("/register", signup)
router.post("/login", signin)
router.get("/profile", authCheck, myProfile)
router.post("/logout", authCheck, signout)
router.post("/forgot-password", forgotPass)
router.post("/reset-password/:token", resetPass)

module.exports = router
