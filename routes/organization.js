const express = require('express');
const router = express.Router();
const { OrganizationMembers } = require('../models/organizationMember'); // Adjust the path as necessary
const EmailService = require('../utils/emailService'); // Adjust the path as necessary

// Endpoint to add an organization member
router.post('/members/add', async (req, res) => {
    const { userId, organizationId, name, email } = req.body;

    // Validate input
    if (!userId || !organizationId || !name || !email) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        // Create a new organization member
        const newMember = new OrganizationMembers({
            userId,
            organizationId,
            name,
            email,
            isActive: false // Initially set to false
        });

        // Save the member to the database
        await newMember.save();

        // Prepare the email details
        const subject = 'You are Invited!';
        const text = `Hello ${name}, you have been invited to join the organization.`;
        const html = `<p>Hello ${name},</p><p>You have been invited to join the organization.</p>`;

        // Send the invitation email
        await EmailService.sendEmail(email, subject, text, html);

        // Respond with success
        res.status(201).json({ message: 'Organization member added and email invitation sent successfully!', member: newMember });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding organization member: ' + error.message });
    }
});

module.exports = router;
