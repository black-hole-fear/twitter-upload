const User = require("../models/user");
const UserData = require("../models/userdata");
const Comment = require("../models/comment");
const Tag = require("../models/tag");
const Notification = require("../models/notification");
const Post = require("../models/post");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

exports.adminGetAllPosts = (req, res) => {
    const { limit, skip } = req.body;
    Post.find({ type: { $ne: "retweet" } })
        .populate({
            path: "postedBy",
            select: "user profile_image",
            populate: { path: "user", select: "name username" },
        })
        .populate("tag", "tag_name")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .exec((err, posts) => {
            if (err) {
                console.log(err);
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            res.status(200).json(posts);
        });
};

exports.adminGetProfile = (req, res) => {
    const { username } = req.params;
    User.findOne({ username })
        .populate("user_data", "profile_image cover_image following follower bio")
        .select("name username")
        .exec((err, user) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (user) {
                res.json(user);
            } else {
                res.status(400).json({
                    error: "User not found.",
                });
            }
        });
};

exports.adminGetPost = (req, res) => {
    const postId = req.body.id;
    Post.findOne({ _id: postId })
        .populate({
            path: "postedBy",
            select: "user profile_image",
            populate: { path: "user", select: "name username" },
        })
        .populate("tag", "tag_name")
        .exec((err, post) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (!post) {
                return res.status(400).json({
                    error: "Could not fine post.",
                });
            }
            res.json(post);
        });
};

exports.adminGetUserPosts = (req, res) => {
    const { limit, skip, userId } = req.body;
    UserData.findOne({ _id: userId })
        .select("_id")
        .exec((err, user) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (!user) {
                return res.status(400).json({
                    error: "Could not fine user.",
                });
            }
            Post.find({ postedBy: userId, type: "post" })
                .populate({
                    path: "postedBy",
                    select: "user profile_image",
                    populate: { path: "user", select: "name username" },
                })
                .populate("tag", "tag_name")
                .limit(limit)
                .skip(skip)
                .sort({ createdAt: -1 })
                .exec((err, posts) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Something went wrong.",
                        });
                    }
                    res.json(posts);
                });
        });
};

const deletePostImages = (images) => {
    for (i of images) {
        const deleteProfileParams = {
            Bucket: "twizzer-imagestorage",
            Key: i.key,
        };
        s3.deleteObject(deleteProfileParams, (err, success) => {
            if (err) {
                console.log(err);
            }
        });
    }
};

const deleteCommentImages = (comments) => {
    for (let c of comments) {
        if (c.image.key) {
            const deleteProfileParams = {
                Bucket: "twizzer-imagestorage",
                Key: c.image.key,
            };
            s3.deleteObject(deleteProfileParams, (err, success) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
};

exports.adminDeletePost = (req, res) => {
    const postId = req.params.id;
    Post.findOne({ _id: postId })
        .select("postedBy images tag")
        .exec((err, post) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            Post.deleteOne({ _id: postId }).exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: "Something went wrong.",
                    });
                }
                deletePostImages(post.images);
                Notification.deleteMany({ origin_post: postId }).exec((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Something went wrong.",
                        });
                    }
                    Comment.find({ post: postId })
                        .select("image")
                        .exec((err, comments) => {
                            if (err) {
                                return res.status(400).json({
                                    error: "Something went wrong.",
                                });
                            }
                            deleteCommentImages(comments);
                            Comment.deleteMany({ post: postId }).exec((err, result) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: "Something went wrong.",
                                    });
                                }
                                Post.deleteMany({ origin_post: postId, type: "retweet" }).exec(
                                    (err, result) => {
                                        if (err) {
                                            return res.status(400).json({
                                                error: "Something went wrong.",
                                            });
                                        }
                                        if (post.tag == "4edd40c86762e0fb12000003") {
                                            res.json({
                                                message: "Deleted",
                                            });
                                        } else {
                                            Tag.updateOne(
                                                { _id: post.tag },
                                                { $inc: { number: -1 } }
                                            ).exec((err, result) => {
                                                if (err) {
                                                    return res.status(400).json({
                                                        error: "Something went wrong.",
                                                    });
                                                }
                                                res.json({
                                                    message: "Deleted",
                                                });
                                            });
                                        }
                                    }
                                );
                            });
                        });
                });
            });
        });
};

exports.adminGetComments = (req, res) => {
    const { limit, skip, postId } = req.body;
    Comment.find({ post: postId })
        .populate({
            path: "commentedBy",
            select: "user profile_image",
            populate: { path: "user", select: "name username" },
        })
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .exec((err, comments) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not find comments.",
                });
            }
            res.json(comments);
        });
};

const deleteCommentImage = (image) => {
    const deleteParams = {
        Bucket: "twizzer-imagestorage",
        Key: image.key,
    };
    s3.deleteObject(deleteParams, (err, success) => {
        if (err) {
            console.log(err);
        }
    });
};

exports.adminDeleteComment = (req, res) => {
    const { id, post_id, commented_id } = req.params;
    Comment.findOne({ _id: id })
        .select("image")
        .exec((err, comment) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (comment.image.key) {
                deleteCommentImage(comment.image);
            }
            Comment.deleteOne({ _id: id }).exec((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: "Something went wrong.",
                    });
                }
                Post.updateOne({ _id: post_id }, { $inc: { comment_number: -1 } }).exec(
                    (err, result) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Something went wrong.",
                            });
                        }
                        Notification.deleteOne({
                            comment_id: id,
                            from_user: commented_id,
                            type: "comment",
                        }).exec((err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    error: "Something went wrong.",
                                });
                            }
                            res.json({
                                message: "Deleted",
                            });
                        });
                    }
                );
            });
        });
};

exports.adminGetUsers = (req, res) => {
    const { limit, skip } = req.body;
    User.find({ role: { $ne: "admin" } })
        .populate("user_data", "profile_image")
        .select("name username")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            res.json(users);
        });
};

const deleteUserImage = (profile_image, cover_image) => {
    if (profile_image.key !== "") {
        const deleteProfileParams = {
            Bucket: "twizzer-imagestorage",
            Key: profile_image.key,
        };
        s3.deleteObject(deleteProfileParams, (err, success) => {
            if (err) {
                console.log(err);
            }
        });
    }
    if (cover_image.key !== "") {
        const deleteCoverParams = {
            Bucket: "twizzer-imagestorage",
            Key: cover_image.key,
        };
        s3.deleteObject(deleteCoverParams, (err, success) => {
            if (err) {
                console.log(err);
            }
        });
    }
};

const deletePostImage = (posts) => {
    for (post of posts) {
        for (image of post.images) {
            const deleteParams = {
                Bucket: "twizzer-imagestorage",
                Key: image.key,
            };
            s3.deleteObject(deleteParams, (err, success) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
};

const deleteCommentsImage = (comments) => {
    for (comment of comments) {
        if (comment.image.key) {
            const deleteParams = {
                Bucket: "twizzer-imagestorage",
                Key: comment.image.key,
            };
            s3.deleteObject(deleteParams, (err, success) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
};

const updateCommentNumberInPosts = (comments) => {
    for(comment of comments) {
        Post.updateOne({_id: comment.post}, {$inc: {comment_number: -1}}).exec((err, result) => {
            if(err) {
                console.log(err);
            }
        })
    }
}

const updateFollowerAndFollowing = (id) => {
    UserData.updateMany({ follower: { $in: id } }, { $pull: { follower: id } }).exec(
        (err, result) => {
            if (err) {
                console.log(err);
            }
            UserData.updateMany(
                {
                    following: {
                        $in: id,
                    },
                },
                { $pull: { following: id } }
            ).exec((err, result) => {
                if (err) {
                    console.log(err);
                }
            });
        }
    );
};

const updateLikeAndRetweet = (id, followingArray) => {
    Post.updateMany(
        { $and: [{ postedBy: { $in: followingArray } }, { type: "post" }] },
        { $pull: { like: id }, $pull: { retweet: id } }
    ).exec((err, result) => {
        if (err) {
            console.log(e);
        }
    });
};

exports.adminDeleteUser = (req, res) => {
    const { id } = req.params;
    UserData.findOne({ _id: id })
        .select("user following follower profile_image cover_image")
        .exec((err, user) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (user) {
                UserData.deleteOne({ _id: id }).exec((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Could not delete this user.",
                        });
                    }
                    User.deleteOne({ _id: user.user }).exec((err, result) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Could not delete this user.",
                            });
                        }
                        Post.find({ $and: [{ postedBy: id }, { type: "post" }] })
                            .select("images")
                            .exec((err, posts) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: "Could not delete this user.",
                                    });
                                }
                                Post.deleteMany({
                                    $or: [{ postedBy: id }, { retweetedBy: id }],
                                }).exec((err, result) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Something went wrong.",
                                        });
                                    }
                                    Notification.deleteMany({
                                        or: [{ from_user: id }, { to_user: id }],
                                    }).exec((err, result) => {
                                        if (err) {
                                            return res.status(400).json({
                                                error: "Something went wrong.",
                                            });
                                        }
                                        Comment.find({ commentedBy: id })
                                            .select("post image")
                                            .exec((err, comments) => {
                                                if (err) {
                                                    return res.status(400).json({
                                                        error: "Something went wrong.",
                                                    });
                                                }
                                                Comment.deleteMany({ commentedBy: id }).exec(
                                                    (err, result) => {
                                                        if (err) {
                                                            return res.status(400).json({
                                                                error: "Something went wrong.",
                                                            });
                                                        }
                                                        res.json({
                                                            message: "Deleted",
                                                        });
                                                        deleteUserImage(
                                                            user.profile_image,
                                                            user.cover_image
                                                        );
                                                        deletePostImage(posts);
                                                        deleteCommentsImage(comments);
                                                        updateCommentNumberInPosts(comments);
                                                        updateLikeAndRetweet(id, user.following);
                                                        updateFollowerAndFollowing(id);
                                                    }
                                                );
                                            });
                                    });
                                });
                            });
                    });
                });
            } else {
                return res.status(400).json({
                    error: "Could not found user.",
                });
            }
        });
};
