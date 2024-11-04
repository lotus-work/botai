const express = require('express');
const router = express.Router();
const Users = require('../models/user'); 
const Conversation = require('../models/conversation'); // Correctly import the Conversation model
const Message = require('../models/message'); // Correctly import the Message model
const ApiResponse = require('../utils/apiResponse');
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
            txtContent += `User: ${message.userPrompt}\n`;
            txtContent += `Bot: ${message.botReply}\n`;
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


module.exports = router;
