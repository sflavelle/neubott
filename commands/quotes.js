const Chariot = require('chariot.js');
const FS = require("fs");
const flatten = require('array-flatten');
const validURL = require('valid-url');

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
        if (validURL.isUri(args[0])) {
        // if argument is an URL
            try {
                let msglink = new URL(args[0]);
                let msglinkText = msglink.toString();
                if (msglinkText.startsWith('https://discordapp.com/channels/')) {
                    let url = args[0];
                    let array = url.split('/');
                    array = array.slice(4); // get the ID parts

                    message.channel.createMessage(`✅ URL accepted: ${msglinkText}.\nServer ID: ${array[0]}.\nChannel ID: ${array[1]}.\nMessage ID: ${array[2]}.`);
                    
                    let msg = chariot.getMessage(array[1].toString(),array[2].toString()) // Get the message object
                    msg.then((msg) => {
                        Chariot.Logger.event("[QUOTE] Pulled message object");
                        console.log(msg);
                        let timestamp = new Date(msg.timestamp);
                        timestamp = timestamp.toDateString();
                        message.channel.createMessage(`✅ \`Message created. Is this what you were looking for?\`\n"${msg.content}"\n—<@${msg.member.id}> (${timestamp} in <#${msg.channel.id}>)`);
                    });
                } else {throw new Error('WRONGURL')};
            } catch (e) {
                if (e.message === 'WRONGURL') {
                    message.channel.createMessage("❌ That URL doesn't link to a Discord server.");
                } else {message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);};
            };
        } else {
        // if argument is a string
            try {
                let params = args.join(' ').split('" ');
                let quote = params[0].slice(1);
                let author = params[1];

                // processing on the quote text to be safe
                

                message.channel.createMessage(`Test quote: "${quote}"\nTest author: ${author}`);
            } catch (e) {
                message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);
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