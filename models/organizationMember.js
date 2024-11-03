const mongoose = require('mongoose');
const { Schema } = mongoose;

const organizationMembersSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    memberRole: { type: String, enum: ['Owner', 'Admin', 'Member'], default: 'Member' },
    isActive: { type: Boolean, default: true }
}, { 
    versionKey: false,
    timestamps: true // Enable timestamps here
});

const OrganizationMembers = mongoose.model('OrganizationMembers', organizationMembersSchema);
module.exports = {
    OrganizationMembers
};
