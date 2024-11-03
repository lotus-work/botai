const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const { Users } = require('../models/user');
const { Organizations } = require('../models/organization');
const { GptAssistants } = require('../models/gptAssistant');
const { PageSettings } = require('../models/pageSetting');
const { Settings } = require('../models/settingsSchema');
const ApiResponse = require('../utils/apiResponse');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const JWT_SECRET = process.env.JWT_SECRET;

dotenv.config();

router.get('/', async (req, res) => {
    try {
        const admin = await Admin.find();
        res.json(admin);
    } catch (err) {
        res.send('Error ' + err);
    }
});

router.post('/', async (req, res) => {
    const admin = new Admin({
        username: req.body.username,
        emailAddress: req.body.emailAddress,
        password: req.body.password,
    });

    try {
        const savedAdmin = await admin.save();
        res.status(201).json(savedAdmin);
    } catch (err) {
        res.status(400).json({ message: 'Error creating admin: ' + err.message });
    }
});

const sendResponse = (res, status, isSuccessful, result) => {
    res.status(status).json({
        status,
        isSuccessful,
        result,
    });
};

router.post('/login', async (req, res) => {
    const { emailAddress, username, password } = req.body;

    try {
        if ((!emailAddress && !username) || !password) {
            return sendResponse(res, 400, false, { message: 'Username or email address and password are required.' });
        }

        const admin = await Admin.findOne({
            $or: [{ emailAddress }, { username }]
        });

        if (!admin || admin.password !== password) {
            return sendResponse(res, 401, false, { message: 'Invalid credentials. Please check your credentials and try again.' });
        }

        const token = jwt.sign({ adminId: admin._id }, JWT_SECRET, { expiresIn: '1h' });

        const result = {
            token,
            id: admin._id,
            username: admin.username,
            emailAddress: admin.emailAddress,
        };

        sendResponse(res, 200, true, result);
    } catch (err) {
        console.error(err);
        sendResponse(res, 500, false, { message: 'An unexpected error occurred. Please try again later.' });
    }
});

router.post('/user/add', async (req, res) => {
    const { name, phoneNumber, emailAddress, organizationName, assistantName, assistantId } = req.body;

    try {
        if (!name || !emailAddress || !organizationName) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await Users.findOne({ emailAddress });
        if (existingUser) {
            return res.status(400).json({ message: 'Email address already in use.' });
        }

        const user = new Users({
            name,
            phoneNumber,
            emailAddress,
            isOwner: true
        });

        const savedUser = await user.save();

        let organization = await Organizations.findOne({ name: organizationName });
        if (!organization) {
            organization = new Organizations({
                userId: savedUser._id, // Use the randomly generated ObjectId
                name: organizationName
            });
            await organization.save();
        }

        if (assistantName && assistantId) {
            const assistant = new GptAssistants({
                userId: savedUser._id,
                assistantName,
                assistantId
            });
            await assistant.save();
        }

        res.status(201).json({ message: 'User created successfully.', user: savedUser });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user: ' + err.message });
    }
});

router.put('/user/edit/gptassistant/:userId', async (req, res) => {
    const { userId } = req.params;
    const { assistantName, assistantId } = req.body;

    try {
        const updatedAssistant = await GptAssistants.findOneAndUpdate(
            { userId },
            {
                assistantName,
                assistantId,
                isActive: true
            },
            { new: true, runValidators: true }
        );

        if (!updatedAssistant) {
            return ApiResponse.sendResponse(res, 404, false, { message: 'Assistant not found for this user.' });
        }

        ApiResponse.sendResponse(res, 200, true, { message: 'Assistant updated successfully.', assistant: updatedAssistant });
    } catch (err) {
        ApiResponse.sendResponse(res, 500, false, { message: 'Error updating assistant: ' + err.message });
    }
});

router.put('/user/edit/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { name, phoneNumber, emailAddress, organizationName } = req.body;

    try {
        if (!name && !phoneNumber && !emailAddress && !organizationName) {
            return res.status(400).json({
                status: 400,
                isSuccessful: false,
                result: { message: 'At least one field is required to update.' }
            });
        }

        const updatedUser = await Users.findByIdAndUpdate(
            userId,
            { name, phoneNumber, emailAddress },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: 404,
                isSuccessful: false,
                result: { message: 'User not found.' }
            });
        }

        if (organizationName) {
            const organization = await Organizations.findOneAndUpdate(
                { userId: updatedUser._id },
                { name: organizationName },
                { new: true }
            );

            if (!organization) {
                return res.status(404).json({
                    status: 404,
                    isSuccessful: false,
                    result: { message: 'Organization not found.' }
                });
            }
        }

        res.status(200).json({
            status: 200,
            isSuccessful: true,
            result: { user: updatedUser }
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            isSuccessful: false,
            result: { message: 'Error updating user: ' + err.message }
        });
    }
});

router.put('/page-settings', async (req, res) => {
    const { aboutUs, termsOfUse, privacyPolicy, updatedBy } = req.body;

    try {
        let pageSettings = await PageSettings.findOne();

        if (pageSettings) {
            pageSettings.aboutUs = aboutUs;
            pageSettings.termsOfUse = termsOfUse;
            pageSettings.privacyPolicy = privacyPolicy;
            pageSettings.updatedBy = updatedBy;
        } else {
            pageSettings = new PageSettings({
                aboutUs,
                termsOfUse,
                privacyPolicy,
                updatedBy
            });
        }

        const savedSettings = await pageSettings.save();
        sendResponse(res, 200, true, savedSettings);
    } catch (err) {
        sendResponse(res, 500, false, { message: 'Error updating or adding page settings: ' + err.message });
    }
});

router.get('/settings', async (req, res) => {
    try {
        const settings = await Settings.findOne();
        sendResponse(res, 200, true, settings || {});
    } catch (err) {
        sendResponse(res, 500, false, { message: 'Error fetching settings: ' + err.message });
    }
});

router.put('/settings', async (req, res) => {
    const {
        appName, homePageTitle,
        systemEmail, chatGPT, companyContact,
        websiteContent, oktaSSO
    } = req.body;

    try {
        let settings = await Settings.findOne();

        if (settings) {
            settings.appName = appName || settings.appName;
            settings.homePageTitle = homePageTitle || settings.homePageTitle;
            settings.systemEmail = { ...settings.systemEmail, ...systemEmail };
            settings.chatGPT = { ...settings.chatGPT, ...chatGPT };
            settings.companyContact = { ...settings.companyContact, ...companyContact };
            settings.websiteContent = { ...settings.websiteContent, ...websiteContent };
            settings.oktaSSO = { ...settings.oktaSSO, ...oktaSSO };
        } else {
            settings = new Settings({
                appName, homePageTitle,
                systemEmail, chatGPT, companyContact,
                websiteContent, oktaSSO
            });
        }

        const savedSettings = await settings.save();

        updateEnvFile({
            APP_NAME: settings.appName,
            HOME_PAGE_TITLE: settings.homePageTitle,
            SYSTEM_EMAIL_USERNAME: systemEmail.username || settings.systemEmail.username,
            SYSTEM_EMAIL_ADDRESS: systemEmail.emailAddress || settings.systemEmail.emailAddress,
            SYSTEM_EMAIL_PASSWORD: systemEmail.password || settings.systemEmail.password,
            CHATGPT_URL: chatGPT.url || settings.chatGPT.url,
            CHATGPT_API_KEY: chatGPT.apiKey || settings.chatGPT.apiKey,
            CHATGPT_MODEL: chatGPT.modelName || settings.chatGPT.modelName,
            CHATGPT_MASTER_INSTRUCTION: chatGPT.masterInstruction || settings.chatGPT.masterInstruction,
            COMPANY_PHONE: companyContact.phone || settings.companyContact.phone,
            COMPANY_EMAIL: companyContact.emailAddress || settings.companyContact.emailAddress,
            COMPANY_ADDRESS: companyContact.fullAddress || settings.companyContact.fullAddress,
            WEBSITE_MAIN_LOGO_PATH: websiteContent.mainLogoPath || settings.websiteContent.mainLogoPath,
            WEBSITE_FAVICON_PATH: websiteContent.faviconPath || settings.websiteContent.faviconPath,
            OKTA_DOMAIN: oktaSSO.domain || settings.oktaSSO.domain,
            OKTA_CLIENT_ID: oktaSSO.clientId || settings.oktaSSO.clientId,
            OKTA_REDIRECT_URL: oktaSSO.redirectURL || settings.oktaSSO.redirectURL,
        });

        sendResponse(res, 200, true, savedSettings);
    } catch (err) {
        sendResponse(res, 500, false, { message: 'Error updating settings: ' + err.message });
    }
});

const updateEnvFile = (newEnvVars) => {
    const envFilePath = path.join(__dirname, '..', '.env');
    
    // Read existing env file
    const existingEnvContent = fs.readFileSync(envFilePath, { encoding: 'utf8' });
    const envLines = existingEnvContent.split('\n');
    
    // Update the lines with new values
    const updatedEnvLines = envLines.map(line => {
        const [key] = line.split('=');
        if (newEnvVars[key]) {
            return `${key}="${newEnvVars[key]}"`;
        }
        return line; // Keep the existing line if no updates are needed
    });
    
    // Write back the updated lines to the env file
    fs.writeFileSync(envFilePath, updatedEnvLines.join('\n'), { encoding: 'utf8' });
};

module.exports = router;
