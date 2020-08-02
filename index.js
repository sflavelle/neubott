const Chariot = require('chariot.js');

const token = process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN : null;

// And now for the bot

class Neubott extends Chariot.Client {
    constructor () {
        super(new Chariot.Config(
            token,
            {
                prefix: '//',
                defaultHelpCommand: true,
                primaryColor: 'PURPLE',
                owner: ['49288117307310080', '49345026618036224']
            },
            {
                messageLimit: 60,
                defaultImageFormat: 'png',
                intents: 519
            }
        ));
    }
}

module.exports = new Neubott;