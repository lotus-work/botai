const mongoose = require('mongoose');
const { Schema } = mongoose;

const settingsSchema = new Schema({
    appName: String,
    homePageTitle: String,
    systemEmail: {
        username: String,
        emailAddress: String,
        password: String
    },
    chatGPT: {
        url: String,
        apiKey: String,
        modelName: String,
        masterInstruction: String
    },
    companyContact: {
        phone: String,
        emailAddress: String,
        fullAddress: String
    },
    websiteContent: {
        mainLogoPath: String,
        faviconPath: String
    },
    oktaSSO: {
        domain: String,
        clientId: String,
        redirectURL: String
    }
}, { 
    versionKey: false,
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);
module.exports = {
    Settings
};
