const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Initialize transporter
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.SYSTEM_EMAIL_ADDRESS,
                pass: process.env.SYSTEM_EMAIL_PASSWORD,
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 20000,
        });
    }

    async sendEmail(to, subject, text, html, attachment = null) {
        // Construct mail options
        const mailOptions = {
            from: process.env.SYSTEM_EMAIL_ADDRESS,
            to,
            subject,
            text,
            html,
            ...(attachment ? { attachments: [{ filename: attachment.filename, content: attachment.content }] } : {}),
        };

        // Logging mail options for debugging
        console.log("Mail options:", {
            to,
            subject,
            hasAttachment: !!attachment,
            attachmentDetails: attachment ? { filename: attachment.filename } : null,
        });

        try {
            // Attempt to send email
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Email successfully sent to ${to}:`, info);
            return { success: true, info }; // Return status and info
        } catch (error) {
            // Log any errors
            console.error(`Failed to send email to ${to}: ${error.message}`);
            return { success: false, error: error.message }; // Return error details
        }
    }
}

module.exports = new EmailService();
