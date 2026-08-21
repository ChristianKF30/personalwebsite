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

    const targetEmail = process.env.EMAIL_TO || process.env.EMAIL_USER;
    if (!targetEmail) {
        return res.status(500).json({ error: 'Recipient email missing. Set EMAIL_TO or EMAIL_USER on Render.' });
    }

    try {
        const response = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(targetEmail.trim()), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                _subject: 'New Portfolio Contact: ' + (projectType || 'General inquiry') + ' from ' + name,
                projectType: projectType || '-',
                message: message
            })
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok || data.success === 'true' || data.success === true) {
            return res.status(200).json({ success: true });
        } else {
            throw new Error(data.message || 'Error from email service');
        }
    } catch (err) {
        console.error('Contact error:', err.message);
        return res.status(500).json({ error: 'Failed to send message: ' + err.message });
    }
});

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'html.html'));
});

app.listen(PORT, function () {
    console.log('Portfolio server running on port ' + PORT);
});

