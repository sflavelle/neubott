const Chariot = require('chariot.js');

class CommandAliases extends Chariot.Event {
    /**
     * Instantiating the superclass with the appropriate event name
     */
    constructor() {
        super('messageCreate');
    }

    async execute(message, args, chariot) {
        if (message.author.id === '349097407998459916') {// Telegram Bot
            if (message.content.search(/\ngimme squids$/i) != -1 || message.content.search(/\n🦑 ?📷$/) != -1) {
                const AliasedCommand = this.client.commands.get('gimmesquids');
                AliasedCommand.execute(message, args, chariot);
            } 
    
            if (message.content.search(/\nwhat (else )?did I miss\??$/i) != -1 || message.content.includes('what I missed')) {
                const AliasedCommand = this.client.commands.get('whatdidimiss');
                AliasedCommand.execute(message, args, chariot);
            } 
    
            if (message.content.search(/\n(bott? ?|bucket |neubott )?facts$/i) != -1) {
                const AliasedCommand = this.client.commands.get('facts');
                AliasedCommand.execute(message, args, chariot);
            } 
            return;
        }

        // For everyone else

        if (message.content.search(/^gimme (\w+)$/i) != -1 || message.content.search(/^🦑 ?📷( ?\w+)?$/) != -1) {
            if (message.content.search(/^gimme squids$/i) != -1 || message.content.search(/^🦑 ?📷$/) != -1) //test again for regular command
            {
                const AliasedCommand = this.client.commands.get('gimmesquids');
                AliasedCommand.execute(message, chariot);
            }
            else
            {
                // nothing yet
            }
        } 

        if (message.content.search(/^what (else )?did I miss\??$/i) != -1 || message.content.includes('what I missed')) {
            const AliasedCommand = this.client.commands.get('whatdidimiss');
            AliasedCommand.execute(message, args, chariot);
        } 

        if (message.content.search(/^(bott? ?|bucket |neubott )?facts$/i) != -1) {
            const AliasedCommand = this.client.commands.get('facts');
            AliasedCommand.execute(message, args, chariot);
        } 
    }
}

module.exports = new CommandAliases();