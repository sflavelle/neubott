const Chariot = require('chariot.js');
const FS = require("fs");

class IdleSystem extends Chariot.Event {
    /**
     * Instantiating the superclass with the appropriate event name
     */
    constructor() {
        super('messageCreate');
        Chariot.Logger.event(`[Idle] system loaded`);
        Chariot.Logger.event(`[Idle] modules: deaths, facts`);
    }
    
    async execute(message) {

        if (!this.client.idle) { this.client.idle = []; }

        function IdleContent(message) {
            switch (Math.floor(Math.random()*4)) {
                case 2: // #splatoon gimme squids
                    if (message.channel.name === 'splatoon') {
                        let AliasedCommand = this.client.commands.get('gimmesquids');
                        AliasedCommand.execute(message, args, chariot);
                        break;
                    };
                case 0: // death messages
                    let deaths = ( FS.existsSync('./resources/idle/deaths.json') ) ? JSON.parse(FS.readFileSync('./resources/idle/deaths.json', 'utf8')) : null;
                    let user = (message.member.nick) ? message.member.nick : message.author.username;
                    let server = message.channel.guild.name;


                    
                    let deathMessage = deaths[Math.floor(Math.random()*deaths.length)];
                    // Substitute variable names if necessary
                    deathMessage = deathMessage.replace("`user`", user);
                    deathMessage = deathMessage.replace("`server`", server);
                    deathMessage = deathMessage.replace("`USER`", user.toUpperCase());
                    deathMessage = deathMessage.replace("`SERVER`", server.toUpperCase());

                    message.channel.createMessage(`🕑💀 ${deathMessage}\n*You can add more of these messages with* \`${this.client.prefix}help deaths\``);
                    break;
                case 3: // #splatoon current schedule
                    if (message.channel.name === 'splatoon') {
                        let AliasedCommand = this.client.commands.get('splatoon');
                        AliasedCommand.execute(message, args, chariot);
                        break;
                    };
                case 1: // facts
                    let facts = ( FS.existsSync('./resources/facts.json') ) ? JSON.parse(FS.readFileSync('./resources/facts.json', 'utf8')) : null;
                    let factsMessage = facts[Math.floor(Math.random()*facts.length)];
                    message.channel.createMessage(`🕑🎙 ${factsMessage}\n*You can add more of these messages with* \`${this.client.prefix}help facts\``);
                    break;
                default:
                    break;
            };
            Chariot.Logger.event(`[Idle] executed idle routine in ${message.channel.name}`);
        }

        if (!message.author.bot && !message.content.startsWith(this.client.prefix)) {
            switch (message.channel.id) {
                case "206734382990360576": // #meep
                    clearTimeout(this.client.idle["206734382990360576"]); //I have to clear the timeout, before I set it...
                    // Chariot.Logger.event(`[Idle] new message in ${message.channel.name}`);
                    this.client.idle["206734382990360576"] = setTimeout(IdleContent, 6*60*60*1000, message); //6 hours
                    break;
                case "383151258065698816": // #bott-playground
                    clearTimeout(this.client.idle["383151258065698816"]);
                    // Chariot.Logger.event(`[Idle] new message in ${message.channel.name}`);
                    this.client.idle["383151258065698816"] = setTimeout(IdleContent, 45*60*1000, message); //45 minutes
                    break;
                case "538503736423612426": // #splatoon
                    clearTimeout(this.client.idle["538503736423612426"]);
                    // Chariot.Logger.event(`[Idle] new message in ${message.channel.name}`);
                    this.client.idle["538503736423612426"] = setTimeout(IdleContent, 6*60*60*1000, message); //6 hours
                    break;
                default:
                    break;
            }
        }
        
    }
}

module.exports = new IdleSystem();