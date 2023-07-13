const express = require("express");
const {
  getPost,
  deletePost,
  getEditPost,
  editPost,
  getPosts,
  getAddPost,
  addPost,
} = require("../controllers/post-controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/posts/:id", authMiddleware, getPost);
router.delete("/posts/:id", authMiddleware, deletePost);
router.get("/edit/:id", authMiddleware, getEditPost);
router.put("/edit/:id", authMiddleware, editPost);
router.get("/posts", authMiddleware, getPosts);
router.get("/add-post", authMiddleware, getAddPost);
router.post("/add-post", authMiddleware, addPost);

module.exports = router;
