const express = require("express");
const router = express.Router();
const { checkIsUser, requireSignIn } = require("../controllers/auth");
const {
    getPosts,
    getPost,
    createPost,
    getYourPost,
    getUserPost,
    deletePost
} = require("../controllers/post");
const { createPostValidator } = require("../validators/post-validator");
const { runValidation } = require("../validators/index");

router.post("/posts", requireSignIn, checkIsUser, getPosts);

router.post(
    "/post/create",
    requireSignIn,
    checkIsUser,
    createPostValidator,
    runValidation,
    createPost
);

router.post("/post/get-posts", requireSignIn, checkIsUser, getYourPost);

router.post("/post/get-post", requireSignIn, checkIsUser, getPost);

router.post("/post/get-user-posts", requireSignIn, checkIsUser, getUserPost);

router.delete("/post/delete-post/:post", requireSignIn, checkIsUser, deletePost);


module.exports = router;
