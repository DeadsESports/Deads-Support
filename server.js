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

app.listen(PORT, () => console.log(`Deads Support running on port ${PORT}`));
