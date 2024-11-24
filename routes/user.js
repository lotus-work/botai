const express = require('express');
const router = express.Router();
const Users = require('../models/user');
const { Organizations } = require('../models/organization');
const ApiResponse = require('../utils/apiResponse');
const mongoose = require('mongoose');
const { OrganizationMembers } = require('../models/organizationMember');
const EmailService = require('../utils/emailService');
const { encrypt, decrypt } = require('../utils/encryptionUtility');
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const { GptAssistants } = require('../models/gptAssistant');

router.post('/add', async (req, res) => {
    const { appName, appLogo, name, phoneNumber, emailAddress } = req.body;

    try {
        let user = await Users.findOne({ emailAddress });
        let gptAssistant;
        if (user) {
            // Check if the user is the owner or not
            if (user.isOwner) {
                // Check if the user has an organization
                const organization = await Organizations.findOne({ userId: user._id });
                const gptAssistant = await GptAssistants.findOne({ userId: user._id });
                let response = { message: 'User logged in successfully', user };

                if (organization && gptAssistant) {
                    // Append organization details to the response
                    response.organization = organization;
                    response.gptAssistant = gptAssistant;
                }

                ApiResponse.sendResponse(res, 200, true, response);
            } else {
                // If the user is not an owner, find the organizationId the user belongs to
                const orgMember = await OrganizationMembers.findOne({ userId: user._id });

                if (orgMember) {
                    const organization = await Organizations.findOne({ _id: orgMember.organizationId });
                    if (organization) {
                        // Find the user (not owner) in the organization and get their appName and appLogo
                        const orgUser = await Users.findOne({ _id: organization.userId });
                        const gptAssistantOfUser = await GptAssistants.findOne({ userId: organization.userId });
                        if (orgUser && gptAssistantOfUser) {
                            // Append appName and appLogo from the organization user to the current user record
                            user.appName = orgUser.appName;
                            user.appLogo = orgUser.appLogo;
                            gptAssistant = gptAssistantOfUser;
                        }
                    }
                }

                ApiResponse.sendResponse(res, 200, true, { message: 'User logged in successfully', user , gptAssistant});
            }
        } else {
            // Create a new user
            user = new Users({
                appName,
                appLogo,
                name,
                phoneNumber,
                emailAddress,
                isOwner: true,
                role: 'User',
                isActive: true
            });
            await user.save();

            ApiResponse.sendResponse(res, 201, true, { message: 'User created and logged in successfully', user });
        }
    } catch (err) {
        ApiResponse.sendResponse(res, 500, false, { message: 'Error during add/login operation', error: err.message });
    }
});
;


router.get('/get/:id', async (req, res) => {
    const userId = req.params.id;

    // Check if the provided ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return ApiResponse.sendResponse(res, 400, false, { message: 'Invalid user ID format' });
    }

    try {
        const user = await Users.findById(userId);

        if (!user) {
            return res.status(404).json({
                status: 404,
                isSuccessful: false,
                result: { message: 'User not found' },
            });
        }

        // Fetch related data with fallbacks for null/undefined cases
        const gptAssistant = (await GptAssistants.findOne({ userId: user._id })) || {}; // Default to empty object
        const organization = (await Organizations.findOne({ userId: user._id })) || {}; // Default to empty object
        const organizationMembers = (organization._id 
            ? await OrganizationMembers.find({ organizationId: organization._id }) 
            : []); // Default to empty array if no organization is found

        // Construct the response using the spread operator
        const result = {
            ...user.toObject(), // Spread all fields of the `user` object
            gptAssistant, // Include related GptAssistant
            organization, // Include related Organization
            organizationMembers, // Include related OrganizationMembers
        };

        // Send the response
        res.status(200).json({
            status: 200,
            isSuccessful: true,
            result, // Send the final combined result
        });
    } catch (err) {
        console.error('Error fetching user details:', err);
        res.status(500).json({
            status: 500,
            isSuccessful: false,
            result: { message: 'Error fetching user details: ' + err.message },
        });
    }
});



router.put('/update/:id', async (req, res) => {
    const userId = req.params.id;
    const { appName, appLogo, name, phoneNumber, address } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return ApiResponse.sendResponse(res, 400, false, { message: 'Invalid user ID format' });
    }

    try {
        const updatedUser = await Users.findByIdAndUpdate(
            userId,
            { appName, appLogo, name, phoneNumber, address },
            { new: true },
        );

        if (!updatedUser) {
            return ApiResponse.sendResponse(res, 404, false, { message: 'User not found' });
        }

        ApiResponse.sendResponse(res, 200, true, { message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        ApiResponse.sendResponse(res, 500, false, { message: 'Error updating user information', error: err.message });
    }
});

router.post('/organization/add/:userid', async (req, res) => {
    const { name } = req.body;
    const { userid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userid)) {
        return ApiResponse.sendResponse(res, 400, false, { message: 'Invalid user ID format' });
    }

    try {
        const user = await Users.findById(userid);
        if (!user) {
            return ApiResponse.sendResponse(res, 404, false, { message: 'User not found' });
        }

        const newOrganization = new Organizations({
            name,
            userId: userid,
        });

        await newOrganization.save();
        return ApiResponse.sendResponse(res, 201, true, { message: 'Organization created successfully', organization: newOrganization });
    } catch (err) {
        return ApiResponse.sendResponse(res, 500, false, { message: 'Error creating organization', error: err.message });
    }
});

router.post('/organization/members/add', async (req, res) => {
    const { organizationId, name, emailAddress } = req.body;

    if (!organizationId || !name || !emailAddress) {
        return ApiResponse.sendResponse(res, 400, false, 'All fields are required.');
    }

    try {
        let user = await Users.findOne({ emailAddress });

        if (!user) {
            user = new Users({
                name,
                emailAddress,
                role: 'Organization Member',
                isActive: false
            });
            await user.save();
        } else {
            const existingMember = await OrganizationMembers.findOne({
                userId: user._id,
                organizationId
            });

            if (existingMember) {
                return ApiResponse.sendResponse(res, 400, false, 'User is already a part of this organization.');
            }
        }

        const newMember = new OrganizationMembers({
            userId: user._id,
            organizationId,
            name: user.name,
            email: user.emailAddress,
            isActive: false
        });
        await newMember.save();

        const encryptedUserId = encrypt(user._id.toString());
        const encryptedOrganizationId = encrypt(organizationId);
        const activationUrl = `${process.env.BASE_API_URL}/user/organization/members/update/status/${encryptedUserId}/${encryptedOrganizationId}?q=status=true`;

        console.log('Activation URL:', activationUrl); // Debugging

        const subject = 'You are Invited!';
        const text = `Hello ${name}, you have been invited to join the organization. Activate here: ${activationUrl}`;
        const html = `<p>Hello ${name},</p><p>You have been invited to join the organization.</p><p>Activate here: <a href="${activationUrl}">Activate</a></p>`;

        await EmailService.sendEmail(emailAddress, subject, text, html);

        ApiResponse.sendResponse(res, 201, true, {
            message: 'Organization member added, user created (if new), and email invitation sent successfully!',
            member: newMember,
            user
        });
    } catch (error) {
        console.error(error);
        ApiResponse.sendResponse(res, 500, false, `Error adding organization member: ${error.message}`);
    }
});

router.get('/organization/members/update/status/:encryptedUserId/:encryptedOrganizationId', async (req, res) => {
    console.log(req.params);
    const { encryptedUserId, encryptedOrganizationId } = req.params;
    const { q } = req.query;
    const isActive = q === 'status=true';

    try {
        console.log(`Encrypted IDs: ${encryptedUserId}, ${encryptedOrganizationId}, Query: ${q}, isActive: ${isActive}`);

        const userId = decrypt(encryptedUserId);
        const organizationId = decrypt(encryptedOrganizationId);

        console.log('Decrypted userId:', userId, 'Decrypted organizationId:', organizationId);

        if (!userId || !organizationId) {
            return res.status(400).send('Invalid link or decryption failed');
        }

        const updateMember = await OrganizationMembers.updateMany(
            { userId, organizationId },
            { isActive }
        );

        const updateUser = await Users.updateOne(
            { _id: userId },
            { isActive }
        );

        console.log('Update Member Result:', updateMember);
        console.log('Update User Result:', updateUser);

        if (updateMember.modifiedCount === 0 && updateUser.modifiedCount === 0) {
            return res.status(404).send('No updates made. Member or User may not exist.');
        }

        res.status(200).send(`
            <h1>Success</h1>
            <p>The status has been successfully updated.</p>
            <p>Organization ID: ${organizationId}</p>
            <p>User ID: ${userId}</p>
            <p>New Status: ${isActive}</p>
            <p><a href="${process.env.BASE_URL}">Click here to login</a></p>
        `);
    } catch (error) {
        console.error(`Error updating isActive status: ${error.message}`);
        res.status(500).send(`
            <h1>Error</h1>
            <p>There was an error updating the status.</p>
            <p>Error: ${error.message}</p>
        `);
    }
});

router.get('/organization/check/:userid', async (req, res) => {
    const { userid } = req.params;

    if (!userid) {
        return ApiResponse.sendResponse(res, 400, false, 'userId is required.');
    }

    try {
        // First, find the organization associated with the user
        const organizations = await Organizations.find({ userId: userid }); // Adjust this query to match your schema

        if (organizations.length === 0) {
            return ApiResponse.sendResponse(res, 200, false, 'No organization found for this user.');
        }

        // Assuming we take the first organization found
        const firstOrganization = organizations[0];

        // Now, find the members of the organization
        const organizationMembers = await OrganizationMembers.find({ organizationId: firstOrganization._id }); // Adjust field to match your schema

        ApiResponse.sendResponse(res, 200, true, {
            message: 'Organization found.',
            organization: firstOrganization,
            members: organizationMembers
        });
    } catch (error) {
        console.error(error);
        ApiResponse.sendResponse(res, 500, false, 'Error checking organization: ' + error.message);
    }
});


router.delete('/remove-user-from-org/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Check if the user exists in the OrganizationMembers collection
        const organizationMember = await OrganizationMembers.findOne({ userId });

        if (!organizationMember) {
            return res.status(404).json({
                status: 404,
                isSuccessful: false,
                result: { message: 'User is not a member of any organization.' }
            });
        }

        // Remove the user from the OrganizationMembers collection
        await OrganizationMembers.deleteOne({ userId });

        // Remove associated messages
        await Message.deleteMany({ userId });

        // Remove associated conversations
        await Conversation.deleteMany({ userId });

        // Send a success response
        return res.status(200).json({
            status: 200,
            isSuccessful: true,
            result: { message: 'User successfully removed from OrganizationMembers and associated data deleted.' }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: 500,
            isSuccessful: false,
            result: { message: 'Error removing user from organization: ' + err.message }
        });
    }
});

module.exports = router;
