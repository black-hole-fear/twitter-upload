const UserData = require("../models/userdata");
const Post = require("../models/post");
const Notification = require("../models/notification");

exports.like = (req, res) => {
    const { _id } = req.user;
    const { postId, ownerPostId } = req.body;
    UserData.findOne({_id: ownerPostId}).select("follower private").exec((err, result) => {
        if(err) {
            return res.status(400).json({
                error: "Something went wrong."
            })
        }
        Post.findOne({_id: postId}).select("_id").exec((err, data) => {
            if(data) {
                if(result) {
                    if(result.private) {
                        if(result.follower.includes(_id) || _id === ownerPostId) {
                            Post.updateOne({_id: postId}, {$push: {like: _id}}).exec((err, result) => {
                                if(err) {
                                    return res.status(400).json({
                                        error: "Something went wrong."
                                    })
                                }
                                if(_id === ownerPostId) {
                                    res.json({
                                        message: "Liked"
                                    })
                                }else {
                                    const newAlert = new Notification({from_user: _id, to_user: ownerPostId, type: "like", origin_post: postId});
                                    newAlert.save((err, data) => {
                                        if(err) {
                                            return res.status(400).json({
                                                error: "Something went wrong."
                                            })
                                        }
                                        res.json({
                                            message: "Liked"
                                        })
                                    })
                                }
                            })
                        }else {
                            res.status(401).json({
                                error: "You could not like this post."
                            })
                        }
                    }else {
                        Post.updateOne({_id: postId}, {$push: {like: _id}}).exec((err, result) => {
                            if(err) {
                                return res.status(400).json({
                                    error: "Something went wrong."
                                })
                            }
                            if(_id === ownerPostId) {
                                res.json({
                                    message: "Liked"
                                })
                            }else {
                                const newAlert = new Notification({from_user: _id, to_user: ownerPostId, type: "like", origin_post: postId});
                                newAlert.save((err, data) => {
                                    if(err) {
                                        return res.status(400).json({
                                            error: "Something went wrong."
                                        })
                                    }
                                    res.json({
                                        message: "Liked"
                                    })
                                })
                            }
                        })
                    }
                }else {
                    res.status(400).json({
                        error: "Something went wrong."
                    })
                }
            }else {
                res.status(400).json({
                    error: "Post has been deleted."
                })
            }
        })
    })
};

exports.unlike = (req, res) => {
    const { _id } = req.user;
    const { postId, ownerPostId } = req.body;
    UserData.findOne({_id: ownerPostId}).select("follower private").exec((err, result) => {
        if(err) {
            return res.status(400).json({
                error: "Something went wrong."
            })
        }
        Post.findOne({_id: postId}).select("_id").exec((err, data) => {
            if(data) {
                if(result) {
                    if(result.private) {
                        if(result.follower.includes(_id) || _id === ownerPostId) {
                            Post.updateOne({_id: postId}, {$pull: {like: _id}}).exec((err, result) => {
                                if(err) {
                                    return res.status(400).json({
                                        error: "Something went wrong."
                                    })
                                }
                                Notification.deleteOne({origin_post: postId, from_user: _id, to_user: ownerPostId}).exec((err, result) => {
                                    if(err) {
                                        return res.status(400).json({
                                            error: "Something went wrong."
                                        })
                                    }
                                    res.json({
                                        message: "UnLiked"
                                    })
                                })
                            })
                        }else {
                            res.status(401).json({
                                error: "You could not unlike this post."
                            })
                        }
                    }else {
                        Post.updateOne({_id: postId}, {$pull: {like: _id}}).exec((err, result) => {
                            if(err) {
                                return res.status(400).json({
                                    error: "Something went wrong."
                                })
                            }
                            Notification.deleteOne({origin_post: postId, from_user: _id, to_user: ownerPostId}).exec((err, result) => {
                                if(err) {
                                    return res.status(400).json({
                                        error: "Something went wrong."
                                    })
                                }
                                res.json({
                                    message: "UnLiked"
                                })
                            })
                        })
                    }
                }else {
                    res.status(400).json({
                        error: "Something went wrong."
                    })
                }
            }else {
                res.status(400).json({
                    error: "Post has been deleted."
                })
            }
        })
    })
};
