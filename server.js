const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.post('/contact', async function (req, res) {
    const { name, email, projectType, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Email server error: EMAIL_USER or EMAIL_PASS environment variables are not configured.');
        return res.status(500).json({ error: 'Server email configuration missing. Set EMAIL_USER and EMAIL_PASS on Render.' });
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER.trim(),
            pass: process.env.EMAIL_PASS.trim().replace(/\s+/g, '')
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        replyTo: email,
        subject: 'New Contact: ' + (projectType || 'General inquiry') + ' from ' + name,
        text: 'Name: ' + name + '\nEmail: ' + email + '\nProject: ' + (projectType || '-') + '\n\nMessage:\n' + message
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Email sending error:', err.message);
        return res.status(500).json({ error: 'Failed to send email: ' + err.message });
    }
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'html.html'));
});

app.listen(PORT, function () {
    console.log('Portfolio server running on port ' + PORT);
});

