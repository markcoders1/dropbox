const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
    access_token: {
        type: String,
        required: true,
    },
    generated_at: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

module.exports = mongoose.model("token", tokenSchema);
