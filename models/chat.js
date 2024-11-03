const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assistantId: { type: Schema.Types.ObjectId, ref: 'GptAssistant', required: true },
    title: { type: String, required: true },
    questionsResponses: [{
        question: { type: String, required: true },
        response: { type: String, required: true },
        questionTime: { type: Date, default: Date.now },
        responseTime: { type: Date }
    }],
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date }
}, { 
    versionKey: false,
    timestamps: true // Enable timestamps here
});

const Chats = mongoose.model('Chats', chatSchema);
module.exports = {
    Chats
};
