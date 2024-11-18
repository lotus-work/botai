const mongoose = require('mongoose');
const { Schema } = mongoose;

const gptAssistantSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assistantName: { type: String, required: true },
    assistantId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    modelVersion: { type: String },
  },
  {
    versionKey: false,
    timestamps: true, // Enable timestamps here
  }
);

// Add compound unique index for assistantName and assistantId
gptAssistantSchema.index({ assistantName: 1, assistantId: 1 }, { unique: true });

const GptAssistants = mongoose.model('GptAssistants', gptAssistantSchema);
module.exports = {
  GptAssistants,
};
