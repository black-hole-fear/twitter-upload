const express = require('express');
const router = express.Router();
const { checkIsUser } = require("../controllers/auth");
const { requireSignIn } = require("../controllers/auth");
const { createTagValidator } = require("../validators/tag-validator");
const { runValidation } = require("../validators/index");
const { createTag, getPopularTag, getTags, getPostsOfTag } = require("../controllers/tag");

router.post("/tag/create", requireSignIn, checkIsUser, createTagValidator, runValidation, createTag);

router.get("/tag/get-popular-tag", requireSignIn, checkIsUser, getPopularTag);

router.get("/tag/get-tags", requireSignIn, checkIsUser, getTags);

router.post("/tag/get-posts", requireSignIn, checkIsUser, getPostsOfTag);

module.exports = router