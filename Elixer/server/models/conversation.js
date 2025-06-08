const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { type: String, enum: ['user', 'bot'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required: true }
});

const conversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    conversationID: { type: String, required: true },
    messages: [messageSchema],
    topic: { type: String }
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
