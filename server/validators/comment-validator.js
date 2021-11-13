const { check } = require("express-validator");

exports.commentValidator = [
    check("comment").not().isEmpty().withMessage("Comment is required.").isLength({max: 256}).withMessage("Comment must be less than 256 characters.")
]