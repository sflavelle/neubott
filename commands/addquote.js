const Chariot = require('chariot.js');

class AddQuote extends Chariot.Command {
    constructor() {
        super();

        this.name = 'addquote';
        this.allowDMs = false;
        this.cooldown = 3;
        this.help = {
            message: `Shortcut for //quote add.`,
        }
    }

    async execute(message, args, chariot) {
        const AliasedCommand = this.client.commands.get('quote');
        AliasedCommand.add(message, args, chariot);
    }
}

module.exports = new AddQuote;