const User = require("../models/user");
const UserData = require("../models/userdata");
const Post = require("../models/post");
const Notification = require("../models/notification");
const AWS = require("aws-sdk");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

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

exports.getProfile = (req, res) => {
    const { _id } = req.user;
    UserData.findOne({ _id })
        .populate("user", "username name")
        .exec((err, data) => {
            if (err || !data) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            res.json(data);
        });
};

exports.getInitialProfile = (req, res) => {
    const { _id } = req.user;
    UserData.findOne({ _id })
        .populate("user", "name")
        .select("profile_image")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            res.json(data);
        });
};

exports.getPopularUser = (req, res) => {
    const { _id } = req.user;
    UserData.find({ $and: [{ role: { $ne: "admin" } }, { _id: { $ne: _id } }] })
        .populate("user", "username name")
        .sort({ follower: -1 })
        .limit(5)
        .exec((err, popularUser) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            res.json({
                popular: popularUser,
            });
        });
};

exports.editProfile = (req, res) => {
    const { private_, name, username, bio, profile_image, cover_image } = req.body;
    const { _id } = req.user;
    User.findOne({ username })
        .populate("user_data", "_id")
        .exec((err, data) => {
            if (data && data.user_data._id != _id) {
                return res.status(400).json({
                    error: "Duplicate username. Please change your username.",
                });
            }
            UserData.findOneAndUpdate({ _id }, { bio, private: private_ })
                .populate("user", "_id")
                .exec((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Something went wrong.",
                        });
                    }
                    if (profile_image) {
                        const base64Profile = new Buffer.from(
                            profile_image.replace(/^data:image\/\w+;base64,/, ""),
                            "base64"
                        );
                        const profileType = profile_image.split(";")[0].split("/")[1];
                        const deleteProfileParams = {
                            Bucket: "twizzer-imagestorage",
                            Key:
                                result.profile_image.key === ""
                                    ? "/profile-image/unknow.jpg"
                                    : result.profile_image.key,
                        };
                        s3.deleteObject(deleteProfileParams, (err, success) => {
                            if (err) {
                                return res.status(400).json({
                                    error: "Could not update profile image.",
                                });
                            }
                            const profileParams = {
                                Bucket: "twizzer-imagestorage",
                                Key: `profile-image/${uuidv4()}.${profileType}`,
                                Body: base64Profile,
                                ACL: "public-read",
                                ContentEncoding: "base64",
                                ContentType: "image/" + profileType,
                            };
                            s3.upload(profileParams, (err, data) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: "Could not update profile image.",
                                    });
                                }
                                const profileImageUrl = data.Location;
                                const profile_image = {
                                    url: profileImageUrl,
                                    key: data.Key,
                                };
                                if (cover_image) {
                                    const base64Cover = new Buffer.from(
                                        cover_image.replace(/^data:image\/\w+;base64,/, ""),
                                        "base64"
                                    );
                                    const coverType = cover_image.split(";")[0].split("/")[1];
                                    const deleteCoverParams = {
                                        Bucket: "twizzer-imagestorage",
                                        Key:
                                            result.cover_image.key === ""
                                                ? "/cover-image/unknow.jpg"
                                                : result.cover_image.key,
                                    };
                                    s3.deleteObject(deleteCoverParams, (err, success) => {
                                        if (err) {
                                            return res.status(400).json({
                                                error: "Could not update cover image.",
                                            });
                                        }
                                        const coverParams = {
                                            Bucket: "twizzer-imagestorage",
                                            Key: `cover-image/${uuidv4()}.${coverType}`,
                                            Body: base64Cover,
                                            ACL: "public-read",
                                            ContentEncoding: "base64",
                                            ContentType: "image/" + coverType,
                                        };
                                        s3.upload(coverParams, (err, data) => {
                                            if (err) {
                                                return res.status(400).json({
                                                    error: "Could not update cover image.",
                                                });
                                            }
                                            const cover_image = {
                                                url: data.Location,
                                                key: data.Key,
                                            };
                                            UserData.updateOne(
                                                { _id },
                                                { profile_image, cover_image }
                                            ).exec((err, updated) => {
                                                if (err) {
                                                    return res.status(400).json({
                                                        error: "Could not update cover image.",
                                                    });
                                                }
                                                User.updateOne(
                                                    { _id: result.user._id },
                                                    { name, username }
                                                ).exec((err, userUpdated) => {
                                                    if (err) {
                                                        return res.status(400).json({
                                                            error: "Could not update profile.",
                                                        });
                                                    }
                                                    return res.json({
                                                        message: "Profile is updated.",
                                                        profile_url: profileImageUrl,
                                                        cover_url: data.Location,
                                                    });
                                                });
                                            });
                                        });
                                    });
                                } else {
                                    UserData.updateOne({ _id }, { profile_image }).exec(
                                        (err, updated) => {
                                            if (err) {
                                                return res.status(400).json({
                                                    error: "Could not update cover image.",
                                                });
                                            }
                                            User.updateOne(
                                                { _id: result.user._id },
                                                { name, username }
                                            ).exec((err, userUpdated) => {
                                                if (err) {
                                                    return res.status(400).json({
                                                        error: "Could not update profile.",
                                                    });
                                                }
                                                return res.json({
                                                    message: "Profile is updated.",
                                                    profile_url: profileImageUrl,
                                                });
                                            });
                                        }
                                    );
                                }
                            });
                        });
                    } else {
                        if (cover_image) {
                            const base64Cover = new Buffer.from(
                                cover_image.replace(/^data:image\/\w+;base64,/, ""),
                                "base64"
                            );
                            const coverType = cover_image.split(";")[0].split("/")[1];
                            const deleteCoverParams = {
                                Bucket: "twizzer-imagestorage",
                                Key:
                                    result.cover_image.key === ""
                                        ? "/cover-image/unknow.jpg"
                                        : result.cover_image.key,
                            };
                            s3.deleteObject(deleteCoverParams, (err, success) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(400).json({
                                        error: "Could not update cover image.",
                                    });
                                }
                                const coverParams = {
                                    Bucket: "twizzer-imagestorage",
                                    Key: `cover-image/${uuidv4()}.${coverType}`,
                                    Body: base64Cover,
                                    ACL: "public-read",
                                    ContentEncoding: "base64",
                                    ContentType: "image/" + coverType,
                                };
                                s3.upload(coverParams, (err, data) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Could not update cover image.",
                                        });
                                    }
                                    const cover_image = {
                                        url: data.Location,
                                        key: data.Key,
                                    };
                                    UserData.updateOne({ _id }, { cover_image }).exec(
                                        (err, updated) => {
                                            if (err) {
                                                return res.status(400).json({
                                                    error: "Could not update cover image.",
                                                });
                                            }
                                            User.updateOne(
                                                { _id: result.user._id },
                                                { name, username }
                                            ).exec((err, userUpdated) => {
                                                if (err) {
                                                    return res.status(400).json({
                                                        error: "Could not update profile.",
                                                    });
                                                }
                                                return res.json({
                                                    message: "Profile is updated.",
                                                    cover_url: data.Location,
                                                });
                                            });
                                        }
                                    );
                                });
                            });
                        } else {
                            User.updateOne({ _id: result.user._id }, { username, name }).exec(
                                (err, resultUpdated) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Could not update profile.",
                                        });
                                    }
                                    res.json({
                                        message: "Profile is updated.",
                                    });
                                }
                            );
                        }
                    }
                });
        });
};

exports.changePassword = (req, res) => {
    const { _id } = req.user;
    const { password, confirm } = req.body;
    if (password !== confirm) {
        return res.status(400).json({
            error: "Password does not match.",
        });
    }
    UserData.findOne({ _id })
        .populate("user", "_id")
        .select("user")
        .exec((err, user) => {
            if (err) {
                return res.status(401).json({
                    error: "User not found.",
                });
            }
            if (user) {
                const salt = Math.round(new Date().valueOf() + Math.random()) + "";
                let hashedPassword;
                try {
                    hashedPassword = crypto.createHmac("sha1", salt).update(password).digest("hex");
                } catch (e) {
                    return res.status(400).json({
                        error: "Something went wrong.",
                    });
                }
                User.updateOne({ _id: user.user._id }, { password: hashedPassword, salt }).exec(
                    (err, result) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Something went wrong.",
                            });
                        }
                        res.json({
                            message: "Password is changed successfully.",
                        });
                    }
                );
            } else {
                return res.status(401).json({
                    error: "User not found.",
                });
            }
        });
};

exports.getUserAutocomplete = (req, res) => {
    const keyword = req.body.keyword;
    const { _id } = req.user;
    User.find({
        $or: [
            { name: new RegExp("^" + keyword, "i") },
            { username: new RegExp("^" + keyword, "i") },
        ],
        role: "user",
    })
        .select("name username")
        .populate("user_data", "_id")
        .limit(5)
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            const filteredUsers = users.filter((user) => user.user_data._id.toString() != _id);
            res.json({
                users: filteredUsers,
            });
        });
};

exports.getUserSearching = (req, res) => {
    const keyword = req.body.keyword;
    const { _id } = req.user;
    User.find({
        $or: [
            { name: new RegExp("^" + keyword, "i") },
            { username: new RegExp("^" + keyword, "i") },
        ],
        role: "user",
    })
        .populate("user_data", "_id profile_image private")
        .select("name username")
        .limit(10)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({ error: "Could not search user." });
            }
            const filteredUsers = data.filter((user) => user.user_data._id.toString() != _id);
            res.json({
                data: filteredUsers,
            });
        });
};

exports.getUserProfile = (req, res) => {
    const { _id } = req.user;
    const { userUsername, limit, skip } = req.body;
    User.findOne({ username: userUsername })
        .populate("user_data", "private follower")
        .select("_id user_data")
        .exec((err, dataForChecking) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (!dataForChecking) {
                return res.status(400).json({
                    error: "Could not find this user.",
                });
            }
            if (
                dataForChecking.user_data.follower.includes(_id) ||
                !dataForChecking.user_data.private
            ) {
                UserData.findOne({ _id: dataForChecking.user_data._id })
                    .populate("user", "name username")
                    .exec((err, userData) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Something went wrong.",
                            });
                        }
                        Post.find({
                            $or: [
                                { postedBy: dataForChecking.user_data._id, type: "post" },
                                { retweetedBy: dataForChecking.user_data._id, type: "retweet" },
                            ],
                        })
                            .populate({
                                path: "postedBy",
                                select: "user profile_image",
                                populate: { path: "user", select: "username name" },
                            })
                            .populate("tag", "tag_name")
                            .populate({
                                path: "retweetedBy",
                                select: "user",
                                populate: { path: "user", select: "username name" },
                            })
                            .populate("origin_post", "_id content images")
                            .skip(skip)
                            .limit(limit)
                            .sort({ createdAt: -1 })
                            .exec((err, posts) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: "Could not find posts.",
                                    });
                                }
                                res.status(200).json({
                                    user: userData,
                                    posts,
                                });
                            });
                    });
            } else {
                UserData.findOne({ _id: dataForChecking.user_data._id })
                    .populate("user", "name username")
                    .exec((err, userData) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Something went wrong.",
                            });
                        }
                        res.json({
                            user: userData,
                        });
                    });
            }
        });
};

exports.getFollowingUser = (req, res) => {
    const { _id } = req.user;
    UserData.findOne({ _id })
        .select("following")
        .exec((err, followings) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong. Please try again.",
                });
            }
            res.json({
                following: followings.following,
            });
        });
};

exports.requestToFollow = (req, res) => {
    const { _id } = req.user;
    const { userId } = req.body;
    UserData.findOne({ _id: userId, follower: { $in: _id } })
        .select("_id")
        .exec((err, result) => {
            if (result) {
                console.log(result);
                return res.status(400).json({
                    error: "You has already followed.",
                });
            }
            UserData.findOne({ _id: userId })
                .select("private")
                .exec((err, checkPrivate) => {
                    if (checkPrivate.private) {
                        Notification.findOne({ to_user: userId, from_user: _id, type: "request" })
                            .select("_id")
                            .exec((err, data) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: "Could not follow this user.",
                                    });
                                }
                                if (data) {
                                    return res.json({
                                        message: "Request has been sent.",
                                    });
                                }
                                const newAlert = new Notification({
                                    from_user: _id,
                                    to_user: userId,
                                    type: "request",
                                });
                                newAlert.save((err, result) => {
                                    res.json({
                                        message: "Request is sent.",
                                    });
                                });
                            });
                    } else {
                        const newAlert = new Notification({
                            to_user: userId,
                            from_user: _id,
                            type: "follow",
                        });
                        newAlert.save((err, resultFromNotification) => {
                            if (err) {
                                return res.status(400).json({
                                    error: "Could not follow this user.",
                                });
                            }
                            UserData.updateOne({ _id }, { $push: { following: userId } }).exec(
                                (err, resultFromFollowing) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Could not follow this user.",
                                        });
                                    }
                                    UserData.updateOne(
                                        { _id: userId },
                                        { $push: { follower: _id } }
                                    ).exec((err, resultFromFollower) => {
                                        if (err) {
                                            return res.status(400).json({
                                                error: "Could not follow this user.",
                                            });
                                        }
                                        res.json({
                                            message: "Followed",
                                        });
                                    });
                                }
                            );
                        });
                    }
                });
        });
};

exports.unFollow = (req, res) => {
    const { _id } = req.user;
    const { userId } = req.body;
    UserData.updateOne({ _id }, { $pull: { following: userId } }).exec((err, result1) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                error: "Could not un follow this user.",
            });
        }
        UserData.updateOne({ _id: userId }, { $pull: { follower: _id } }).exec((err, result1) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not un follow this user.",
                });
            }
            res.json({
                message: "Un followed.",
            });
        });
    });
};

exports.fetchFollowing = (req, res) => {
    const { _id } = req.user;
    const { arrayOfFollowing, userId } = req.body;
    UserData.findOne({ _id: userId })
        .select("_id following private")
        .exec((err, data) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (!data.private || data) {
                UserData.find({ _id: { $in: arrayOfFollowing } })
                    .populate("user", "name username")
                    .select("profile_image")
                    .exec((err, users) => {
                        if (err) {
                            return res.status(200).json({
                                error: "Something went wrong.",
                            });
                        }
                        res.json(users);
                    });
            } else {
                res.status(400).json({
                    error: "Let's follow this account to see following.",
                });
            }
        });
};

exports.fetchFollower = (req, res) => {
    const { arrayOfFollower, userId } = req.body;
    UserData.findOne({ _id: userId })
        .select("_id follower private")
        .exec((err, data) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (!data.private || data) {
                UserData.find({ _id: { $in: arrayOfFollower } })
                    .populate("user", "name username")
                    .select("profile_image")
                    .exec((err, users) => {
                        if (err) {
                            return res.status(200).json({
                                error: "Something went wrong.",
                            });
                        }
                        res.json(users);
                    });
            } else {
                res.status(400).json({
                    error: "Let's follow this account to see following.",
                });
            }
        });
};

exports.acceptRequest = (req, res) => {
    const { _id } = req.user;
    const { requestFrom, notificationId } = req.body;
    UserData.findOne({ _id: requestFrom })
        .select("_id")
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (result) {
                UserData.updateOne({ _id }, { $push: { follower: requestFrom } }).exec(
                    (err, data) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Could not accept this request",
                            });
                        }
                        UserData.updateOne(
                            { _id: requestFrom },
                            { $push: { following: _id } }
                        ).exec((err, data) => {
                            if (err) {
                                return res.status(400).json({
                                    error: "Could not accept this request",
                                });
                            }
                            Notification.deleteOne({ _id: notificationId }).exec((err, data) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: "Could not delete this notification.",
                                    });
                                }
                                const newAlert = new Notification({
                                    from_user: _id,
                                    to_user: requestFrom,
                                    type: "accept",
                                });
                                newAlert.save((err, result) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Something went wrong.",
                                        });
                                    }
                                    const alertForAccepter = new Notification({
                                        to_user: _id,
                                        from_user: requestFrom,
                                        type: "follow",
                                    });
                                    alertForAccepter.save((err, result) => {
                                        if (err) {
                                            return res.status(400).json({
                                                error: "Something went wrong.",
                                            });
                                        }
                                        res.json({
                                            message: "Accepted.",
                                        });
                                    });
                                });
                            });
                        });
                    }
                );
            } else {
                res.status(400).json({
                    error: "Could not find the user.",
                });
            }
        });
};

exports.declineRequest = (req, res) => {
    const { notificationId } = req.body;
    Notification.deleteOne({ _id: notificationId }).exec((err, result) => {
        if (err) {
            return res.status(400).json({
                error: "Could not decline this request.",
            });
        }
        res.json({
            message: "Declined",
        });
    });
};

exports.removeFollower = (req, res) => {
    const { _id } = req.user;
    const { userId } = req.body;
    UserData.updateOne({ _id }, { $pull: { follower: userId } }).exec((err, result) => {
        if (err) {
            return res.status(400).json({
                error: "Could not remove this user.",
            });
        }
        UserData.updateOne({ _id: userId }, { $pull: { following: _id } }).exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not remove this user.",
                });
            }
            Notification.deleteOne({ from_user: _id, to_user: userId, type: "accept" }).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Something went wrong.",
                        });
                    }
                    res.json({
                        message: "Removed.",
                    });
                }
            );
        });
    });
};
