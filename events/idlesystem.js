const Chariot = require('chariot.js');
const FS = require("fs");

class IdleSystem extends Chariot.Event {
    /**
     * Instantiating the superclass with the appropriate event name
     */
    constructor() {
        super('messageCreate');
    }
    
    async execute(message) {

        if (!this.client.idle) { this.client.idle = []; }

        function IdleContent(message) {
            let deaths = ( FS.existsSync('./resources/idle/deaths.json') ) ? JSON.parse(FS.readFileSync('./resources/idle/deaths.json', 'utf8')) : null;
            let user = (message.member.nick) ? message.member.nick : message.author.username;
            let server = message.channel.guild.name;


            
            let deathMessage = deaths[Math.floor(Math.random()*deaths.length)];
            // Substitute variable names if necessary
            deathMessage = deathMessage.replace("`user`", user);
            deathMessage = deathMessage.replace("`server`", server);
            deathMessage = deathMessage.replace("`USER`", user.toUpperCase());
            deathMessage = deathMessage.replace("`SERVER`", server.toUpperCase());

            message.channel.createMessage("💀 " + deathMessage);
            Chariot.Logger.event(`[Idle] executed idle routine in ${message.channel.name}`);
        }

        if (!message.author.bot) {
            switch (message.channel.id) {
                case "206734382990360576": // #meep
                case "383151258065698816": // #bott-playground
                    clearTimeout(this.client.idle[message.channel.id]); //I have to clear the timeout, before I set it...
                    Chariot.Logger.event(`[Idle] new message in ${message.channel.name}`);
                    this.client.idle[message.channel.id] = setTimeout(IdleContent, 45*1000, message); //45 minutes
                    break;
                case "538503736423612426": // #splatoon
                default:
                    break;
            }
        }
        
    }
}

module.exports = new IdleSystem(); // Don't let this run for now