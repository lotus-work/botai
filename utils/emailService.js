const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 5000, // 5 seconds
            socketTimeout: 20000, // 20 seconds
            host: "smtp.gmail.com",
            port: 465,
            secure: true, 
            auth: {
            user: process.env.SYSTEM_EMAIL_ADDRESS,
            pass: process.env.SYSTEM_EMAIL_PASSWORD,
        },
        });
    }

    async sendEmail(to, subject, text, html) {
        const mailOptions = {
            from: process.env.SYSTEM_EMAIL_ADDRESS,
            to, 
            subject,
            text,
            html,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.error(`Failed to send email: ${error.message}`);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }
}

module.exports = new EmailService();