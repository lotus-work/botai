const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    address: { type: String, required: false },
    emailAddress: { type: String, required: true, unique: true },
    isOwner: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: { type: String, enum: ['Admin', 'Organization Member', 'User'], default: 'User' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' }
}, { 
    versionKey: false,
    timestamps: true // Enable timestamps here
});

const Users = mongoose.model('Users', userSchema);

module.exports = {
    Users
};
