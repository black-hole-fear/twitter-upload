const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
    {
        tag_name: {
            type: String,
            unique: true,
        },
        number: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tag", tagSchema);
