const express = require("express");
const router = express.Router();
const { checkIsUser, requireSignIn } = require("../controllers/auth");
const { retweet, cancelRetweet} = require("../controllers/retweet");

router.post("/retweet", requireSignIn, checkIsUser, retweet);

router.post("/retweet/cancel-retweet", requireSignIn, checkIsUser, cancelRetweet);

module.exports = router;