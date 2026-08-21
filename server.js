const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(__dirname));
app.post('/contact', async function(req, res) {
    const { name, email, projectType, message } = req.body;
    if (!name || !email || !message) { return res.status(400).json({ error: 'Missing required fields.' }); }
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
    const mailOptions = { from: process.env.EMAIL_USER, to: process.env.EMAIL_TO, replyTo: email, subject: 'New Contact: ' + (projectType || 'General inquiry') + ' from ' + name, text: 'Name: ' + name + '\nEmail: ' + email + '\nProject: ' + (projectType || '-') + '\n\n' + message };
    try { await transporter.sendMail(mailOptions); return res.status(200).json({ success: true }); }
    catch (err) { console.error('Email error:', err.message); return res.status(500).json({ error: 'Failed to send email.' }); }
});
app.get('*', function(req, res) { res.sendFile(path.join(__dirname, 'html.html')); });
app.listen(PORT, function() { console.log('Portfolio server running on port ' + PORT); });
