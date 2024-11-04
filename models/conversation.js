const mongoose = require('mongoose');
const { Schema } = mongoose;

const conversationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assistantId: { type: Schema.Types.ObjectId, ref: 'GptAssistant', required: true },
    conversationName: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
    endedAt: { type: Date }
}, { 
    versionKey: false,
    timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema);
