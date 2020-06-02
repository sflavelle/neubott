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
            switch (Math.floor(Math.random()*5)) {
                case 0: // death messages
                case 1: 
                    var global = JSON.parse(FS.readFileSync('./resources/deaths/global.json', 'utf8')); //Load the file into memory and parse it
                    var local = FS.existsSync(`./resources/deaths/${message.channel.guild.id}.json`) ? JSON.parse(FS.readFileSync(`./resources/deaths/${message.channel.guild.id}.json`, 'utf8')) : new Array();
                    let deaths = global.concat(local);
                    
                    let user = (message.member.nick) ? message.member.nick : message.author.username;
                    let server = message.channel.guild.name;


                    
                    let deathMessage = deaths[Math.floor(Math.random()*deaths.length)];
                    // Substitute variable names if necessary
                    deathMessage = deathMessage.replace(/`user`/g, user);
                    deathMessage = deathMessage.replace(/`server`/g, server);
                    deathMessage = deathMessage.replace(/`USER`/g, user.toUpperCase());
                    deathMessage = deathMessage.replace(/`SERVER`/g, server.toUpperCase());

                    message.channel.createMessage(`🕑💀 ${deathMessage}\n\`//help deaths\``);
                    break;
                case 2: // facts
                    let facts = ( FS.existsSync('./resources/facts.json') ) ? JSON.parse(FS.readFileSync('./resources/facts.json', 'utf8')) : null;
                    let factsMessage = facts[Math.floor(Math.random()*facts.length)];
                    message.channel.createMessage(`🕑🎙 ${factsMessage}\n*Got anymore totally true for-real facts?* \`//help facts\``);
                    break;
                case 3: // quotes
                case 4:
                    var file = JSON.parse(FS.readFileSync(`./resources/quotes/${message.channel.guild.id}.json`, 'utf8')); //Load the file into memory and parse it
                    var rquote = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
                    if (rquote.author_id) {if (!message.channel.guild.members.find(m => m.id === rquote.author_id)) {message.channel.guild.fetchAllMembers();}}
                    if (rquote.timestamp == null) { rquote.timestamp = `Octember 32, ${new Date().getFullYear()}` } //for old imported quotes
                    else {
                        let tsFormat = new Intl.DateTimeFormat('en-us', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })
                        rquote.timestamp = new Date(rquote.timestamp);
                        rquote.timestamp = tsFormat.format(rquote.timestamp);
                    }
                    let output = {
                        "content" : `"${rquote.quote}"\n—*${rquote.author_id ? (message.channel.guild.members.find(m => m.id === rquote.author_id) ? "<@" + rquote.author_id + ">" : rquote.author) : rquote.author} / ${rquote.timestamp} [#${file.indexOf(rquote)+1}/${file.length}]*`,
                        "allowedMentions" : [{ "everyone" : false, "users": false}]
                    };
                    message.channel.createMessage(output); //Print it
                    break;
                default:
                    break;
            };
            Chariot.Logger.event(`[Idle] executed idle routine in ${message.channel.name}`);
        };

        function IdleSplatoon(message) {
            switch (Math.floor(Math.random()*2)) {
                case 0: // #splatoon gimme squids
                    if (message.channel.name === 'splatoon') {
                        let AliasedCommand = this.client.commands.get('gimmesquids');
                        AliasedCommand.execute(message, args, chariot);
                        break;
                    };
                case 1: // #splatoon current schedule
                let splat = ( FS.existsSync('./resources/splat.json') ) ? JSON.parse(FS.readFileSync('./resources/splat.json', 'utf8')) : null;
                let splatMessage = splat[Math.floor(Math.random()*splat.length)];
                message.channel.createMessage(`🕑🎙 ${splatMessage}\n*You can add more of these images with* \`//help squids\``);
                break;
                default:
                    break;
            };
            Chariot.Logger.event(`[Idle] executed idle routine in ${message.channel.name}`);
        }

        if (!message.author.bot && !message.content.startsWith(this.client.prefix)) {
            switch (message.channel.id) {
                case "206734382990360576": // Neutopia #meep
                    clearTimeout(this.client.idle["206734382990360576"]); //I have to clear the timeout, before I set it...
                    // Chariot.Logger.event(`[Idle] new message in ${message.channel.name}`);
                    this.client.idle["206734382990360576"] = setTimeout(IdleContent, 6*60*60*1000, message); //6 hours
                    break;
                case "383151258065698816": // Neutopia #bott-playground
                    clearTimeout(this.client.idle["383151258065698816"]);
                    // Chariot.Logger.event(`[Idle] new message in ${message.channel.name}`);
                    this.client.idle["383151258065698816"] = setTimeout(IdleContent, 45*60*1000, message); //45 minutes
                    break;
                case "538503736423612426": // Neutopia #splatoon
                    clearTimeout(this.client.idle["538503736423612426"]);
                    // Chariot.Logger.event(`[Idle] new message in ${message.channel.name}`);
                    this.client.idle["538503736423612426"] = setTimeout(IdleSplatoon, 6*60*60*1000, message); //6 hours
                    break;
                case "705685455143829574": // Neubott Development #testing
                    clearTimeout(this.client.idle["705685455143829574"]); //I have to clear the timeout, before I set it...
                    // Chariot.Logger.event(`[Idle] new message in ${message.channel.name}`);
                    this.client.idle["705685455143829574"] = setTimeout(IdleContent, 6*60*60*1000, message); //6 hours
                    break;
                case "124680630075260928": //General Chat #general
                    clearTimeout(this.client.idle["124680630075260928"]); //I have to clear the timeout, before I set it...
                    // Chariot.Logger.event(`[Idle] new message in ${message.channel.name}`);
                    this.client.idle["124680630075260928"] = setTimeout(IdleContent, 6*60*60*1000, message); //6 hours
                    break;
                case "220390355487424512": //General Chat #botworkshop
                    clearTimeout(this.client.idle["220390355487424512"]); //I have to clear the timeout, before I set it...
                    // Chariot.Logger.event(`[Idle] new message in ${message.channel.name}`);
                    this.client.idle["220390355487424512"] = setTimeout(IdleContent, 45*60*1000, message); //45 minutes
                    break;
                default:
                    break;
            }
        }
        
    }
}

module.exports = new IdleSystem();