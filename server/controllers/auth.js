const User = require("../models/user");
const UserData = require("../models/userdata");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const shortId = require("shortid");
const expressJwt = require("express-jwt");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const ses = new AWS.SES({
    apiVersion: "2010-12-01",
});

exports.login = (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email })
        .select("email password name username salt role")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Login failed.",
                });
            }
            if (!data) {
                return res.status(400).json({
                    error: "Email not found.",
                });
            }
            let clientHashedPassword;
            try {
                clientHashedPassword = crypto
                    .createHmac("sha1", data.salt)
                    .update(password)
                    .digest("hex");
            } catch (e) {
                clientHashedPassword = "";
            }
            if (clientHashedPassword !== data.password) {
                return res.status(400).json({
                    error: "Password is incorrect.",
                });
            }
            UserData.findOne({ user: data._id })
                .select("_id following")
                .exec((err, dataFromUserData) => {
                    if (err) {
                        return res.status(400).json({ error: "Login failed" });
                    }
                    const token = jwt.sign(
                        { _id: dataFromUserData._id },
                        process.env.JWT_SECRET_KEY,
                        {
                            expiresIn: "1d",
                        }
                    );
                    res.status(200).json({
                        message: "Logged in",
                        token,
                        userData: {
                            role: data.role,
                        },
                    });
                });
        });
};

exports.register = (req, res) => {
    const { email, name, password, confirm } = req.body;
    if (password !== confirm) {
        return res.status(400).json({
            error: "Password does not match.",
        });
    }
    User.findOne({ email })
        .select("email")
        .exec((err, result) => {
            if (err || result) {
                return res.status(400).json({
                    error: "Email has already existed.",
                });
            }
            const token = jwt.sign({ email, name, password }, process.env.JWT_ACCOUNT_ACTIVATION, {
                expiresIn: "5m",
            });
            const params = {
                Source: process.env.TWIZZER_EMAIL,
                Destination: {
                    ToAddresses: [email],
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: "UTF-8",
                            Data: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600;color:#FFC107;">Twizzer</a></div><p style="font-size:1.1em">Hi,</p><p>Use the following URL to complete your Sign Up procedures. This URL is valid for 5 minutes</p></br><p>${
                                process.env.CLIENT_URL + "/activate-account/" + token
                            }</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>Twizzer</p><p>, Thailand</p></div></div></div>`,
                        },
                    },
                    Subject: {
                        Charset: "UTF-8",
                        Data: "Complete your registration.",
                    },
                },
            };
            const sendEmail = ses.sendEmail(params).promise();
            sendEmail
                .then((response) => {
                    res.json({
                        message: `Email has been sent to ${email}. Please click on the link that we sent to activation your account.`,
                    });
                })
                .catch((e) => {
                    console.log(e);
                    res.status(400).json({
                        error: "We could not verify your email. Please try again.",
                    });
                });
        });
};

exports.activate = (req, res) => {
    const token = req.body.token;
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                error: "Expired link or link is invalid. Please try again.",
            });
        }
        const { email, name, password } = decoded;
        User.findOne({ email })
            .select("_id")
            .exec((err, data) => {
                if (data || err) {
                    return res.status(400).json({
                        error: "User has already existed.",
                    });
                }
                const username = shortId.generate();
                const salt = Math.round(new Date().valueOf() + Math.random()) + "";
                let hashedPassword;
                try {
                    hashedPassword = crypto.createHmac("sha1", salt).update(password).digest("hex");
                } catch (e) {
                    return res.status(400).json({
                        error: "Something went wrong.",
                    });
                }
                const userData = {
                    email,
                    username,
                    name,
                    password: hashedPassword,
                    salt,
                };
                const newUser = new User(userData);
                newUser.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Something went wrong.",
                        });
                    }
                    const newUserData = new UserData({
                        user: result._id,
                        follower: [],
                        following: [],
                        bio: "",
                        private: true,
                        profile_image: { key: "", url: "" },
                        cover_image: { key: "", url: "" },
                    });
                    newUserData.save((err, resultFromUserData) => {
                        if (err) {
                            return res.status(400).json({ error: "Something went wrong" });
                        }
                        User.updateOne(
                            { _id: result._id },
                            { user_data: resultFromUserData._id }
                        ).exec((err, resultFromUser) => {
                            if (err) {
                                return res.status(400).json({
                                    error: "Something went wrong.",
                                });
                            }
                            res.status(200).json({
                                message: "Activated. Let's login",
                            });
                        });
                    });
                });
            });
    });
};

exports.sendEmail = (req, res) => {
    const {email} = req.body;
    User.findOne({email}).select("email").exec((err, user) => {
        if(err) {
            return res.status(400).json({
                error: "Something went wrong. Please try again later."
            })
        }
        if(user) {
            const charactersGenerate = shortId.generate();
            const token = jwt.sign({email, shortId: charactersGenerate}, process.env.JWT_FORGET_PASSWORD, {
                expiresIn: "5m"
            })
            const params = {
                Source: process.env.TWIZZER_EMAIL,
                Destination: {
                    ToAddresses: [email],
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: "UTF-8",
                            Data: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600;color:#FFC107;">Twizzer</a></div><p style="font-size:1.1em">Hi,</p><p>Use the following URL to complete your Forget password procedures. This URL is valid for 5 minutes</p></br><p>${
                                process.env.CLIENT_URL + "/forget-password/" + token
                            }</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300"><p>Twizzer</p><p>, Thailand</p></div></div></div>`,
                        },
                    },
                    Subject: {
                        Charset: "UTF-8",
                        Data: "Complete your registration.",
                    },
                },
            };
            const sendEmail = ses.sendEmail(params).promise();
            sendEmail
                .then((response) => {
                    User.updateOne({email}, {newPasswordToken: token}).exec((err, data) => {
                        if(err) {
                            return res.status(400).json({
                                error: "Something went wrong."
                            })
                        }
                        res.json({
                            message: `Email has been sent to ${email}.`,
                        });
                    })
                })
                .catch((e) => {
                    console.log(e);
                    res.status(400).json({
                        error: "We could not verify your email. Please try again.",
                    });
                });
        }else {
            res.status(401).json({
                error: `We could not found ${email}`
            })
        }
    })
}

exports.newPassword = (req, res) => {
    const {password, confirm, token} = req.body;
    if(password !== confirm) {
        return res.status(400).json({
            error: "Password does not match."
        })
    }
    const {email} = jwt.decode(token);
    jwt.verify(token, process.env.JWT_FORGET_PASSWORD, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                error: "Expired link or link is invalid. Please try again.",
            });
        }
        User.findOne({email, forgetPasswordToken: token}).select("_id").exec((err, result) => {
            if(err) {
                return res.status(400).json({
                    error: "Something went wrong."
                })
            }
            if(result) {
                const salt = Math.round(new Date().valueOf() + Math.random()) + "";
                let hashedPassword;
                try {
                    hashedPassword = crypto.createHmac("sha1", salt).update(password).digest("hex");
                } catch (e) {
                    return res.status(400).json({
                        error: "Something went wrong.",
                    });
                }
                User.updateOne({_id: result._id}, {password: hashedPassword, salt, forgetPasswordToken: ""}).exec((err, result) => {
                    if(err) {
                        return res.status(400).json({
                            error: "Something went wrong.",
                        });
                    }
                    res.json({
                        message: "Change password successfully. Let's login."
                    })
                })
            }else {
                res.status(400).json({
                    error: "Token or email is invalid.",
                })
            }
        })
    })
}

exports.requireSignIn = expressJwt({
    secret: process.env.JWT_SECRET_KEY,
    algorithms: ["sha1", "RS256", "HS256"],
}); //return req.user

exports.checkIsAdmin = (req, res, next) => {
    const { _id } = req.user;
    UserData.findOne({ _id })
        .select("user")
        .populate("user", "role")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (!data) {
                return res.status(401).json({
                    error: "You are not user in Twizzer. Please register.",
                });
            }
            if (data.user.role === "admin") {
                next();
            } else {
                res.status(401).json({
                    error: "You are not allowed to get all posts.",
                });
            }
        });
};

exports.checkIsUser = (req, res, next) => {
    const { _id } = req.user;
    UserData.findOne({ _id })
        .select("_id user")
        .populate("user", "role")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (!data) {
                return res.status(401).json({
                    error: "You are not user in Twizzer. Please register.",
                });
            }
            if (data.user.role === "user" || data.user.role === "admin") {
                next();
            } else {
                res.status(401).json({
                    error: "You are not user in Twizzer. Please register.",
                });
            }
        });
};

exports.checkUser = (req, res) => {
    const { _id } = req.user;
    UserData.findOne({ _id })
        .select("_id")
        .exec((err, user) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if(!user) {
                return res.status(401).json({
                    error: "User does not exist."
                })
            }
            res.json({
                message: "You can access this page.",
            });
        });
};

exports.checkAdmin = (req, res) => {
    const { _id } = req.user;
    UserData.findOne({ _id })
        .select("user")
        .populate("user", "role")
        .exec((err, data) => {
            if (err) {
                return res.status(401).json({
                    error: "Something went wrong.",
                });
            }
            if (data.user.role === "admin") {
                res.json({
                    message: "You can access this page.",
                });
            } else {
                res.status(401).json({
                    error: "You are not allowed to access this page.",
                });
            }
        });
};

