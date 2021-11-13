const { check } = require("express-validator");

exports.loginValidator = [
    check("email").isEmail().withMessage("Email is invalid."),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
]

exports.registerValidator = [
    check("email").isEmail().withMessage("Email is invalid."),
    check("name").not().isEmpty().withMessage("Name is required.").isLength({max: 18}).withMessage("Name must be at least 18 characters"),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters.")
]

exports.emailValidator = [
    check("email").isEmail().withMessage("Email is invalid")
]

exports.passwordValidator = [
    check("password").not().isEmpty().withMessage("Password is required.").isLength({min: 6}).withMessage("Password must be at least 6 characters."),
]