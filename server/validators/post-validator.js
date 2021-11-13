const { check } = require("express-validator");

exports.createPostValidator = [
    check("content")
        .not()
        .isEmpty()
        .withMessage("Content is required.")
        .isLength({ max: 256 })
        .withMessage("Content must be less than 256 characters"),
];
