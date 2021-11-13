const Tag = require("../models/tag");
const UserData = require("../models/userdata");
const Post = require("../models/post");

exports.createTag = (req, res) => {
    const { tag } = req.body;
    if (tag.trim().replace(" ", "").length < tag.trim().length) {
        return res.status(400).json({
            error: "Tag name must not has a space.",
        });
    }
    Tag.findOne({ tag_name: tag })
        .select("_id")
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            if (data) {
                res.status(400).json({
                    error: `${tag} has already existed.`,
                });
            } else {
                const newTag = new Tag({ tag_name: tag });
                newTag.save((err, result) => {
                    if (err) {
                        return res.status(400).json({
                            error: "Could not create a tag.",
                        });
                    }
                    res.json({
                        message: "Created successfully.",
                    });
                });
            }
        });
};

exports.getPopularTag = (req, res) => {
    Tag.find({})
        .sort({ number: -1 })
        .limit(5)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not get popular tags.",
                });
            }
            res.json({
                tags: data,
            });
        });
};

exports.getTags = (req, res) => {
    Tag.find({})
        .sort({ number: -1 })
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not get popular tags.",
                });
            }
            res.json({
                tags: data,
            });
        });
};

exports.getPostsOfTag = (req, res) => {
    const { _id } = req.user;
    const { tag, limit, skip } = req.body;
    Tag.findOne({ _id: tag })
        .select("tag_name")
        .exec((err, tagData) => {
            if (err) {
                return res.status(400).json({
                    error: "Something went wrong.",
                });
            }
            UserData.findOne({ _id })
                .select("following")
                .exec((err, user) => {
                    UserData.find({ private: false })
                        .select("_id")
                        .exec((er, users) => {
                            if (err) {
                                return res.status(400).json({
                                    error: "Something went wrong.",
                                });
                            }
                            const publicUsers = users.map((u, idx) => u._id);
                            Post.find({
                                tag,
                                $or: [
                                    {$and: [{ postedBy: _id }, {type: "post"}]},
                                    {$and: [{ postedBy: { $in: user.following } }, {type: "post"}]},
                                    {$and: [{ postedBy: { $in: publicUsers } }, {type: "post"}]},
                                ],
                            })
                                .populate({
                                    path: "postedBy",
                                    select: "user profile_image",
                                    populate: { path: "user", select: "username name" },
                                })
                                .populate("tag", "tag_name")
                                .skip(skip)
                                .limit(limit)
                                .exec((err, data) => {
                                    if (err) {
                                        return res.status(400).json({
                                            error: "Could not fetch posts.",
                                        });
                                    }
                                    if (!data) {
                                        return res.status(400).json({
                                            error: "์No posts in this tag.",
                                        });
                                    }
                                    res.json({
                                        posts: data,
                                        tag_name: tagData.tag_name,
                                    });
                                });
                        });
                });
        });
};
