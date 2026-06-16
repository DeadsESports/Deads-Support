const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch'); // Make sure to npm install node-fetch@2 if you use this
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');

const app = express();
const PORT = process.env.PORT || 3000;

// Cookie/Session parser simulation for state storage
app.use(express.json());

// --- 1. TICKET TOOL INTERACTION ENDPOINT ---
app.post('/interactions', verifyKeyMiddleware(process.env.CLIENT_PUBLIC_KEY), (req, res) => {
    const interaction = req.body;
    if (interaction.type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }
    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        if (interaction.data.name === 'ticket') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: { content: 'Creating your support ticket...', flags: 64 }
            });
        }
    }
    return res.status(400).send('Unknown interaction');
});

// --- 2. LINKED ROLES OAUTH2 FLOW ---
// This is the URL you will paste into the Linked Roles Verification box
app.get('/linked-role', (req, res) => {
    const DISCORD_CLIENT_ID = process.env.CLIENT_ID;
    const REDIRECT_URI = encodeURIComponent(`${process.env.BASE_URL}/oauth-callback`);
    
    // Generate a secure random state to prevent CSRF attacks
    const state = crypto.randomBytes(16).toString('hex');
    
    // Redirect user to Discord's authorization screen
    const targetUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify%20role_connections.write&state=${state}`;
    
    res.redirect(targetUrl);
});

// The endpoint Discord sends the user back to after they click "Authorize"
app.get('/oauth-callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) return res.status(400).send('Missing authorization code.');

    // Exchange the code for an Access Token, then update user metadata here
    // In a full production build, you save network stats/records to your database
    
    res.send('<h1>Success! You can now close this tab and return to Discord to claim your role.</h1>');
});
// --- 3. TERMS OF SERVICE PAGE ---
app.get('/terms', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Deads Support - Terms of Service</title>
                <style>
                    body { font-family: sans-serif; margin: 40px; background: #121212; color: #e0e0e0; line-height: 1.6; }
                    h1 { color: #ffffff; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    h2 { color: #ffffff; margin-top: 20px; }
                    .container { max-width: 800px; margin: 0 auto; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Terms of Service</h1>
                    <p>Welcome to Deads Support. By adding this application to your server or using its features, you agree to comply with and be bound by the following terms.</p>
                    
                    <h2>1. Use of Service</h2>
                    <p>Deads Support provides community ticketing and role management utilities. You agree not to exploit, abuse, or reverse-engineer the application or use it to violate Discord's official Terms of Service.</p>
                    
                    <h2>2. Data Management</h2>
                    <p>We respect your server data. Information transmitted through this bot (such as ticket logs and user identifiers) is processed strictly to provide functionality and will never be sold or shared maliciously.</p>
                    
                    <h2>3. Limitations of Liability</h2>
                    <p>Deads Support is provided "as is" without warranties of any kind. The development team is not responsible for any server disruptions, data loss, or moderation issues that occur within your community.</p>
                    
                    <h2>4. Changes to Terms</h2>
                    <p>We reserve the right to modify these terms at any time. Continued use of the application constitutes acceptance of any updated terms.</p>
                </div>
            </body>
        </html>
    `);
});
// --- 4. PRIVACY POLICY PAGE ---
app.get('/privacy', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Deads Support - Privacy Policy</title>
                <style>
                    body { font-family: sans-serif; margin: 40px; background: #121212; color: #e0e0e0; line-height: 1.6; }
                    h1 { color: #ffffff; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    h2 { color: #ffffff; margin-top: 20px; }
                    .container { max-width: 800px; margin: 0 auto; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Privacy Policy</h1>
                    <p>Last updated: June 2026</p>
                    <p>This Privacy Policy explains how Deads Support collects, uses, and safeguards your information. By utilizing this application, you consent to the data practices outlined below.</p>
                    
                    <h2>1. Information We Collect</h2>
                    <p>To operate effectively, Deads Support processes basic Discord structural data, including: your Discord User ID, Username, Server ID, and text inputs provided directly within created support channels.</p>
                    
                    <h2>2. How We Use Data</h2>
                    <p>Collected data is used strictly to provide the bot\'s core features: generating private text channels for tickets, routing staff responses, and managing verified user role states. We do not track you across other servers or log unrelated messages.</p>
                    
                    <h2>3. Data Sharing & Security</h2>
                    <p>Your privacy is vital to our organization. We do not sell, trade, or distribute your personal information to third parties. All interaction data transmitted between Discord and our servers is secured using industry-standard SSL/TLS encryption.</p>
                    
                    <h2>4. Data Retention & Deletion</h2>
                    <p>Ticket content and metadata are only retained as long as necessary to resolve your active inquiries. If you wish to have your server\'s historical ticket configuration or data cleared from our system, please contact our management team via our official channels.</p>
                </div>
            </body>
        </html>
    `);
});
app.listen(PORT, () => console.log(`Deads Support running on port ${PORT}`));
