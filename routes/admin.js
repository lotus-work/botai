const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const Users = require('../models/user'); 
const { Organizations } = require('../models/organization');
const { OrganizationMembers } = require('../models/organizationMember');
const { GptAssistants } = require('../models/gptAssistant');
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const { PageSettings } = require('../models/pageSetting');
const { Settings } = require('../models/settingsSchema');
const ApiResponse = require('../utils/apiResponse');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const JWT_SECRET = process.env.JWT_SECRET;
const mongoose = require('mongoose');

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

router.get('/users', async (req, res) => {
    try {
        const users = await Users.find();  // Fetch all users from the database
        
        // Prepare an array to store the user and their related data
        const result = [];

        // Iterate over each user to gather the related records
        for (let user of users) {
            const gptAssistant = (await GptAssistants.findOne({ userId: user._id })) || {}; // Default to empty object
            const organization = (await Organizations.findOne({ userId: user._id })) || {}; // Default to empty object
            const organizationMembers = (organization._id 
                ? await OrganizationMembers.find({ organizationId: organization._id }) 
                : []); // Default to empty array if no organization is found
    
            // Push a structured object for each user with their related records
            result.push({
                user,
                gptAssistants: gptAssistant || {},  // If no related GptAssistant, return an empty object
                organizations: organization || {},  // If no related Organization, return an empty object
                organizationMembers: organizationMembers || []  // If no related OrganizationMembers, return an empty array
            });
        }

        res.status(200).json({
            status: 200,
            isSuccessful: true,
            result: result,  // Send the final combined result
        });
    } catch (err) {
        console.error('Error fetching users:', err);  // Log the error for debugging
        res.status(500).json({
            status: 500,
            isSuccessful: false,
            result: { message: 'Error fetching users: ' + err.message }
        });
    }
});

router.post('/user/add', async (req, res) => {
    const { name, phoneNumber, emailAddress, assistantName, assistantId } = req.body;

    try {
        // Ensure required fields are provided
        if (!name || !emailAddress) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if the email address is already in use
        const existingUser = await Users.findOne({ emailAddress });
        if (existingUser) {
            return res.status(400).json({ message: 'Email address already in use.' });
        }

        // Create and save the new user
        const user = new Users({
            name,
            phoneNumber,
            emailAddress,
            isOwner: true,
            isActive: true,
        });

        const savedUser = await user.save();

        // Check if assistant data is provided
        if (assistantName && assistantId) {
            // Try to find the assistant by assistantId and assistantName
            let assistant = await GptAssistants.findOne({ assistantId });

            // If assistantId matches but the assistantName doesn't, create a new assistant
            if (assistant && assistant.assistantName !== assistantName) {
                assistant = new GptAssistants({
                    userId: savedUser._id,
                    assistantName,
                    assistantId,
                });
                await assistant.save();
            } else if (!assistant) {
                // Create a new assistant if it doesn't exist
                assistant = new GptAssistants({
                    userId: savedUser._id,
                    assistantName,
                    assistantId,
                });
                await assistant.save();
            }

            // Link the assistant to the user (if not already linked)
            savedUser.assistant = assistant._id;
            await savedUser.save();
        }

        // Respond with the created user data
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
    const { 
        name, 
        phoneNumber, 
        emailAddress, 
        organizationName, 
        isOwner, 
        isActive, 
        address, 
        role 
    } = req.body;

    try {
        if (!name && !phoneNumber && !emailAddress && !organizationName && isOwner === undefined && isActive === undefined && !address && !role) {
            return res.status(400).json({
                status: 400,
                isSuccessful: false,
                result: { message: 'At least one field is required to update.' }
            });
        }

        // Prepare the update payload dynamically
        const updatePayload = {};
        if (name) updatePayload.name = name;
        if (phoneNumber) updatePayload.phoneNumber = phoneNumber;
        if (emailAddress) updatePayload.emailAddress = emailAddress;
        if (address) updatePayload.address = address;
        if (isOwner !== undefined) updatePayload.isOwner = isOwner;
        if (isActive !== undefined) updatePayload.isActive = isActive;
        if (role) updatePayload.role = role;

        // Update user details
        const updatedUser = await Users.findByIdAndUpdate(
            userId,
            updatePayload,
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
            // Update or create the organization
            let organization = await Organizations.findOneAndUpdate(
                { userId: updatedUser._id },
                { name: organizationName },
                { new: true }
            );

            if (!organization) {
                // If organization not found, create a new one
                organization = await Organizations.create({
                    name: organizationName,
                    userId: updatedUser._id
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

router.get('/page-settings', async (req, res) => {
    const { page } = req.query;

    try {
        let projection = null;

        switch (page) {
            case 'aboutUs':
                projection = { aboutUs: 1 };
                break;
            case 'privacyPolicy':
                projection = { privacyPolicy: 1 };
                break;
            case 'termsOfUse':
                projection = { termsOfUse: 1 };
                break;
            case 'all':
                projection = { aboutUs: 1, termsOfUse: 1, privacyPolicy: 1, updatedBy: 1 };
                break;
            default:
                return res.status(400).json({
                    status: 400,
                    isSuccessful: false,
                    result: { message: 'Invalid page parameter. Valid values are "aboutUs", "privacyPolicy", "termsOfUse", or "all".' }
                });
        }

        const pageSettings = await PageSettings.findOne({}, projection).populate('updatedBy', 'username emailAddress');

        if (!pageSettings) {
            return res.status(404).json({
                status: 404,
                isSuccessful: false,
                result: { message: 'Page settings not found.' }
            });
        }

        res.status(200).json({
            status: 200,
            isSuccessful: true,
            result: pageSettings
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            isSuccessful: false,
            result: { message: 'Error fetching page settings: ' + err.message }
        });
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

router.delete('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Delete the user record
        const deletedUser = await Users.findByIdAndDelete(userId).session(session);
        if (!deletedUser) {
            await session.abortTransaction();
            return res.status(404).json({
                status: 404,
                isSuccessful: false,
                result: { message: 'User not found.' },
            });
        }

        // Delete related records if they exist
        // Delete related GptAssistants records
        await GptAssistants.deleteMany({ userId }).session(session);

        // Delete related Messages records
        await Message.deleteMany({ userId }).session(session);

        // Delete related Conversations records
        await Conversation.deleteMany({ userId }).session(session);

        // Delete related Organizations records
        await Organizations.deleteMany({ userId }).session(session);

        // Delete related OrganizationMembers records
        await OrganizationMembers.deleteMany({ userId }).session(session);

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            status: 200,
            isSuccessful: true,
            result: { message: 'User and associated records deleted successfully.' },
        });
    } catch (err) {
        // Abort the transaction in case of an error
        await session.abortTransaction();
        session.endSession();

        console.error('Error deleting user and associated records:', err);
        res.status(500).json({
            status: 500,
            isSuccessful: false,
            result: { message: 'Error deleting user and associated records: ' + err.message },
        });
    }
});


router.delete('/organization/:organizationId/member/:userId', async (req, res) => {
    const { organizationId, userId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const organization = await Organizations.findById(organizationId);
        if (!organization) {
            return ApiResponse.sendResponse(res, 404, false, 'Organization not found');
        }

        const memberRecord = await OrganizationMembers.findOne({ organizationId, userId });
        if (!memberRecord) {
            return ApiResponse.sendResponse(res, 404, false, 'User is not a member of this organization');
        }

        const memberDelete = await OrganizationMembers.deleteOne({ organizationId, userId }, { session });
        const userDelete = await Users.deleteOne({ _id: userId }, { session });
        const conversationsDelete = await Conversation.deleteMany({ userId: userId }, { session });
        const messagesDelete = await Message.deleteMany({ userId: userId }, { session });

        await session.commitTransaction();
        session.endSession();

        return ApiResponse.sendResponse(res, 200, true, {
            message: 'User and associated records deleted successfully',
            details: {
                memberDelete,
                userDelete,
                conversationsDelete,
                messagesDelete
            }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        return ApiResponse.sendResponse(res, 500, false, {
            message: 'Error occurred while deleting user and associated records',
            error: error.message
        });
    }
});


router.get('/message-stats', async (req, res) => {
    const { userId, year } = req.query;

    if (!userId || !year) {
        return res.status(400).json({
            status: 400,
            isSuccessful: false,
            result: { message: 'userId and year are required.' }
        });
    }

    try {
        // Step 1: Check if the user belongs to any organization
        const organization = await Organizations.findOne({ userId: userId });
        let userIds = [userId];  // Start with the provided userId as a string (no need for ObjectId())
        
        // Step 2: If the user belongs to an organization, get all organization members
        if (organization) {
            const members = await OrganizationMembers.find({ organizationId: organization._id });
            // Extract userIds of the organization members, convert them to string
            userIds = userIds.concat(members.map(member => member.userId.toString()));
        }

        const startDate = new Date(`${year}-01-01T00:00:00Z`); // Start of the year
        const endDate = new Date(`${Number(year) + 1}-01-01T00:00:00Z`); // Start of the next year
        const userIdsAsObjectId = userIds.map(id => new mongoose.Types.ObjectId(id));

        // Step 3: Aggregate the messages for all userIds (user + organization members)
        const messageStats = await Message.aggregate([
            {
                $match: {
                    userId: { $in: userIdsAsObjectId },  // Match any of the userIds (user + organization members)
                    createdAt: { $gte: startDate, $lt: endDate }  // Filter messages by the specified year
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },  // Group by month using the createdAt field
                    totalMessages: { $sum: 1 }  // Count the total messages for each month
                }
            },
            {
                $sort: { "_id": 1 }  // Sort by month (1 for ascending order)
            },
            {
                $project: {
                    month: "$_id",  // Project the month number
                    totalMessages: 1,  // Include the total message count
                    _id: 0  // Remove the _id field
                }
            }
        ]);

        // Step 4: Format the response with month names and corresponding total messages
        const result = {
            year: parseInt(year),
            month: []
        };

        // Fill in the months (1-12) with zero if no data exists for that month
        const monthNames = [
            "january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"
        ];

        // Loop through months (1-12) and fill in the result with the message counts
        for (let i = 1; i <= 12; i++) {
            const monthData = messageStats.find(stat => stat.month === i);
            result.month.push({
                [monthNames[i - 1]]: monthData ? monthData.totalMessages : 0
            });
        }

        res.status(200).json({
            status: 200,
            isSuccessful: true,
            result
        });
    } catch (err) {
        res.status(500).json({
            status: 500,
            isSuccessful: false,
            result: { message: 'Error fetching message stats: ' + err.message }
        });
    }
});


// Helper function to get month name
function getMonthName(monthNumber) {
    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthNumber - 1];
}


module.exports = router;
