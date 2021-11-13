const mongoose = require("mongoose");
const UserData = require("../models/userdata");
const Post = require("../models/post");
const Notification = require("../models/notification");

exports.retweet = (req, res) => {
    const { _id } = req.user;
    const { postId, ownerPostId } = req.body;
    Post.findOne({ retweetedBy: _id, origin_post: postId }).exec((err, result) => {
        if (err) {
            return res.status(400).json({
                error: "Something went wrong.",
            });
        }
        if (result) {
            return res.status(400).json({
                error: "You could not retweet this post anymore.",
            });
        }
        UserData.findOne({ _id: ownerPostId })
            .select("follower private")
            .exec((err, user) => {
                if (err) {
                    return res.status(400).json({
                        error: "Something went wrong.",
                    });
                }
                if (user) {
                    if (user.private) {
                        if (user.follower.includes(_id) || _id == ownerPostId) {
                            Post.updateOne({ _id: postId }, { $push: { retweet: _id } }).exec(
                                (err, updated) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Could not retweet.",
                                        });
                                    }
                                    const newRetweet = new Post({
                                        postedBy: ownerPostId,
                                        tag: mongoose.Types.ObjectId("4edd40c86762e0fb12000003"),
                                        type: "retweet",
                                        origin_post: postId,
                                        retweetedBy: _id,
                                    });
                                    newRetweet.save((err, retweet) => {
                                        if (err) {
                                            return res.status(400).json({
                                                error: "Could not retweet.",
                                            });
                                        }
                                        const newRetweetId = retweet._id;
                                        Post.findOne({ _id: newRetweetId })
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
                                            .exec((err, newTweet) => {
                                                if (err) {
                                                    return res.status(400).json({
                                                        error: "Something went wrong.",
                                                    });
                                                }
                                                if (_id == ownerPostId) {
                                                    res.json({
                                                        message: "Retweeted",
                                                        newTweet,
                                                    });
                                                } else {
                                                    const newAlert = new Notification({
                                                        type: "retweet",
                                                        from_user: _id,
                                                        to_user: ownerPostId,
                                                        origin_post: postId,
                                                    });
                                                    newAlert.save((err, result) => {
                                                        if (err) {
                                                            return res.status(400).json({
                                                                error: "Something went wrong.",
                                                            });
                                                        }
                                                        res.json({
                                                            message: "Retweeted",
                                                            newTweet,
                                                        });
                                                    });
                                                }
                                            });
                                    });
                                }
                            );
                        } else {
                            res.status(401).json({
                                error: "You are not allowed to retweet this post.",
                            });
                        }
                    } else {
                        Post.updateOne({ _id: postId }, { $push: { retweet: _id } }).exec(
                            (err, updated) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: "Could not retweet.",
                                    });
                                }
                                const newRetweet = new Post({
                                    postedBy: ownerPostId,
                                    tag: mongoose.Types.ObjectId("4edd40c86762e0fb12000003"),
                                    type: "retweet",
                                    origin_post: postId,
                                    retweetedBy: _id,
                                });
                                newRetweet.save((err, retweet) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Could not retweet.",
                                        });
                                    }
                                    const newRetweetId = retweet._id;
                                    Post.findOne({ _id: newRetweetId })
                                        .populate({
                                            path: "postedBy",
                                            select: "user profile_image",
                                            populate: { path: "user", select: "username name" },
                                        })
                                        .populate({
                                            path: "retweetedBy",
                                            select: "user",
                                            populate: { path: "user", select: "username name" },
                                        })
                                        .populate("origin_post", "_id content images")
                                        .exec((err, newTweet) => {
                                            if (err) {
                                                return res.status(400).json({
                                                    error: "Something went wrong.",
                                                });
                                            }
                                            if (_id == ownerPostId) {
                                                res.json({
                                                    message: "Retweeted",
                                                    newTweet,
                                                });
                                            } else {
                                                const newAlert = new Notification({
                                                    type: "retweet",
                                                    from_user: _id,
                                                    to_user: ownerPostId,
                                                    origin_post: postId,
                                                });
                                                newAlert.save((err, result) => {
                                                    if (err) {
                                                        return res.status(400).json({
                                                            error: "Something went wrong.",
                                                        });
                                                    }
                                                    res.json({
                                                        message: "Retweeted",
                                                        newTweet,
                                                    });
                                                });
                                            }
                                        });
                                });
                            }
                        );
                    }
                } else {
                    res.status(400).json({
                        error: "Could not find this user.",
                    });
                }
            });
    });
};

exports.cancelRetweet = (req, res) => {
    const { _id } = req.user;
    const { postId, ownerPostId } = req.body;
    UserData.findOne({ _id: ownerPostId })
        .select("follower private")
        .exec((err, user) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (user) {
                if (user.private) {
                    if (user.follower.includes(_id) || _id === ownerPostId) {
                        Post.findOneAndDelete({
                            retweetedBy: _id,
                            origin_post: postId,
                            postedBy: ownerPostId,
                        }).exec((err, resultBeforeDelete) => {
                            if (err) {
                                return res.status(400).json({
                                    error: "Something went wrong.",
                                });
                            }
                            Post.updateOne({ _id: postId }, { $pull: { retweet: _id } }).exec(
                                (err, data) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Something went wrong.",
                                        });
                                    }
                                    if (_id === ownerPostId) {
                                        res.status(200).json({
                                            message: "Canceled",
                                            deletedRetweet: resultBeforeDelete._id,
                                        });
                                    } else {
                                        Notification.deleteOne({
                                            type: "retweet",
                                            from_user: _id,
                                            origin_post: postId,
                                        }).exec((err, result) => {
                                            if (err) {
                                                return res.status(400).json({
                                                    error: "Something went wrong.",
                                                });
                                            }
                                            res.status(200).json({
                                                message: "Canceled",
                                                deletedRetweet: resultBeforeDelete._id,
                                            });
                                        });
                                    }
                                }
                            );
                        });
                    } else {
                        res.status(401).json({
                            error: "You could not cancel retweet this post.",
                        });
                    }
                } else {
                    Post.findOneAndDelete({
                        retweetedBy: _id,
                        origin_post: postId,
                        postedBy: ownerPostId,
                    }).exec((err, resultBeforeDelete) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Something went wrong.",
                            });
                        }
                        Post.updateOne({ _id: postId }, { $pull: { retweet: _id } }).exec(
                            (err, data) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: "Something went wrong.",
                                    });
                                }
                                Notification.deleteOne({
                                    type: "retweet",
                                    from_user: _id,
                                    origin_post: postId,
                                }).exec((err, result) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Something went wrong.",
                                        });
                                    }
                                    res.status(200).json({
                                        message: "Canceled",
                                        deletedRetweet: resultBeforeDelete._id,
                                    });
                                });
                            }
                        );
                    });
                }
            } else {
                res.status(400).json({
                    error: "Could not find a user.",
                });
            }
        });
};
