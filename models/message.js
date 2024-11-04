const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderType: { type: String, enum: ['user', 'bot'], required: true },
    userPrompt: { type: String },
    botReply: { type: String },
    messageType: { type: String, enum: ['text', 'image', 'file', 'link'], default: 'text' },
    createdAt: { type: Date, default: Date.now }
}, {
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
