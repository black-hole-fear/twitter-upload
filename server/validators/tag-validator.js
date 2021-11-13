const { check } = require("express-validator");

exports.createTagValidator = [
    check("tag")
        .not()
        .isEmpty()
        .withMessage("Tag name is required.")
        .isLength({ max: 32 })
        .withMessage("Tag name must be at least 32 characters."),
];
