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
        this.subcommands = ['test', 'add', 'undo'];
        this.help = {
            message: "Remember quotes your friends said! You can currently save quotes by .",
            usage: 'quote',
            example: ['quote', 'quote add <message id>'],
            inline: true
        }

        FS.stat('./resources/quotes/', function(err) {
            if (!err) { return }
            else if (err.code === 'ENOENT') {FS.mkdir('./resources/quotes/', (err) => {
                if (err) throw err;})};
        })
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
        let quote;
        let author;
        let authorid;
        let timestamp;

        if (validURL.isUri(args[0])) {
        // if argument is an URL
            try {
                let msglink = new URL(args[0]);
                let msglinkText = msglink.toString();
                if (msglinkText.startsWith('https://discordapp.com/channels/')) {
                    let url = args[0];
                    let array = url.split('/');
                    array = array.slice(4); // get the ID parts

                    // message.channel.createMessage(`✅ URL accepted: ${msglinkText}.\nServer ID: ${array[0]}.\nChannel ID: ${array[1]}.\nMessage ID: ${array[2]}.`);
                    
                    let msg = chariot.getMessage(array[1].toString(),array[2].toString()) // Get the message object
                    msg.then((msg) => {
                        Chariot.Logger.event("[QUOTE] Pulled message object");
                        // console.log(msg);
                        quote = msg.content;
                        author = msg.member.nick ? msg.member.nick : msg.author.username;
                        timestamp = new Date(msg.timestamp);
                        authorid = msg.member ? msg.member.id : msg.author.id;
                    });
                    await msg;
                } else {throw new Error('WRONGURL')};
            } catch (e) {
                if (e.message === 'WRONGURL') {
                    message.channel.createMessage("❌ That URL doesn't link to a Discord server.");
                } else {message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);};
            };
        } else {
        // if argument is a string
            try {
                if (!args.join(' ').match(/^"(.+)" (.+)$/)) { message.channel.createMessage(`❌ That's not in a format I can use.\nTry: \`"Your quote" Author\``); return null;}
                let params = args.join(' ').match(/^"(.+)" (.+)$/);
                quote = params[1];
                author = params[2].match(/^<@(\d+)>/) ? params[2].match(/^<@(\d+)>/)[1] : params[2] ;
                authorid = params[2].match(/^<@(\d+)>/) ? params[2].match(/^<@(\d+)>/)[1] : null ;
                timestamp = new Date();
            } catch (e) {
                message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);
            };
        };
        try { // construct the message
            let tsFormat = new Intl.DateTimeFormat('en-us', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })
            timestamp = tsFormat.format(timestamp);
            // processing on the quote text to be safe
            
            let embed = {
                "title" : "Quote generated",
                "color" : 0x00ff00,
                "description": `"${quote}"\n—*${authorid ? "<@" + authorid + ">" : author} / ${timestamp} [#xxx]*`
            }
    
            let output = {
                "content" : `✅ \`Message created. Is this what you were looking for?`,
                "embed" : embed,
                "allowedMentions" : [{ "everyone" : false, "users": false}]
            };
            message.channel.createMessage(output);

        } catch (e) {
                message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);
            };
        // Chariot.Logger.event("Adding to quotes: args: '" + args.join(' ') + "'");
    }

    async add(message, args, chariot) {
        let quote;
        let author;
        let authorid;
        let timestamp;

        if (validURL.isUri(args[0])) {
        // if argument is an URL
            try {
                let msglink = new URL(args[0]);
                let msglinkText = msglink.toString();
                if (msglinkText.startsWith('https://discordapp.com/channels/')) {
                    let url = args[0];
                    let array = url.split('/');
                    array = array.slice(4); // get the ID parts

                    let msg = chariot.getMessage(array[1].toString(),array[2].toString()) // Get the message object
                    msg.then((msg) => {
                        Chariot.Logger.event("[QUOTE] Pulled message object");
                        // console.log(msg);
                        quote = msg.content;
                        author = msg.member ? msg.member.nick : msg.author.username;
                        timestamp = new Date(msg.timestamp);
                        authorid = msg.member ? msg.member.id : msg.author.id;
                    });
                    await msg;
                } else {throw new Error('WRONGURL')};
            } catch (e) {
                if (e.message === 'WRONGURL') {
                    message.channel.createMessage("❌ That URL doesn't link to a Discord server.");
                } else {message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);};
            };
        } else {
        // if argument is a string
            try {
                if (!args.join(' ').match(/^"(.+)" (.+)$/)) { message.channel.createMessage(`❌ That's not in a format I can use.\nTry: \`"Your quote" Author\``); return null;}
                let params = args.join(' ').match(/^"(.+)" (.+)$/);
                message.channel.guild.fetchAllMembers();
                quote = params[1];
                author = params[2].match(/^<@(\d+)>/) ? message.channel.guild.members.find(m => m.id == params[2].match(/^<@(\d+)>/)[1]).username : params[2] ;
                authorid = params[2].match(/^<@(\d+)>/) ? params[2].match(/^<@(\d+)>/)[1] : null ;
                timestamp = new Date();
            } catch (e) {
                message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);
            };
        };

        // Time to put this in a file
        let file = ( FS.existsSync(`./resources/quotes/${message.channel.guild.id}.json`) ) ? JSON.parse(FS.readFileSync(`./resources/quotes/${message.channel.guild.id}.json`, 'utf8')) : new Array(); //Load the file into memory and parse it
        let quoteObj = {
            "quote" : quote,
            "author" : author,
            "author_id" : authorid,
            "timestamp" : timestamp.valueOf()
        }
        try {
            file.push(quoteObj);
            FS.writeFileSync(`./resources/quotes/${message.channel.guild.id}.json`, JSON.stringify(file, null, 2), function (err) {
                if (err) { Chariot.Logger.error('Write failed',`Could not write to /resources/quotes/${message.channel.guild.id}.json`) }
            });
            try { // construct the message
                let tsFormat = new Intl.DateTimeFormat('en-us', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                })
                timestamp = tsFormat.format(timestamp);
                
                let embed = {
                    "title" : "Quote added successfully",
                    "color" : 0x00ff00,
                    "description": `"${quote}"\n—*${authorid ? "<@" + authorid + ">" : author} / ${timestamp} [#${file.length}]*`
                }
        
                let output = {
                    "content" : '',
                    "embed" : embed
                    // "allowedMentions" : [{ "everyone" : false, "users": [authorid]}]
                };
                message.channel.createMessage(output);
    
            } catch (e) {
                    message.channel.createMessage(`⁉ I saved your quote, but had some trouble getting back to you...\n**${e.name}**: ${e.message}`);
                };
        } catch (e) {
            message.channel.createMessage(`❌ I couldn't save that...\n**${e.name}**: ${e.message}`);
        }
    }

    async undo(message, args, chariot) {
        let file = ( FS.existsSync(`./resources/quotes/${message.channel.guild.id}.json`) ) ? JSON.parse(FS.readFileSync(`./resources/quotes/${message.channel.guild.id}.json`, 'utf8')) : new Array(); //Load the file into memory and parse it

        let tsFormat = new Intl.DateTimeFormat('en-us', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })

        let undid = file.pop();
        FS.writeFileSync(`./resources/quotes/${message.channel.guild.id}.json`, JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed',`Could not write to /resources/quotes/${message.channel.guild.id}.json`) }
        });

        undid.timestamp = tsFormat.format(undid.timestamp);
        let embed = {
            "title" : "Latest quote was deleted (shown below)",
            "color" : 0xffff00,
            "description": `"${undid.quote}"\n—*${undid.author_id ? "<@" + undid.author_id + ">" : undid.author} / ${undid.timestamp} [#${file.length+1}]*`
        }

        let output = {
            "content" : '',
            "embed" : embed,
            "allowedMentions" : [{ "everyone" : false, "users": false}]
        };
        message.channel.createMessage(output);
    }


    async execute(message, args, chariot) {
        try {
            var file = JSON.parse(FS.readFileSync(`./resources/quotes/${message.channel.guild.id}.json`, 'utf8')); //Load the file into memory and parse it
            var rquote = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
            if (rquote.timestamp == null) { rquote.timestamp = "Long Ago" } else {
                let tsFormat = new Intl.DateTimeFormat('en-us', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                })
                rquote.timestamp = new Date(rquote.timestamp);
                rquote.timestamp = tsFormat.format(rquote.timestamp);
            }

            let output = {
                "content" : `"${rquote.quote}"\n—*${rquote.author_id ? "<@" + rquote.author_id + ">" : rquote.author} / ${rquote.timestamp} [#${file.indexOf(rquote)+1}]*`,
                "allowedMentions" : [{ "everyone" : false, "users": false}]
            };
            message.channel.createMessage(output); //Print it
        } catch (e) {message.channel.createMessage("❌ There was a problem: `" + e.message + "`");}
    }
}

module.exports = new Quotes;