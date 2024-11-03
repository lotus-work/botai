const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
    username: { type: String, required: true, unique: true },
    emailAddress: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
}, { versionKey: false, timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
