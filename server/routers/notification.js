const express = require("express");
const router = express.Router();
const { checkIsUser, requireSignIn } = require("../controllers/auth");
const { getNotifications, getRequests } = require("../controllers/notification");

router.post("/notifications", requireSignIn, checkIsUser, getNotifications);

router.get("/notification/requests", requireSignIn, checkIsUser, getRequests);

module.exports = router;
