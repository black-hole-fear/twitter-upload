const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const commentSchema = new mongoose.Schema({
    post: {
        ref: "Post",
        type: ObjectId,
    },
    commentedBy: {
        ref: "UserData",
        type: ObjectId
    },
    content: {
        type: String,
        max: 256
    },
    image: {
        url: String,
        key: String,
    }
}, {timestamps: true})

module.exports = mongoose.model("Comment", commentSchema);