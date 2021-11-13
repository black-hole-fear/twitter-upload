const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const userDataSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: "User"
    },
    follower: [{
        type: ObjectId,
        ref: "User"
    }],
    following: [{
        type: ObjectId,
        ref: "User"
    }],
    bio: {
        type: String,
        max: 256
    },
    private: {
        type: Boolean,
        default: true
    },
    profile_image: {
        url: String,
        key: String
    },
    cover_image: {
        url: String,
        key: String
    },
})

module.exports = mongoose.model("UserData", userDataSchema)