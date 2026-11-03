const Post = require("../models/postModel")

const addPost = async (req, res) => {
  try {
    const { title, content } = req.body

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are both required" })
    }

    const post = new Post({
      title: title,
      content: content,
      author: req.user._id
    })
    await post.save()

    return res.status(201).json({ message: "Blog created successfully", blog: post })
  } catch (err) {
    return res.status(500).json({ message: "Could not create blog" })
  }
}

const fetchAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).populate("author", "name email")

    res.status(200).json({ count: posts.length, blogs: posts })
  } catch (err) {
    res.status(500).json({ message: "Error fetching blogs" })
  }
}

const fetchSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email")

    if (post === null) {
      return res.status(404).json({ message: "Blog not found" })
    }

    res.status(200).json({ blog: post })
  } catch (err) {
    res.status(500).json({ message: "Error fetching blog" })
  }
}

const editPost = async (req, res) => {
  const { title, content } = req.body
  const postId = req.params.id

  if (title === undefined && content === undefined) {
    return res.status(400).json({ message: "Nothing to update, send title or content" })
  }

  if ((title !== undefined && title.trim() === "") || (content !== undefined && content.trim() === "")) {
    return res.status(400).json({ message: "Title or content cannot be blank" })
  }

  try {
    const post = await Post.findById(postId)

    if (!post) {
      return res.status(404).json({ message: "Blog not found" })
    }

    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own blogs" })
    }

    if (title !== undefined) post.title = title
    if (content !== undefined) post.content = content

    const updatedPost = await post.save()

    res.status(200).json({ message: "Blog updated successfully", blog: updatedPost })
  } catch (err) {
    res.status(500).json({ message: "Failed to update blog" })
  }
}

const removePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: "Blog not found" })
    }

    if (String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own blogs" })
    }

    await Post.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: "Blog deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: "Failed to delete blog" })
  }
}

module.exports = {
  addPost,
  fetchAllPosts,
  fetchSinglePost,
  editPost,
  removePost
}
