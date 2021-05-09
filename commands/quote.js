const { Sequelize, Op } = require('sequelize');
const moment = require('moment');
const Discord = require('discord.js');


const sql = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    // logging: console.log,
    logging: false,
    storage: './data/quotes.sqlite'
});

/*
    QUOTES TODO

    - Change !all
        Should look only at servers that the user calling the command is in
        (Unless the owner is calling it?)
    - //quote set
        what to set? timestamp, authorid, msgid?
*/

const quotes = sql.define('quotes', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    content: Sequelize.TEXT,
    authorID: Sequelize.STRING,
    authorName: Sequelize.STRING,
    addedBy: Sequelize.STRING,
    guild: Sequelize.STRING,
    msgID: {
        type: Sequelize.STRING,
        allowNull: true
    },
    timestamp: {
        type: Sequelize.INTEGER,
        defaultValue: 0    }
    });
    
    const { success, error } = require('../config.json').emoji;
    
    module.exports = {
        name: 'quote',
        aliases: ['quotes', 'fuck'],
        guildOnly: true,
        // readOnly: true,
        help: {
            visible: true,
            short: `Let's get that on the record`,
            long: `
            You said it. We quoted it.
            
            **GETTING QUOTES**
            \`quote\` on its own retrieves a random quote.
            \`quote me\` retrieves one of *your* quotes, if you've got one.
         
            **ADDING QUOTES**
            \`quote add https://discordapp.com/channels/...\`
            \`quote add "This is the quote" @someone\`
            \`quote remember <author> <message search>\`
            
            **MODIFIERS**
            Adding modifiers change how quotes are selected. They should work with each other.
            \`a number\` - quote ID eg. \`quote 20\`.
            \`!guild <guild id>\` - search a guild's quotes
            \`!guild all\` - search all guilds you and the bot are both in.
            \`!search <keyword>\` - search by keyword. **One word only.**

            **COMMANDS**
            \`?delete\` or \`//delquote\` - delete the quote
            `,
        usage: [ 'quote', 'quote me', 'addquote', 'delquote', 'remember' ]
    },
    async ready(client) {
            client.quotes = quotes;
            client.quotes.sync();
    },
    format(message, quote, qid, qlength){
        // This is the format that the quotes in other commands will use
        const { content, authorID, authorName, timestamp } = quote;

        // Get timestamp format
        const timestampFormat = new Intl.DateTimeFormat('en-us', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        let authorCheck;
        try { authorCheck = message.guild.member(authorID) } catch (e) { authorCheck = false; }

        // QUOTE PARAMETERS
        // 
        // CONTENT = quote msg
        // authorID = quote author's ID
        // authorName = quote author's name (in case user no longer exists)
        // timestamp = timestamp of the created message
        let quotemsg = `"${content}"\n—*${(authorCheck !== null) ? `<@${authorID}>` : authorName} / ${timestamp ? timestampFormat.format(timestamp) : "Octember 32, 2020"}*`
        if (qid) {
            quotemsg += ` [#${qid}]`;
            if (qlength) {
                quotemsg = quotemsg.replace(/]$/g,`/${qlength}]`);
            }
        }
        return quotemsg;
    },
    async parse(message, args) {
        // Determine the format of the quote, and extract/return the relevant details

        // First, check if the first argument is an URL, and process that
        const DiscordRegex = new RegExp(/(|canary\.|ptb\.)discord(app)?\.com\/channels/i);
        const QuoteRegex = new RegExp(/"(.+)" (.+)$/s);
        if (typeof args == 'object' && args.content) {
            return {
                content: args.content,
                authorID: args.author.id,
                authorName: args.member ? args.member.nickname : args.author.username,
                addedBy: message.author.id,
                guild: args.channel.guild.id,
                msgID: args.id,
                timestamp: args.createdTimestamp
            };
	    }
        else if (args[0].match(DiscordRegex)) {
            // Successful channel match
            let [guildID, channelID, msgID] = args[0].split('/').slice(4);
            console.log(`[${this.name}] parsing message URL for guild ${guildID}, channel ${channelID}, msg ${msgID}`);
            
            let channel = message.client.channels.cache.get(channelID);
            return channel.messages.fetch(msgID).then((quotemsg) => {
                console.log(`[${this.name}] fetched message?`);
                if (quotemsg.id) {
                    // We got the linked message, now return the quote object
                    console.log(`[${this.name}] fetched message ${quotemsg.id} from ${quotemsg.author.username}!`);

                    // If the message content starts with a mention, strip it
                    if (quotemsg.content.startsWith('<@')) {quotemsg.content = quotemsg.content.replace(/<@!?(\d+)>/, '').trim()};
                    // console.log(quotemsg);
                    return {
                        content: quotemsg.content,
                        authorID: quotemsg.author.id,
                        authorName: quotemsg.member.nickname ? quotemsg.member.nickname : quotemsg.author.username,
                        addedBy: message.author.id,
                        guild: quotemsg.channel.guild.id,
                        msgID: quotemsg.id,
                        timestamp: quotemsg.createdTimestamp
                    };
                }
    
            })
            .catch((e) => {return "COULDNTGET"});

        }
        else if (args[0].match(/^https?:\/\//i)) {
            // Matches an URL, but not a supported one
            return "WRONGURL";
        }
        else if (message.content.match(QuoteRegex)) {
            // Matches the quote string format
            
            let [, content, authorName] = message.content.match(QuoteRegex);
            let authorID;

            if (authorName.match(/^<@!?(\d+)>/)) {
                //if supplied name is a mention, parse it
                authorID = authorName.match(/^<@!?(\d+)>/)[1];
                authorName = message.guild.member(message.client.users.cache.get(authorID)) ? message.guild.member(message.client.users.cache.get(authorID)).nickname : message.client.users.cache.get(authorID).username;
            } else { authorID = null };

            return {
                content: content,
                authorID: authorID,
                authorName: authorName,
                addedBy: message.author.id,
                guild: message.guild.id,
                msgID: message.id,
                timestamp: Date.now().toFixed(0)
            }
        }
        else { return "NOQUOTE" }
    },
    async execute(message, args) {
        let qOptions = {
            where: { 
                guild: message.guild.id 
            } 
        };
        

        // MODIFIERS 
        if (args && args.includes("!guild")) {
            // Search a specific guild for quotes
            // Or, if the guild id is "all", search guilds user is in
            guildSearch = args[args.indexOf("!guild")+1];
            if (guildSearch === "all") {
                // Get ALL quotes, from every guild if the owner is calling it
                if (message.author.id === message.client.config.owner) {delete qOptions.where.guild;}
                else {
                    let guildFilter = new Array();

                    message.client.guilds.cache.forEach(g => {
                            try {
                                // Try to fetch the member object for the ID of the user
                                // If it works, that user is in that guild and the guild ID
                                // should be included in the search parameters
                                const fetch = g.member(message.author.id) ;
                                if (fetch) guildFilter.push(g.id);
                            } catch (e) { return }
                        });
                    qOptions.where.guild = {[Op.or]: guildFilter};
                }
            } else {qOptions.where.guild = new String(guildSearch);}
        }
        if (args && args.includes("!search")) {
            // Find quotes with specific search terms
            textSearch = args[args.indexOf("!search")+1];
            qOptions.where.content = { [Op.substring]: textSearch };
        }
        if (args && args.includes("!author")) {
            authorSearch = args[args.indexOf("!author")+1];
            // Search by user mention
            if (authorSearch.match(/^<@!?(\d+)>/)) {
                qOptions.where.authorID = authorSearch.match(/^<@!?(\d+)>/)[1];
            // Search quotes without an authorID
            } else if (authorSearch === "null") {
                qOptions.where.authorID = null;
            // Search by just an authorID (wip, broken for now)
            } else if (!isNaN(authorSearch)) { qOptions.where.authorID = Number.parseInt(authorSearch) }
            // Otherwise search as part of the author name
            else { 
                qOptions.where.authorName = { [Op.substring]: authorSearch } 
            
                // If the search term matches a person's name,
                // find their ID and add it to the search

                // not implemented yet
            }
        }

        let qRNG;
        let qALL; 

        if (args.length > 0) {
            // Check if we need to ADD or SET something first
            switch (args[0]){
                case 'add': 
                    args.shift();
                    this.add(message, args);
                    return;
                case 'remember':
                    args.shift();
                    this.remember(message, args);
                    return;
                case 'parse':
                    args.shift();
                    this.add(message, args, true);
                    return;
                case 'set':
                    return message.channel.send(`${error} There's nothing to set because this isn't ready.`);
                case 'count':
                    let count;
                    count = await message.client.quotes.count(qOptions);
                    return message.channel.send(`${success} I have ${count} quotes ${(args.includes("!all")) ? "in all servers I'm in" : "in this server"}.`)
                // quote searches
                case 'me':
                    qOptions.where.authorID = message.author.id;
                default:
            }
        }

        // Now process the command
        const quotes = await message.client.quotes.findAll(qOptions); 
        if (quotes.length === 0 ) { return message.channel.send(`${error} There aren't any quotes for this search!`) };
        // Pick a random one
        // (OR get the ID the user has picked)
        qRNG = args.find(num => !isNaN(num) && num != qOptions.where.guild && num != qOptions.where.authorID) 
            ? Number.parseInt(args.find(num => !isNaN(num) && num != qOptions.where.guild && num != qOptions.where.authorID))-1 
            : Math.floor(Math.random()*quotes.length);
        qID = args.find(num => !isNaN(num) && num != qOptions.where.guild && num != qOptions.where.authorID)
            ? Number.parseInt(args.find(num => !isNaN(num) && num != qOptions.where.guild && num != qOptions.where.authorID))-1
            : null;
        if (qRNG >= quotes.length) { return message.channel.send(`${error} I only have **${quotes.length}** quotes to show.`) };
        const quote = quotes[qRNG];
        qALL = quotes.length;
        // console.log("Quote object: " + JSON.stringify(quote, null, 4));

        if (args[args.length-1] === "?delete") {
            if (typeof qID === "number" || quotes.length === 1) { return this.remove(message, qOptions, quotes[qRNG]); }
            else { return message.channel.send(`${error} Are you really going to ask me to delete something without knowing what you want to delete?`) }
        }

        //
        const embedQuote = new Discord.MessageEmbed()
        .setDescription(this.format(message, quote, qRNG+1, qALL));

        // Post the quote and stop execution
        // An allowedMentions object is used here to disallow the bot from pinging anyone
        return message.channel.send(embedQuote);
        

    },
    async add(message, args, parsemode) {

        const quote = await this.parse(message, args);
        // console.log("Quote object: " + JSON.stringify(quote, null, 4));
        switch (quote) {
            case "COULDNTGET":
                return message.channel.send(`${error} I don't have access to that message. It may be in a server or channel I don't see.`);
            case "WRONGURL":
                return message.channel.send(`${error} You passed me a URL that is not a Discord message link.`);
            case "NOQUOTE":
                return message.channel.send(`${error} You need to supply either a Discord message link or a quote of format \`"Quote text\" @QuoteAuthor\`.`)
            case undefined:
                return message.channel.send(`${error} The parser function returned an empty quote object for some reason. :thinking:`)
        }

        if (parsemode) {

            const parsedQuote = new Discord.MessageEmbed()
            .setTitle(`Here is your quote as parsed by ${message.client.user.username}`)
            .setDescription(this.format(message, quote));
            
            message.channel.send(parsedQuote);
            return;

        }

        try {
            const addedQuote = await message.client.quotes.create(quote);
            const quoteCount = await message.client.quotes.count({ where: { guild: message.guild.id }})
            
            const embedQuote = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Quote added successfully')
            .setDescription(this.format(message, addedQuote, quoteCount));
            
            message.channel.send(embedQuote);
            return message.react('👍');
        } catch (e) {
            switch (e.name) {
                case 'SequelizeUniqueConstraintError':
                    return message.channel.send(`${error} For some reason, I tried saving to a quote ID that already exists. :thinking:`);
                default:
                    return message.channel.send(e.stack, { code: 'js' });
            }
        }

        // return message.channel.send(`${error} This also isn't ready yet.`);


    },
    async remove(message, options, quote) {
     
        // create embed to act on later
        let deleteConfirm = new Discord.MessageEmbed();

        options.where.content = quote.content;

        // Create filter for the delete confirm
        // Making sure that only the user initiating the delete
        // can confirm
        const deleteFilter = (reaction, user) => {
            return ['✔','❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        const delConfirmFunc = (msg) => {
            msg.react('✔');
            msg.react('❌');
            msg.awaitReactions(deleteFilter, { max: 1, time:60000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();

                    switch (reaction.emoji.name) {
                        case '✔':
                            // remove the item from the database
                            message.client.quotes.destroy(options);
                            // modify the original message to show it was deleted.
                            deleteConfirm.footer = null;
                            msg.edit(deleteConfirm
                                .setColor('#ff0000')
                                .setTitle(`Item deleted.`));
                            msg.delete({ timeout: 15000 });
                            return;
                        case '❌':
                            deleteConfirm.footer = null;
                            msg.edit(deleteConfirm
                                .setTitle(`Delete cancelled.`));
                            msg.delete({ timeout: 15000 });
                            return;
                    }
                    return
                })
                // If we run out of time
                .catch(collected => {
                    msg.edit(deleteConfirm
                        .setTitle(`Delete cancelled.`)
                        .setFooter(`The deletion was not confirmed in time.`));
                    msg.delete({ timeout: 15000 });
                    return;
                })

        }

        deleteConfirm.setColor('#ffff00')
            .setTitle(`Found your quote. Delete?`)
            .setDescription(this.format(message, quote))
            .setFooter('React with ✔ or ❌ below.');
        

        
        message.channel.send(deleteConfirm)
            .then((msg) => delConfirmFunc(msg));
    },
    async idle(message, args) {
        // Defines a script to execute for the idle function
        // In this case, simply calls execute() with no arguments
        this.execute(message, []);
    },
    async remember(message, args) {
	let author = args.shift();
	let search = args.join(" ");
	
	let foundMessage = await message.channel.messages.fetch({limit: 50})
	    .then(messages => messages.find(msg => msg != message && msg.author.username.toLowerCase().indexOf(author.toLowerCase()) != -1 && msg.content.toLowerCase().indexOf(search.toLowerCase()) != -1))
            .catch(console.error);
    
    if (!foundMessage.content) { return message.channel.send(`${error} I couldn't find a message matching that term in the last 50 messages.`) }
    this.add(message, foundMessage);
    }
}
