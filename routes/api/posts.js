const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const User = require("../../models/user");
const Profile = require("../../models/profile");
const Post = require("../../models/post");

// Post api/post
// create a post
// priv ate
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("server error");
    }
  }
);

// GET api/posts
// get all posts
// private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

// GET api/posts/:id
// get post by id
// private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "post not found" });
    }
    res.status(500).send("server error");
  }
});

// DELETE api/posts/:id
// delete a post posts
// private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }
    // check user
    if (post.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "user not authorised" });
    }
    await post.remove();
    res.json({ msg: "post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "post not found" });
    }
    res.status(500).send("server error");
  }
});

// PUT api/posts/like/:id
// like a post
// private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    let c = 0;
    if (
      post.likes.filter((like) => {
        return like.user.toString() === req.user.id;
      }).length > 0
    ) {
      return res.status(404).json({ msg: "post already liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});
// PUT api/posts/unlike/:id
// like a post
// private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    let c = 0;
    if (
      post.likes.filter((like) => {
        return like.user.toString() === req.user.id;
      }).length === 0
    ) {
      return res.status(404).json({ msg: "post has not yet been liked" });
    }
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    if (removeIndex >= 0) {
      post.likes.splice(removeIndex, 1);
    } else {
      return res.status(404).json({ msg: "can't remove like" });
    }
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

// Post api/post/comment/:id
// comment on a post
// private
router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("server error");
    }
  }
);

// Post api/post/comment/:id/:comment_id
// delete comment on a post
// private

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // make sure comment exist
    if (!comment) {
      return res.status(404).json({ msg: "comment does not exist" });
    }
    // check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authorized" });
    }
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    if (removeIndex >= 0) {
      post.comments.splice(removeIndex, 1);
    } else {
      return res.status(404).json({ msg: "can't remove like" });
    }
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("server error");
  }
});

module.exports = router;
