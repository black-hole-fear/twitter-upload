const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const notificationSchema = new mongoose.Schema({
    to_user: {
        ref: "UserData",
        type: ObjectId
    },
    from_user: {
        ref: "UserData",
        type: ObjectId
    },
    type: String,
    comment_id: String,
    origin_post: {
        type: ObjectId,
        ref: "Post"
    }
}, {
    timestamps: true,
})

module.exports = mongoose.model("Notification", notificationSchema);