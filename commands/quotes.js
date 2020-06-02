const Chariot = require('chariot.js');
const FS = require("fs");
const flatten = require('array-flatten');
const validURL = require('valid-url');
const moment = require('moment');

class Quotes extends Chariot.Command {
    constructor() {
        super();

        this.name = 'quote';
        this.cooldown = 2;
        this.subcommands = ['test', 'add', 'undo', 'delete', 'set'];
        this.aliases = ['quotes', 'fuck']
        this.help = {
            message: `You said it. We quoted it.
            
           \`quote\` on its own retrieves a random quote.
           \`quote me\` retrieves one of *your* quotes, if you've got one.
           \`quote @someone\` retrieves their quotes.
           *(Quoting someone without mentioning them is being worked on.)*
           \`quote 3\` retrieves quote 3.
           
           You can add a quote in one of two ways:
           Sending me a message link: \`quote add https://discordapp.com/channels/...\`
           Or with text: \`quote add "This is the quote" @someone\`
           If you fucked up a new quote, fix it quickly with \`quote undo\`.
           If you're not sure a quote will work, test it with \`quote test\`.`,
            usage: 'quote',
            example: ['quote', 'quote undo', 'quote delete #'],
            inline: true
        }

        FS.stat('./resources/quotes/', function(err) {
            if (!err) { return }
            else if (err.code === 'ENOENT') {FS.mkdir('./resources/quotes/', (err) => {
                if (err) throw err;})};
        })
    }

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
                if (msglinkText.startsWith('https://discordapp.com/channels/') || msglinkText.startsWith('https://canary.discordapp.com/channels/') || msglinkText.startsWith('https://ptb.discordapp.com/channels/')) {
                    let url = args[0];
                    let array = url.split('/');
                    array = array.slice(4); // get the ID parts

                    // message.channel.createMessage(`✅ URL accepted: ${msglinkText}.\nServer ID: ${array[0]}.\nChannel ID: ${array[1]}.\nMessage ID: ${array[2]}.`);
                    
                    let msg = chariot.getMessage(array[1].toString(),array[2].toString()); // Get the message object
                    if (msg == undefined) {
                        if (!this.client.guilds.filter(g => g.id === array[0].toString())) { throw new Error("That's a correct URL, but it links to a server I can't see.");}
                        else if (!this.client.guilds.filter(g => g.id === array[0].toString()).channels.filter(c => c.id === array[1].toString())) { throw new Error("That's a correct URL, but it links to a channel that I either can't see, or that doesn't exist."); }
                        else { throw new Error("I'm not sure that message exists."); return null; }
                    }
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
                } else if (e.name === "DiscordRESTError [50001]") {message.channel.createMessage(`❌ I don't have access to that message. It may be in a server or channel I don't see.`);}
                else {message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);};
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
        if (quote == undefined) {return null;};
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
                if (msglinkText.startsWith('https://discordapp.com/channels/') || msglinkText.startsWith('https://canary.discordapp.com/channels/') || msglinkText.startsWith('https://ptb.discordapp.com/channels/')) {
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
                } else if (e.name === "DiscordRESTError [50001]") {message.channel.createMessage(`❌ I don't have access to that message. It may be in a server or channel I don't see.`);}
                else {message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);};
            };
        } else {
        // if argument is a string
            try {
                if (!args.join(' ').match(/^"(.+)" (.+)$/)) { message.channel.createMessage(`❌ That's not in a format I can use.\nTry: \`"Your quote" Author\``); return null;}
                let params = args.join(' ').match(/^"(.+)" (.+)$/);
                message.channel.guild.fetchAllMembers();
                quote = params[1];
                author = params[2].match(/^<@!?(\d+)>/) ? message.channel.guild.members.find(m => m.id == params[2].match(/^<@!?(\d+)>/)[1]).username : params[2] ;
                authorid = params[2].match(/^<@!?(\d+)>/) ? params[2].match(/^<@!?(\d+)>/)[1] : null ;
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

    async delete(message, args, chariot) {
        let file = ( FS.existsSync(`./resources/quotes/${message.channel.guild.id}.json`) ) ? JSON.parse(FS.readFileSync(`./resources/quotes/${message.channel.guild.id}.json`, 'utf8')) : new Array(); //Load the file into memory and parse it

        let i = Number.parseInt(args[0].match(/^(\d+)$/))-1;


        let deleted = file.splice(i, 1)[0];
        FS.writeFileSync(`./resources/quotes/${message.channel.guild.id}.json`, JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed',`Could not write to /resources/quotes/${message.channel.guild.id}.json`) }
        });

        if (deleted.timestamp == null) { deleted.timestamp = "in the Before Times" } //for old imported quotes
        else {
            let tsFormat = new Intl.DateTimeFormat('en-us', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })
            deleted.timestamp = new Date(deleted.timestamp);
            deleted.timestamp = tsFormat.format(deleted.timestamp);
        }
        let embed = {
            "title" : "Quote deleted (shown below)",
            "color" : 0xffff00,
            "description": `"${deleted.quote}"\n—*${deleted.author_id ? "<@" + deleted.author_id + ">" : deleted.author} / ${deleted.timestamp} [#${i+1}]*`
        }

        let output = {
            "content" : '',
            "embed" : embed,
            "allowedMentions" : [{ "everyone" : false, "users": false}]
        };
        message.channel.createMessage(output);
    }

    async set(message, args, chariot) {

        if (args.length === 0) {
            let embed = {
                "title" : "Quote Settings",
                "color" : 0xffff00,
                "description": `\`quote set <cmd> <id>\`
                Here are the things you can do with \`set\`:
                
                - \`ts\` Replace the timestamp of an existing quote with one from a message.`
            }
    
            let output = {
                "content" : '',
                "embed" : embed,
            };
            message.channel.createMessage(output);
            return;
        }
        let i;
        let url;
        let msg;
        let oldTS;
        let newTS;
        let file = ( FS.existsSync(`./resources/quotes/${message.channel.guild.id}.json`) ) ? JSON.parse(FS.readFileSync(`./resources/quotes/${message.channel.guild.id}.json`, 'utf8')) : new Array(); //Load the file into memory and parse it

        if (args[0] === "ts") {
            if (args.length == 1) {
                message.channel.createMessage("ℹ \`//quote set ts <quote id> <discord message URL>\`");
                file = file.filter(q => q.timestamp === null);
                message.channel.createMessage(`If you'd like to help, I have about **${file.length}** quotes that don't have any timestamp...`);
                return null;
            }
            else if (args.length >= 3 && Number.parseInt(args[1].match(/^(\d+)$/))) {
                i = Number.parseInt(args[1].match(/^(\d+)$/))-1;
                try {oldTS = file[i-1].timestamp;} catch (e) { if (!file[i-1]) {message.channel.createMessage(`❌ I only have ${file.length} quotes.`)};} 

                try {
                    if (args[2].startsWith('https://discordapp.com/channels/') || args[2].startsWith('https://canary.discordapp.com/channels/') || args[2].startsWith('https://ptb.discordapp.com/channels/')) {
                        url = args[2];

                        let array = url.split('/');
                        array = array.slice(4); // get the ID parts

                        msg = await chariot.getMessage(array[1].toString(),array[2].toString()); // Get the message object
                        if (msg == undefined) {
                            if (!this.client.guilds.filter(g => g.id === array[0].toString())) { throw new Error("That's a correct URL, but it links to a server I can't see.");}
                            else if (!this.client.guilds.filter(g => g.id === array[0].toString()).channels.filter(c => c.id === array[1].toString())) { throw new Error("That's a correct URL, but it links to a channel that I either can't see, or that doesn't exist."); }
                            else { throw new Error("I'm not sure that message exists."); return null; }
                        }

                        file[i].timestamp = new Date(msg.timestamp).valueOf();
                        newTS = new Date(msg.timestamp).valueOf();
                    } else if (args[2].startsWith('http')) {throw new Error("WRONGURL")}
                    else if (moment(args.slice(2).join(' '))){
                        try {
                            let ts = moment(args.slice(2).join(' '), ["MMMM D, YYYY", "MMM D, YYYY", "MMMM DD, YYYY", "MMM DD, YYYY"]);
                            file[i].timestamp = ts.valueOf();
                            newTS = ts.valueOf();
                        } catch (e) {throw new Error("Pass me a valid date.")}
                        
                    } else {throw new Error("Pass me a valid date.")}
                    

                    FS.writeFileSync(`./resources/quotes/${message.channel.guild.id}.json`, JSON.stringify(file, null, 2), function (err) {
                        if (err) { Chariot.Logger.error('Write failed',`Could not write to /resources/quotes/${message.channel.guild.id}.json`) }
                    });
                    try { // construct the message
                        let tsFormat;
                        try {
                            tsFormat = new Intl.DateTimeFormat('en-us', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                            })
                            oldTS = tsFormat.format(oldTS);
                        } catch (e) {
                            if (oldTS == null) { oldTS = `Octember 32, ${new Date().getFullYear()}` } //for old imported quotes
                            else {message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);}
                        }
                        
                        newTS = tsFormat.format(newTS);

                        let embed = {
                            "title" : "Quote modified successfully",
                            "color" : 0xffff00,
                            "description": `"${file[i].quote}"\n—*${file[i].authorid ? "<@" + file[i].authorid + ">" : file[i].author} / ~~${oldTS}~~ ${newTS} [#${i+1}]*`
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
                    if (e.message === 'WRONGURL') {
                        message.channel.createMessage("❌ That URL doesn't link to a Discord server.");
                    } else if (e.name === "DiscordRESTError [50001]") {message.channel.createMessage(`❌ I don't have access to that message. It may be in a server or channel I don't see.`);}
                    else {message.channel.createMessage(`❌ **${e.name}**: ${e.message}`);};
                };
            }
        }
    }    

    async execute(message, args, chariot) {
        try {
            var file = JSON.parse(FS.readFileSync(`./resources/quotes/${message.channel.guild.id}.json`, 'utf8')); //Load the file into memory and parse it
            let filtered;
            let searchString = args.join(' ');
            if (args.length === 0 | args == null) { // get everything
                var rquote = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
            }
            else if (args[0] === "me") { // Get only "my" quotes
                filtered = file.filter(q => q.author_id === message.author.id);
                if (filtered.length === 0) {message.channel.createMessage("❌ You don't have any quotes!"); return null};
                var rquote = filtered[Math.floor(Math.random()*filtered.length)]; //RNG
            } 
            else if (args.join(' ').match(/^(\d+)$/)) { // Get this quote number
                let i = Number.parseInt(args[0].match(/^(\d+)$/));
                try {var rquote = file[i-1];} catch (e) {message.channel.createMessage(`❌ I only have ${file.length} quotes.`);}
            }
            else if (args.join(' ').match(/^<@(\d+)>/)) { // Get only "this user"'s quotes
                await message.channel.guild.fetchAllMembers();
                filtered = file.filter(q => q.author_id === args.join(' ').match(/^<@(\d+)>/)[1].toString());
                if (filtered.length === 0) {message.channel.createMessage("❌ They don't have any quotes!"); return null};
                var rquote = filtered[Math.floor(Math.random()*filtered.length)]; //RNG
            } 
            else if (message.channel.guild.members.filter(m => m.username.includes(searchString)) || message.channel.guild.members.filter(m => m.nick.includes(searchString))) { // Same as above, but with names
                await message.channel.guild.fetchAllMembers();
                filtered = (function() {
                    let result;
                    if (message.channel.guild.members.filter(m => m.username.includes(searchString))) {result = file.filter(q => q.author_id === message.channel.guild.members.find(m => m.username.includes(searchString).id)); return result;}
                    else if (message.channel.guild.members.filter(m => m.nick.includes(searchString))) {result = file.filter(q => q.author_id === message.channel.guild.members.find(m => m.nick.includes(searchString).id)); return result;}
                    else return [];
                })();
                if (filtered.length === 0) {message.channel.createMessage("❌ They don't have any quotes!"); return null};
                var rquote = filtered[Math.floor(Math.random()*filtered.length)]; //RNG
            }  
            else if (file.filter(q => q.author_id === null && q.author.includes(searchString)) != -1) { // Same as above, but with names
                filtered = (function() {
                    let result;
                    if (file.filter(q => q.author.includes(searchString))) {result = file.filter(q => q.author.includes(searchString)); return result;}
                    else return [];
                })();
                if (filtered.length === 0) {message.channel.createMessage("❌ They don't have any quotes!"); return null};
                var rquote = filtered[Math.floor(Math.random()*filtered.length)]; //RNG
            }

            if (rquote.author_id) {if (!message.channel.guild.members.find(m => m.id === rquote.author_id)) {await message.channel.guild.fetchAllMembers();}}
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
        } catch (e) {message.channel.createMessage(`❌ There was a problem: \`${e.message}\``);}
    }
}

module.exports = new Quotes;