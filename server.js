const express = require('express');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');

const app = express();
const PORT = process.env.PORT || 3000;

app.post('/interactions', verifyKeyMiddleware(process.env.CLIENT_PUBLIC_KEY), (req, res) => {
    const interaction = req.body;

    if (interaction.type === InteractionType.PING) {
        return res.send({
            type: InteractionResponseType.PONG,
        });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
        const { name } = interaction.data;

        if (name === 'ticket') {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: 'Creating your support ticket...',
                    flags: 64 
                },
            });
        }
    }

    return res.status(400).send('Unknown interaction type');
});

app.listen(PORT, () => {
    console.log(`Deads Support listening on port ${PORT}`);
});
