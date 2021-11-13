const mongoose = require("mongoose");
const UserData = require("../models/userdata");
const Notification = require("../models/notification");
const Comment = require("../models/comment");
const Post = require("../models/post");
const Tag = require("../models/tag");
const aws = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

exports.getPosts = (req, res) => {
    const { _id } = req.user;
    const { limit, skip } = req.body;
    UserData.findOne({ _id })
        .select("following")
        .exec((err, followings) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not get posts",
                });
            }
            Post.find({
                $or: [
                    {
                        $and: [{ postedBy: { $in: followings.following } }, { type: "post" }],
                    },
                    {
                        $and: [{ postedBy: _id }, { type: "post" }],
                    },
                    { retweetedBy: { $in: followings.following } },
                    { retweetedBy: _id },
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
                .exec((err, data) => {
                    if (err) {
                        return res.status(400).json({
                            message: "Could not get posts.",
                        });
                    }
                    res.json(data);
                });
        });
};

exports.getPost = (req, res) => {
    const { _id } = req.user;
    const { postId } = req.body;
    Post.findOne({ _id: postId })
        .populate({
            path: "postedBy",
            select: "user profile_image",
            populate: { path: "user", select: "username name" },
        })
        .populate("tag", "tag_name")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (!data) {
                return res.status(400).json({
                    error: "Could not find post.",
                });
            }
            const owner = data.postedBy;
            UserData.findOne({ _id: owner._id })
                .select("follower private")
                .exec((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Something went wrong.",
                        });
                    }
                    if (result.private) {
                        if (result.follower.includes(_id) || _id == owner._id) {
                            res.json(data);
                        } else {
                            res.status(401).json({
                                error: "You could not access this post",
                            });
                        }
                    } else {
                        res.json(data);
                    }
                });
        });
};

exports.getYourPost = (req, res) => {
    const { _id } = req.user;
    const { limit, skip } = req.body;
    Post.find({
        $or: [{ $and: [{ postedBy: _id }, { type: { $ne: "retweet" } }] }, { retweetedBy: _id }],
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
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not fetch your posts.",
                });
            }
            res.json(data);
        });
};

const updateImageUrl = (_id, images) => {
    for (let i = 0; i < images.length; i++) {
        const base64Data = new Buffer.from(
            images[i].replace(/^data:image\/\w+;base64,/, ""),
            "base64"
        );
        const type = images[i].split(";")[0].split("/")[1];
        const params = {
            Bucket: "twizzer-imagestorage",
            Key: `post/${uuidv4()}.${type}`,
            Body: base64Data,
            ACL: "public-read",
            ContentEncoding: "base64",
            ContentType: "image/" + type,
        };
        s3.upload(params, (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            const imageObject = {
                url: data.Location,
                key: data.Key,
            };
            Post.updateOne({ _id }, { $push: { images: imageObject } }).exec((err, result) => {
                if (err) {
                    console.log(err);
                }
            });
        });
    }
};

exports.createPost = async (req, res) => {
    const { content, images } = req.body;
    const tag = req.body.tag || mongoose.Types.ObjectId("4edd40c86762e0fb12000003");
    const { _id } = req.user;
    if (images.length > 4) {
        return res.status(400).json({
            error: "Uploaded images must be less than 4.",
        });
    }
    const newPost = new Post({
        postedBy: _id,
        content,
        retweet: [],
        link: [],
        images: [],
        tag,
    });
    newPost.save((err, resultFromPost) => {
        if (err) {
            return res.status(400).json({
                error: "Could not add a new post.",
            });
        }
        if (tag != mongoose.Types.ObjectId("4edd40c86762e0fb12000003")) {
            Tag.updateOne({ _id: tag }, { $inc: { number: 1 } }).exec((err, resultFromTag) => {
                if (err) {
                    return res.status(400).json({
                        error: "Could not add a new post.",
                    });
                }
            });
        }
        if (images.length > 0) {
            updateImageUrl(resultFromPost._id, images);
            setTimeout(
                () =>
                    res.json({
                        message: "Your post is posted.",
                    }),
                500
            );
        } else {
            res.json({
                message: "Your post is posted.",
            });
        }
    });
};

exports.getUserPost = (req, res) => {
    const { _id } = req.user;
    const { limit, skip, userId } = req.body;
    UserData.findOne({ _id: userId })
        .select("private")
        .exec((err, checkPrivate) => {
            if (checkPrivate.private) {
                UserData.findOne({ _id: userId, follower: { $in: _id } })
                    .select("_id")
                    .exec((err, data) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Something went wrong.",
                            });
                        }
                        if (data) {
                            Post.find({
                                $or: [
                                    { postedBy: userId, type: "post" },
                                    { retweetedBy: userId, type: "retweet" },
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
                                .exec((err, data) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Could not fetch your posts.",
                                        });
                                    }
                                    res.json(data);
                                });
                        } else {
                            res.status(401).json({
                                error: "Follow this user to see these posts.",
                            });
                        }
                    });
            } else {
                Post.find({ $or: [{ postedBy: userId }, { retweetedBy: userId }] })
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
                    .exec((err, data) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Could not fetch your posts.",
                            });
                        }
                        res.json(data);
                    });
            }
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

exports.deletePost = (req, res) => {
    const { _id } = req.user;
    const postId = req.params.post;
    Post.findOne({ _id: postId })
        .select("postedBy images tag")
        .exec((err, post) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (post.postedBy == _id) {
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
            } else {
                res.status(401).json({
                    error: "You could not delete this post.",
                });
            }
        });
};
