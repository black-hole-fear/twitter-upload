const express = require("express");
const router = express.Router();
const { checkIsUser, requireSignIn } = require("../controllers/auth");
const { like, unlike, retweet, cancelRetweet} = require("../controllers/like")

router.post("/like", requireSignIn, checkIsUser, like);

router.post("/like/unlike", requireSignIn, checkIsUser, unlike);

module.exports = router;