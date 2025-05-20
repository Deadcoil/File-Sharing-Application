const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        default: null
    },
    downloadCount: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model("File", fileSchema);
