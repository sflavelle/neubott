const Chariot = require('chariot.js');
const FS = require("fs");
const flatten = require('array-flatten')

class Quotes extends Chariot.Command {
    constructor() {
        super();

        this.name = 'quote';
        this.admin = true; // while in testing
        this.cooldown = 3;
        this.subcommands = ['test'];
        this.help = {
            message: "Remember quotes your friends said! You can currently save quotes by .",
            usage: 'quote',
            example: ['quote', 'quote add <message id>'],
            inline: true
        }
    }

    /*
    A bit of a description of what the plan is for this module.
    First off, the idea is that quotes can be added three ways:

    1) a Discord message link (https://discordapp.com/channels/124680630075260928/180892750093221888/705905429376401409)
    2) how the Red-DiscordBot 'serverquotes' module works (addquote "quote text" @QuoteAuthor (OR) addquote "quote text" Quote Author)
    3) how the XKCD 'Bucket' IRC bot works (remember QuoteAuthor "partial text match")

    The quotes will either be displayed similar to how Red-DiscordBot does now ("quote text"\n --Quote Author (quote #n)) or using a webhook.

    This is VERY MUCH a work in progress - I'm working on adding via message link first.

    */


    async test(message, args, chariot){ // test command to evaluate what's being passed to it
        try {
            let msglink = new URL(args[0]);
            msglinkText = msglink.toString();
            if (msglinkText.startsWith('https://discordapp.com/channels/')) {
                let msgdata = msglink.pathname;
                // msgdata.shift();

                message.channel.createMessage(`✅ URL accepted: ${msglinkText}. Extracted portion: ${msgdata}`);
            } else {throw new Error('WRONGURL')};
        } catch (e) {
            if (e instanceof TypeError) {
                message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);
            } else if (e.message === 'WRONGURL') {
                message.channel.createMessage("❌ That URL doesn't link to a Discord server.");
            };
        };
        // Chariot.Logger.event("Adding to quotes: args: '" + args.join(' ') + "'");
        // let file = ( FS.existsSync(`./resources/quotes/${message.channel.guild.id}.json`) ) ? JSON.parse(FS.readFileSync(`./resources/quotes/${message.channel.guild.id}.json`, 'utf8')) : new Array(); //Load the file into memory and parse it
    }

    async execute(message, args, chariot) {
        try {
            var file = JSON.parse(FS.readFileSync(`./resources/quotes/${message.channel.guild.id}.json`, 'utf8')); //Load the file into memory and parse it
            flatten(file);
            var response = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
            message.channel.createMessage(":microphone2: " + response); //Print it
        } catch (e) {message.channel.createMessage("❌ There was a problem: `" + e.message + "`");}
    }
}

module.exports = new Quotes;