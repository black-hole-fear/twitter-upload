const {validationResult} = require("express-validator");

exports.runValidation = (req, res, next) => {
    const error = validationResult(req);
    if(!error.isEmpty()) {
        console.log(error);
        return res.status(400).json({
            error: error.array()[0].msg
        })
    }
    next();
}