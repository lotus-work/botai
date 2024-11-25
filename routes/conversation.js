const express = require("express");
const router = express.Router();
const Users = require("../models/user");
const Conversation = require("../models/conversation"); // Correctly import the Conversation model
const Message = require("../models/message"); // Correctly import the Message model
const { Organizations } = require('../models/organization');
const { OrganizationMembers } = require('../models/organizationMember');
const { GptAssistants } = require('../models/gptAssistant');
const { Settings } = require('../models/settingsSchema');
const ApiResponse = require("../utils/apiResponse");
const archiver = require("archiver");
const moment = require("moment");
const mongoose = require("mongoose");
const path = require("path"); // Add this line
const fs = require("fs"); // Use the regular fs module for createWriteStream
const fsPromises = require("fs/promises");
const EmailService = require("../utils/emailService");
const axios = require('axios');
const OpenAI = require('openai');

// POST /conversations - Create a new conversation or add a message to an existing one
router.post("/add", async (req, res) => {
  try {
    const { conversationId, userId, assistantId, conversationName } =
      req.body;

    let conversation;

    const settings = await Settings.findOne();
    if (!settings || !settings.chatGPT) {
      return res.status(500).json({ status: 'error', message: 'ChatGPT settings are not configured.' });
    }

    const openai = new OpenAI({
      apiKey: settings.chatGPT.apiKey,
  });

  const thread = await openai.beta.threads.create();

    if (conversationId) {
      // Step 1: Check if the conversation exists
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res
          .status(404)
          .json({ success: false, message: "Conversation not found" });
      }
    } else {
      // Step 1: Create a new conversation if conversationId is not provided
      conversation = new Conversation({
        threadId : thread.id,
        userId,
        assistantId,
        conversationName,
      });
      await conversation.save();
    }

    return res.status(201).json({
      success: true,
      message: "Message added successfully",
      conversationId: conversation._id,
      threadId : thread.id
    });
  } catch (error) {
    console.error("Error handling conversation:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});


// GET /conversations/:conversationId - Retrieve a conversation by ID and user ID
router.get("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.query;

    // Step 1: Find the conversation by ID and user ID
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: userId,
    });

    if (!conversation) {
      return ApiResponse.sendResponse(
        res,
        404,
        false,
        "Conversation not found"
      );
    }

    // Step 2: Optionally retrieve messages related to the conversation
    const messages = await Message.find({ conversationId: conversation._id });

    // Step 3: Return the conversation with messages
    return ApiResponse.sendResponse(res, 200, true, { conversation, messages });
  } catch (error) {
    console.error("Error retrieving conversation:", error);
    return ApiResponse.sendResponse(res, 500, false, "Internal server error");
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Find all conversations for the user, sorted by createdAt
    const conversations = await Conversation.find({ userId }).sort({
      createdAt: -1,
    }); // Sort by createdAt in descending order

    if (!conversations.length) {
      return res.status(404).json({
        success: false,
        message: "No conversations found for this user.",
      });
    }

    // Step 2: Retrieve messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const messages = await Message.find({
          conversationId: conversation._id,
        });
        return {
          conversation,
          messages,
        };
      })
    );

    // Step 3: Return the conversations with messages
    return res.status(200).json({
      success: true,
      conversations: conversationsWithMessages,
    });
  } catch (error) {
    console.error("Error retrieving user conversations:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});


async function addMessage(openai, threadId, assistantId, message) {
  console.log('Adding a new message to thread: ' + threadId);

  // Send the message to OpenAI thread
  const response = await openai.beta.threads.messages.create(
    threadId,
    {
      role: "user",
      content: message
    }
  );
  
  return response; // Returning the message response
}

async function runAssistant(openai, threadId, assistantId) {
  console.log('Running assistant for thread: ' + threadId);

  // Start the assistant run for the thread
  const response = await openai.beta.threads.runs.create(
    threadId,
    { 
      assistant_id: assistantId
      // You can add more parameters if needed (like instruction override)
    }
  );

  return response; // Return the run response
}

async function checkingStatus(openai, res, threadId, runId, pollingInterval, message , conversationId, userId) {
  try {
    // Retrieve the run object to check its status
    const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
    const status = runObject.status;

    console.log('Current status: ' + status);

    if (status === 'completed') {
      clearInterval(pollingInterval); // Stop polling after completion

      const messagesList = await openai.beta.threads.messages.list(threadId);
    let messages = [];

    messagesList.body.data.forEach(message => {
      messages.push(message.content);
    });

      for (const messageArray of messages) {
        for (const message of messageArray) {
          if (message.type === "text" && message.text?.value) {
            firstMessageValue = message.text.value;
            break;
          }
        }
        if (firstMessageValue) break; // Exit outer loop if a value is found
      }

      if (!firstMessageValue) {
        throw new Error('No valid message text found.');
      }

    const newMessage = new Message({
      conversationId: conversationId,
      userId,
      senderType: "user",
      userPrompt: message,
      botReply: firstMessageValue,
      createdAt: new Date(),
    });
    await newMessage.save();

    const conversation = await Conversation.findOne({
      _id: conversationId,
    });
    conversation.updatedAt = new Date();
    await conversation.save();

      // Respond with the desired format
      res.json({
        response: {
          role: "assistant",
          content: firstMessageValue,
          refusal: null,
        },
        status: "success",
      });

      console.log({
        response: {
          role: "assistant",
          content: firstMessageValue,
          refusal: null,
        },
        status: "success",
      });
    }
  } catch (error) {
    console.error('Error while checking status:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
}


router.post('/chat', async (req, res) => {
  try {
    const { userId, message, temperature = 0.7, isOwner, threadId, conversationId } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ status: 'error', message: 'User ID and message are required.' });
    }

    let assistantUserId = userId;

    let pollingInterval;
    // If the user is not an owner, find the owner's userId via organization data
    if (!isOwner) {
      const memberData = await OrganizationMembers.findOne({ userId });
      if (!memberData || !memberData.organizationId) {
        return res.status(404).json({ status: 'error', message: 'Organization not found for the user.' });
      }

      const organizationData = await Organizations.findOne({ _id: memberData.organizationId });
      if (!organizationData || !organizationData.userId) {
        return res.status(404).json({ status: 'error', message: 'Owner not found for the organization.' });
      }

      assistantUserId = organizationData.userId; // Use the owner's userId
    }

    // Fetch assistant details for the resolved userId
    const assistantData = await GptAssistants.findOne({ userId: assistantUserId });
    if (!assistantData || !assistantData.assistantId) {
      return res.status(404).json({ status: 'error', message: 'Assistant ID not found for the user.' });
    }
    const { assistantId } = assistantData;

    // Fetch settings for OpenAI configuration
    const settings = await Settings.findOne();
    if (!settings || !settings.chatGPT) {
      return res.status(500).json({ status: 'error', message: 'ChatGPT settings are not configured.' });
    }
    const openai = new OpenAI({
      apiKey: settings.chatGPT.apiKey,
  });

    // Send message and then run the assistant
    addMessage(openai, threadId,assistantId, message).then(messageResponse => {
      // You could use messageResponse to access additional details if needed
      console.log('Message added successfully', messageResponse);

      // Run the assistant after adding the message
      runAssistant(openai, threadId, assistantId).then(runResponse => {
        const runId = runResponse.id;

        // Polling the assistant status
         pollingInterval = setInterval(() => {
          checkingStatus(openai, res, threadId, runId, pollingInterval, message, conversationId, userId);
        }, 5000); // Check the status every 5 seconds
      });
    });

  } catch (error) {
    console.error('Error processing the request:', error.message);
    res.status(500).json({ status: 'error', message: 'Internal server error. Please try again later.' });
  }
});





router.get("/export/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { userId } = req.query;

      console.log(conversationId, userId);
  
      // Step 1: Find the conversation by ID and user ID
      const conversation = await Conversation.findOne({
        _id: conversationId,
        userId: userId,
      });
  
      if (!conversation) {
        return res.status(404).json({
          status: 404,
          isSuccessful: false,
          result: "Conversation not found",
        });
      }
  
      // Step 2: Retrieve messages related to the conversation
      const messages = await Message.find({ conversationId: conversation._id });
  
      // Step 3: Fetch user data
      const user = await Users.findById(userId);
      const username = user ? user.name : "Unknown User";
      const userEmail = user ? user.emailAddress : null;
  
      console.log(`Username ${userEmail}`);
      if (!userEmail) {
        return res.status(400).json({
          status: 400,
          isSuccessful: false,
          result: "User email not found",
        });
      }
  
      // Step 4: Format the text content
      let txtContent = `User Id: ${userId}\n`;
      txtContent += `Username: ${username}\n`;
      txtContent += `Assistant Id: ${conversation.assistantId}\n`;
      txtContent += `Conversation Name: ${conversation.conversationName}\n\n`;
      txtContent += `Chat History\n`;
  
      messages.forEach((message) => {
        const userPrompt = removeHtmlTags(message.userPrompt);
        const botReply = removeHtmlTags(message.botReply);
  
        txtContent += `User: ${userPrompt}\n`;
        txtContent += `Bot: ${botReply}\n`;
        txtContent += `Created At: "${message.createdAt}",\n`;
        txtContent += `Updated At: "${message.updatedAt}"\n\n`;
      });
  
      // Convert the content to a buffer for attachment
      const buffer = Buffer.from(txtContent, "utf-8");
  
      // Step 5: Send the file as a downloadable response
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=chat_export.txt"
      );
      res.setHeader("Content-Type", "text/plain");
      res.send(txtContent);
  
      const todayDate = moment().format("Do, MMM, YYYY");
      const subject = `${todayDate} Conversation Export`;
      try {
        console.log(`Email processing..`);
        await EmailService.sendEmail(
          userEmail,
          subject,
          `Hello ${username},\n\nYour requested chat export is ready and attached to this email.`,
          `<p>Hello ${username},</p><p>Your requested chat export is ready and attached to this email.</p>`,
          {
            filename: `${todayDate}_chat_export.txt`,
            content: buffer,
          }
        );
  
        console.log(`Email successfully sent to ${userEmail}`);
      } catch (emailError) {
        console.error(`Failed to send email: ${emailError.message}`);
      }
    } catch (error) {
      console.error("Error exporting chat:", error);
      return res.status(500).json({
        status: 500,
        isSuccessful: false,
        result: "Internal server error",
      });
    }
  });
  

function removeHtmlTags(str) {
  return str.replace(/<\/?[^>]+(>|$)/g, ""); // Matches HTML tags and removes them
}

router.get("/export/bydate/:startDate/:endDate/:userId?", async (req, res) => {
    try {
      const { startDate, endDate, userId } = req.params;
  
      // Validate startDate and endDate
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required.",
        });
      }
  
      // Parse dates
      const start = moment(startDate, "YYYY-MM-DD").utc().startOf("day");
      const end = moment(endDate, "YYYY-MM-DD").add(1, "days").utc().endOf("day");
      
      
  
      // Build aggregation pipeline
      const pipeline = [
        {
          $match: {
            updatedAt: { $gte: start.toDate(), $lte: end.toDate() },
          },
        },
      ];
  
      // Optionally match userId if provided
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        pipeline.push({ $match: { userId: new mongoose.Types.ObjectId(userId) } });
      }
  
      // Fetch conversations
      const conversations = await Conversation.aggregate(pipeline);
      console.log(conversations);
      if (!conversations.length) {
        return res.status(404).json({
          success: false,
          message: "No conversations found in the specified date range.",
        });
      }
  
      // Fetch user if userId is provided
      let user = null;
      if (userId) {
        user = await Users.findById(userId);
        if (!user) {
          throw new Error("User not found. Please provide a valid user ID.");
        }
      }
  
      const username = user ? user.name : "Unknown User";
      const userEmail = user.emailAddress;
  
      // Prepare temp directory and ZIP file path
      const tempDir = path.join(__dirname, "temp_conversations");
      await fsPromises.mkdir(tempDir, { recursive: true });
  
      const zipFilePath = path.join(__dirname, "conversations.zip");
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });
  
      archive.pipe(output);
  
      // Loop through conversations and create text files
      for (const conversation of conversations) {
        const messages = await Message.find({ conversationId: conversation._id });
  
        let txtContent = `User Id: ${userId || "N/A"}\nUsername: ${username}\nAssistant Id: ${conversation.assistantId}\nConversation Name: ${conversation.conversationName}\n\nChat History\n`;
  
        messages.forEach((message) => {
          txtContent += `User: ${removeHtmlTags(message.userPrompt)}\nBot: ${removeHtmlTags(message.botReply)}\nCreated At: ${message.createdAt}\nUpdated At: ${message.updatedAt}\n\n`;
        });
  
        const filePath = path.join(tempDir, `conversation_${conversation._id}.txt`);
        await fsPromises.writeFile(filePath, txtContent);
        archive.file(filePath, { name: `conversation_${conversation._id}.txt` });
      }
  
      await archive.finalize();
  
      // Wait for ZIP to be created
      output.on("close", async () => {
        // Send ZIP as attachment
        const zipBuffer = await fsPromises.readFile(zipFilePath);
        const todayDate = moment().format("Do, MMM, YYYY");
        const subject = `${todayDate} Conversations Export`;
  
        const emailResult = await EmailService.sendEmail(
          userEmail,
          subject,
          `Hello ${username},\n\nYour conversations export from ${startDate} to ${endDate} is attached.`,
          `<p>Hello ${username},</p><p>Your conversations export from <strong>${startDate}</strong> to <strong>${endDate}</strong> is attached.</p>`,
          { filename: `${todayDate}_conversations.zip`, content: zipBuffer }
        );
  
        // Clean up temporary files
        try {
          await fsPromises.rm(tempDir, { recursive: true, force: true });
          await fsPromises.unlink(zipFilePath);
        } catch (cleanupError) {
          console.error("Error cleaning up temporary files:", cleanupError);
        }
  
        // Respond based on email success
        if (emailResult.success) {
          res.status(200).json({
            success: true,
            message: "Export successful and email sent",
          });
        } else {
          console.error("Email sending failed:", emailResult.error);
          res.status(500).json({
            success: false,
            message: "Export successful but email failed to send",
          });
        }
      });
    } catch (error) {
      console.error("Error exporting conversations:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  });
  
  

router.delete("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    await Message.deleteMany({ conversationId: conversation._id });

    await Conversation.findByIdAndDelete(conversation._id);

    return res.status(200).json({
      success: true,
      message: "Conversation and associated messages deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting conversation and messages:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
