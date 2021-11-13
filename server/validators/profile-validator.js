const { check } = require("express-validator");

exports.editProfileValidator = [
    check("name")
        .not()
        .isEmpty()
        .withMessage("Name is require.")
        .isLength({ max: 32 })
        .withMessage("Name must be less than 32 characters."),
    check("username")
        .not()
        .isEmpty()
        .withMessage("Username is require.")
        .isLength({ max: 16 })
        .withMessage("Username must be less than 16 characters."),
    check("bio")
        .isLength({ max: 128 })
        .withMessage("Bio must be less than 128 characters."),
];
