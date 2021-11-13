const express = require("express");
const router = express.Router();
const {
    loginValidator,
    registerValidator,
    emailValidator,
    passwordValidator,
} = require("../validators/auth-validator");
const { runValidation } = require("../validators/index");
const {
    login,
    register,
    activate,
    checkUser,
    checkAdmin,
    requireSignIn,
    sendEmail,
    newPassword
} = require("../controllers/auth");

router.post("/login", loginValidator, runValidation, login);

router.post("/register", registerValidator, runValidation, register);

router.post("/activate-account", activate);

router.get("/check-user", requireSignIn, checkUser);

router.get("/check-admin", requireSignIn, checkAdmin);

router.post("/forget-password/send-email", emailValidator, runValidation, sendEmail);

router.post("/forget-password/new-password", passwordValidator, runValidation, newPassword);

module.exports = router;
