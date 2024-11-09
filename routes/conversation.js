const express = require('express');
const router = express.Router();
const Users = require('../models/user'); 
const Conversation = require('../models/conversation'); // Correctly import the Conversation model
const Message = require('../models/message'); // Correctly import the Message model
const ApiResponse = require('../utils/apiResponse');
const archiver = require('archiver');
const moment = require('moment');
const mongoose = require('mongoose');
const path = require('path');  // Add this line
const fs = require('fs');  // Use the regular fs module for createWriteStream
const fsPromises = require('fs/promises'); 
// POST /conversations - Create a new conversation or add a message to an existing one
router.post('/add', async (req, res) => {
    try {
        const { conversationId, userId, assistantId, conversationName, message } = req.body;

        let conversation;

        if (conversationId) {
            // Step 1: Check if the conversation exists
            conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ success: false, message: 'Conversation not found' });
            }
        } else {
            // Step 1: Create a new conversation if conversationId is not provided
            conversation = new Conversation({
                userId,
                assistantId,
                conversationName
            });
            await conversation.save();
        }

        // Step 2: Add a new message to the conversation
        const newMessage = new Message({
            conversationId: conversation._id,
            userId,
            senderType: 'user',
            userPrompt: message.userPrompt,
            botReply: message.botReply,
            createdAt: new Date()
        });
        await newMessage.save();
        conversation.updatedAt = new Date();
        await conversation.save();

        return res.status(201).json({
            success: true,
            message: 'Message added successfully',
            conversationId: conversation._id
        });
    } catch (error) {
        console.error('Error handling conversation:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// GET /conversations/:conversationId - Retrieve a conversation by ID and user ID
router.get('/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.query; // Get userId from query parameters

        // Step 1: Find the conversation by ID and user ID
        const conversation = await Conversation.findOne({ 
            _id: conversationId,
            userId: userId // Ensure that the conversation belongs to the user
        });

        if (!conversation) {
            return ApiResponse.sendResponse(res, 404, false, 'Conversation not found');
        }

        // Step 2: Optionally retrieve messages related to the conversation
        const messages = await Message.find({ conversationId: conversation._id });

        // Step 3: Return the conversation with messages
        return ApiResponse.sendResponse(res, 200, true, { conversation, messages });
    } catch (error) {
        console.error('Error retrieving conversation:', error);
        return ApiResponse.sendResponse(res, 500, false, 'Internal server error');
    }
});

router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Step 1: Find all conversations for the user, sorted by createdAt
        const conversations = await Conversation.find({ userId })
            .sort({ createdAt: -1 }); // Sort by createdAt in descending order

        if (!conversations.length) {
            return res.status(404).json({
                success: false,
                message: 'No conversations found for this user.'
            });
        }

        // Step 2: Retrieve messages for each conversation
        const conversationsWithMessages = await Promise.all(conversations.map(async (conversation) => {
            const messages = await Message.find({ conversationId: conversation._id });
            return {
                conversation,
                messages
            };
        }));

        // Step 3: Return the conversations with messages
        return res.status(200).json({
            success: true,
            conversations: conversationsWithMessages
        });
    } catch (error) {
        console.error('Error retrieving user conversations:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

router.get('/export/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { userId } = req.query; // Get userId from query parameters

        // Step 1: Find the conversation by ID and user ID
        const conversation = await Conversation.findOne({ 
            _id: conversationId,
            userId: userId // Ensure that the conversation belongs to the user
        });

        if (!conversation) {
            return res.status(404).json({
                status: 404,
                isSuccessful: false,
                result: 'Conversation not found'
            });
        }

        // Step 2: Retrieve messages related to the conversation
        const messages = await Message.find({ conversationId: conversation._id });

        // Step 3: Fetch user data (username)
        const user = await Users.findById(userId);
        const username = user ? user.name : 'Unknown User'; // Adjust according to your User model

        // Step 4: Format the text content
        let txtContent = `User Id: ${userId}\n`;
        txtContent += `Username: ${username}\n`;
        txtContent += `Assistant Id: ${conversation.assistantId}\n`;
        txtContent += `Conversation Name: ${conversation.conversationName}\n\n`;
        txtContent += `Chat History\n`;

        messages.forEach(message => {
            // Remove HTML tags from userPrompt and botReply
            const userPrompt = removeHtmlTags(message.userPrompt);
            const botReply = removeHtmlTags(message.botReply);

            txtContent += `User: ${userPrompt}\n`;
            txtContent += `Bot: ${botReply}\n`;
            txtContent += `Created At: "${message.createdAt}",\n`;
            txtContent += `Updated At: "${message.updatedAt}"\n\n`;
        });

        // Step 5: Set headers for download
        res.setHeader('Content-Disposition', 'attachment; filename=chat_export.txt');
        res.setHeader('Content-Type', 'text/plain');
        res.send(txtContent); // Send the file content directly to the client
    } catch (error) {
        console.error('Error exporting chat:', error);
        return res.status(500).json({
            status: 500,
            isSuccessful: false,
            result: 'Internal server error'
        });
    }
});
function removeHtmlTags(str) {
    return str.replace(/<\/?[^>]+(>|$)/g, "");  // Matches HTML tags and removes them
}

router.get('/export/bydate/:startDate/:endDate/:userId?', async (req, res) => {
    try {
        const { startDate, endDate, userId } = req.params; // Access from req.params

        // Check if both startDate and endDate are provided
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Start date and end date are required.' });
        }

        // Parse the dates
        const start = moment(startDate, 'YYYY-MM-DD').startOf('day');
        const end = moment(endDate, 'YYYY-MM-DD').endOf('day');
        const pipeline = [
            {
                $match: {
                    updatedAt: { $gte: start.toDate(), $lte: end.toDate() }
                }
            }
        ];

        // If userId is provided and valid, add it to the pipeline
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            pipeline.push({
                $match: {
                    userId: new mongoose.Types.ObjectId(userId)
                }
            });
        }

        // Execute the aggregation
        const conversations = await Conversation.aggregate(pipeline);

        if (!conversations.length) {
            return res.status(404).json({ success: false, message: 'No conversations found in the specified date range.' });
        }

        // Prepare a temporary directory
        const tempDir = path.join(__dirname, 'temp_conversations');
        await fsPromises.mkdir(tempDir, { recursive: true });  // Correctly using fs.promises.mkdir

        const zipFilePath = path.join(__dirname, 'conversations.zip');
        const output = fs.createWriteStream(zipFilePath);  // Non-promisified fs.createWriteStream
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.pipe(output);

        for (const conversation of conversations) {
            const messages = await Message.find({ conversationId: conversation._id });
            const user = userId ? await Users.findById(userId) : null;
            const username = user ? user.name : 'Unknown User';

            let txtContent = `User Id: ${userId || 'N/A'}\nUsername: ${username}\nAssistant Id: ${conversation.assistantId}\nConversation Name: ${conversation.conversationName}\n\nChat History\n`;

            messages.forEach(message => {
                txtContent += `User: ${removeHtmlTags(message.userPrompt)}\nBot: ${removeHtmlTags(message.botReply)}\nCreated At: ${message.createdAt}\nUpdated At: ${message.updatedAt}\n\n`;
            });

            const filePath = path.join(tempDir, `conversation_${conversation._id}.txt`);
            await fsPromises.writeFile(filePath, txtContent);
            archive.file(filePath, { name: `conversation_${conversation._id}.txt` });
        }

        await archive.finalize();

        output.on('close', async () => {
            res.setHeader('Content-Disposition', 'attachment; filename=conversations.zip');
            res.setHeader('Content-Type', 'application/zip');
            res.sendFile(zipFilePath, async (err) => {
                if (err) {
                    console.error('Error sending ZIP file:', err);
                    return res.status(500).json({ success: false, message: 'Error sending the ZIP file.' });
                }

                try {
                    await fsPromises.rm(tempDir, { recursive: true, force: true });
                    await fsPromises.unlink(zipFilePath);
                } catch (cleanupError) {
                    console.error('Error cleaning up temporary files:', cleanupError);
                }
            });
        });
    } catch (error) {
        console.error('Error exporting conversations:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.delete('/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        await Message.deleteMany({ conversationId: conversation._id });

        await Conversation.findByIdAndDelete(conversation._id);

        return res.status(200).json({
            success: true,
            message: 'Conversation and associated messages deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting conversation and messages:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


module.exports = router;
