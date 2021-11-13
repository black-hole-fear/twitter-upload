const express = require("express");
const router = express.Router();
const { checkIsAdmin, requireSignIn } = require("../controllers/auth");
const {
    adminGetAllPosts,
    adminGetUsers,
    adminDeleteUser,
    adminGetPost,
    adminDeletePost,
    adminGetComments,
    adminDeleteComment,
    adminGetProfile,
    adminGetUserPosts
} = require("../controllers/admin");

router.post("/admin/get-posts", requireSignIn, checkIsAdmin, adminGetAllPosts);

router.post("/admin/get-post", requireSignIn, checkIsAdmin, adminGetPost);

router.post("/admin/get-comments", requireSignIn, checkIsAdmin, adminGetComments);

router.delete(
    "/admin/delete-comment/:id/:post_id/:commented_id",
    requireSignIn,
    checkIsAdmin,
    adminDeleteComment
);

router.delete("/admin/delete-post/:id", requireSignIn, checkIsAdmin, adminDeletePost);

router.post("/admin/get-users", requireSignIn, checkIsAdmin, adminGetUsers);

router.delete("/admin/delete-user/:id", requireSignIn, checkIsAdmin, adminDeleteUser);

router.get("/admin/get-profile/:username", requireSignIn, checkIsAdmin, adminGetProfile);

router.post("/admin/get-user-posts", requireSignIn, checkIsAdmin, adminGetUserPosts)

module.exports = router;
