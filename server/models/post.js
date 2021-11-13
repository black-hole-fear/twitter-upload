const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema({
    postedBy: {
        type: ObjectId,
        ref: "UserData"
    },
    content: {
        type: String,
        max: 256
    },
    tag: {
        type: ObjectId,
        ref: "Tag",
        default: ""
    },
    retweet: [{
        type: ObjectId,
        ref: "UserData"
    }],
    like: [{
        type: ObjectId,
        ref: "UserData"
    }],
    comment_number: {
        type: Number,
        default: 0
    },
    images: [{
        type: Object
    }],
    type: {
        type: String,
        default: "post"
    },
    origin_post: {
        type: ObjectId,
        ref: "Post"
    },
    retweetedBy: {
        type: ObjectId,
        ref: "UserData"
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Post", postSchema)