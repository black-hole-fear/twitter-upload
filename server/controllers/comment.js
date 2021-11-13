const mongoose = require("mongoose");
const UserData = require("../models/userdata");
const Post = require("../models/post");
const Notification = require("../models/notification");
const Comment = require("../models/comment");
const aws = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const commenting = (req, res) => {
    const { _id } = req.user;
    const { ownerId, comment, postId, image } = req.body;
    const newComment = new Comment({ post: postId, commentedBy: _id, content: comment });
    if (image) {
        const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
        const type = image.split(";")[0].split("/")[1];
        const params = {
            Bucket: "twizzer-imagestorage",
            Key: `comment/${uuidv4()}.${type}`,
            Body: base64Data,
            ACL: "public-read",
            ContentEncoding: "base64",
            ContentType: "image/" + type,
        };
        s3.upload(params, (err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not upload image.",
                });
            }
            newComment.image.url = data.Location;
            newComment.image.key = data.Key;
            newComment.save((err, newComment) => {
                if (err) {
                    return res.status(400).json({
                        error: "Could not comment this post.",
                    });
                }
                Post.updateOne({ _id: postId }, { $inc: { comment_number: 1 } }, {new: true}).exec(
                    (err, result) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Could not comment this post.",
                            });
                        }
                        Comment.findOne({_id: newComment._id}).populate({
                            path: "commentedBy",
                            select: "user profile_image",
                            populate: { path: "user", select: "name username" },
                        }).exec((err, newComment) => {
                            if (err) {
                                return res.status(400).json({
                                    error: "Could not comment this post.",
                                });
                            }
                            if(_id === ownerId) {
                                res.json({
                                    message: "Commented",
                                    newComment
                                });
                            }else {
                                const newAlert = new Notification({
                                    to_user: ownerId,
                                    from_user: _id,
                                    type: "comment",
                                    comment_id: newComment._id,
                                    origin_post: postId,
                                });
                                newAlert.save((err, result) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Could not sent notification to owner post.",
                                        });
                                    }
                                    res.json({
                                        message: "Commented",
                                        newComment
                                    });
                                });
                            }
                        })
                    }
                );
            });
        });
    } else {
        const newComment = new Comment({ post: postId, commentedBy: _id, content: comment });
        newComment.save((err, newComment) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not comment this post.",
                });
            }
            Post.updateOne({ _id: postId }, { $inc: { comment_number: 1 } }, {new: true}).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Could not comment this post.",
                        });
                    }
                    Comment.findOne({_id: newComment._id}).populate({
                        path: "commentedBy",
                        select: "user profile_image",
                        populate: { path: "user", select: "name username" },
                    }).exec((err, newComment) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Could not comment this post.",
                            });
                        }
                        if(_id === ownerId) {
                            res.json({
                                message: "Commented",
                                newComment
                            });
                        }else {
                            const newAlert = new Notification({
                                to_user: ownerId,
                                from_user: _id,
                                type: "comment",
                                comment_id: newComment._id,
                                origin_post: postId,
                            });
                            newAlert.save((err, result) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: "Could not sent notification to owner post.",
                                    });
                                }
                                res.json({
                                    message: "Commented",
                                    newComment
                                });
                            });
                        }
                    })
                }
            );

        });
    }
}

exports.comment = (req, res) => {
    const { _id } = req.user;
    const { ownerId } = req.body;
    UserData.findOne({_id: ownerId}).select("private follower").exec((err, user) => {
        if(user.private) {
            if(user.follower.includes(_id) || _id === ownerId) {
                commenting(req, res);
            }else {
                res.status(401).json({
                    error: "You could not comment this post."
                })
            }
        }else {
            commenting(req, res);
        }
    })
};

exports.getComments = (req, res) => {
    const { _id } = req.user;
    const { postId, limit, skip } = req.body;
    Post.findOne({ _id: postId })
        .select("postedBy")
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (!result) {
                return res.status(400).json({
                    error: "Could not find post.",
                });
            }
            Comment.find({ post: postId })
                .populate({
                    path: "commentedBy",
                    select: "user profile_image",
                    populate: { path: "user", select: "name username" },
                })
                .limit(limit)
                .skip(skip)
                .sort({createdAt: -1})
                .exec((err, comments) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Could not find comments.",
                        });
                    }
                    res.json(comments);
                });
        });
};

exports.deleteComment = (req, res) => {
    const {_id} = req.user;
    const {commentId} = req.body;
    Comment.findOne({_id: commentId}).select("post commentedBy").exec((err, comment) => {
        if(err) {
            return res.status(400).json({
                error: "Something went wrong."
            })
        }
        if(comment.commentedBy == _id) {
            Comment.deleteOne({_id: commentId}).exec((err, result) => {
                if(err) {
                    return res.status(400).json({
                        error: "Something went wrong."
                    })
                }
                Post.updateOne({_id: comment.post}, {$inc: {comment_number: -1}}).exec((err, result) => {
                    if(err) {
                        return res.status(400).json({
                            error: "Something went wrong."
                        })
                    }
                    Notification.deleteOne({ comment_id: commentId,  type: "comment", commentedBy: _id }).exec((err, result) => {
                        if(err) {
                            return res.status(400).json({
                                error: "Something went wrong."
                            })
                        }
                        res.json({
                            message:  "Deleted"
                        })
                    })
                })
            })
        }else {
            res.status(401).json({
                success: "You could not delete this comment."
            })
        }
    })
}