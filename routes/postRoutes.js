const express = require("express")
const router = express.Router()
const authCheck = require("../middlewares/authCheck")
const { addPost, fetchAllPosts, fetchSinglePost, editPost, removePost } = require("../controllers/postController")

router.get("/", fetchAllPosts)
router.get("/:id", fetchSinglePost)
router.post("/", authCheck, addPost)
router.put("/:id", authCheck, editPost)
router.delete("/:id", authCheck, removePost)

module.exports = router
