const express = require("express");
const router = express.Router();
const { checkIsUser, requireSignIn } = require("../controllers/auth");
const { comment, getComments, deleteComment } = require("../controllers/comment");
const { commentValidator } = require("../validators/comment-validator");
const { runValidation } = require("../validators/");

router.post("/comment", requireSignIn, checkIsUser, commentValidator, runValidation, comment);

router.post("/comment/get-comments", requireSignIn, checkIsUser, getComments);

router.post("/comment/delete", requireSignIn, checkIsUser, deleteComment);

module.exports = router;
