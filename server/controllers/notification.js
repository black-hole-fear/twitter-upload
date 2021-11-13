const Notification = require("../models/notification");

exports.getNotifications = (req, res) => {
    const { _id } = req.user;
    const { limit, skip } = req.body;
    Notification.find({ to_user: _id, type: { $ne: "request" } })
        .populate({
            path: "from_user",
            select: "user profile_image",
            populate: { path: "user", select: "name username" },
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not find notification.",
                });
            }
            res.json(data);
        });
};

exports.getRequests = (req, res) => {
    const { _id } = req.user;
    Notification.find({ to_user: _id, type: "request" })
        .populate({
            path: "from_user",
            select: "user profile_image",
            populate: { path: "user", select: "name username" },
        })
        .sort({ createdAt: -1 })
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Could not find notification.",
                });
            }
            res.json(data);
        });
};