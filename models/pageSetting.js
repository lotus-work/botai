const mongoose = require('mongoose');
const { Schema } = mongoose;

const pageSettingsSchema = new Schema({
    aboutUs: { type: String },
    termsOfUse: { type: String },
    privacyPolicy: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' }
}, { 
    versionKey: false,
    timestamps: true // Enable timestamps here
});

const PageSettings = mongoose.model('PageSettings', pageSettingsSchema);

module.exports = {
    PageSettings
};

