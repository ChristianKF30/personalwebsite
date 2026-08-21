import express from 'express';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // serves html.html, css/, script.js, images/

// ── Contact route ──────────────────────────────────────────────────────────
app.post('/contact', async (req, res) => {
    const { name, email, projectType, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO,
        replyTo: email,
        subject: `New Contact: ${projectType || 'General inquiry'} from ${name}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #76a9fa;">New message from your portfolio</h2>
                <table style="width:100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; font-weight: bold; color: #555;">Name</td>
                        <td style="padding: 8px;">${name}</td>
                    </tr>
                    <tr style="background:#f9f9f9;">
                        <td style="padding: 8px; font-weight: bold; color: #555;">Email</td>
                        <td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; font-weight: bold; color: #555;">Project Type</td>
                        <td style="padding: 8px;">${projectType || '-'}</td>
                    </tr>
                    <tr style="background:#f9f9f9;">
                        <td style="padding: 8px; font-weight: bold; color: #555; vertical-align: top;">Message</td>
                        <td style="padding: 8px; white-space: pre-line;">${message}</td>
                    </tr>
                </table>
                <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">
                    Sent from your portfolio contact form
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Contact email sent from ' + email);
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Failed to send email.' });
    }
});

// Serve html.html for all other GET requests
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'html.html'));
});

app.listen(PORT, () => {
    console.log('Portfolio server running on port ' + PORT);
});
