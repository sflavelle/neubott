const SQLite = require('sequelize');
const { Sequelize } = require('sequelize');
const moment = require('moment');
const Discord = require('discord.js');

const sql = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    // logging: console.log,
    logging: false,
    storage: './data/quotes.sqlite'
});

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
    shortDesc: `Let's get that on the record`,
    guildOnly: true,
    async ready(client) {
            client.quotes = quotes;
            client.quotes.sync();

        // Common commands
        // client.getQuote = sql.prepare("SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1");
        // client.addQuote = sql.prepare("INSERT OR REPLACE INTO quotes (id, content, author_id, author_name, added_by, guild, timestamp) VALUES (@id, @content, @author_id, @author_name, @added_by, @guild, @timestamp);")
    },
    format(message, quote, qid, qlength){
        // This is the format that the quotes in other commands will use
        const { content, authorID, authorName, timestamp, } = quote;

        // Get timestamp format
        const timestampFormat = new Intl.DateTimeFormat('en-us', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        // Check if authorID is in the server
        let authorExists;
        message.guild.members.fetch(authorID)
            .then((m) => {
                if (m) {authorExists = true;} else {authorExists = false;}
            })
        // QUOTE PARAMETERS
        // 
        // CONTENT = quote msg
        // authorID = quote author's ID
        // authorName = quote author's name (in case user no longer exists)
        // timestamp = timestamp of the created message
        let quotemsg = `"${content}"\n—*${authorExists ? `<@${authorID}>` : authorName} / ${timestamp ? timestampFormat.format(timestamp) : "Octember 32, 2020"}*`
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
        if (args[0].match(DiscordRegex)) {
            // Successful channel match
            let [guildID, channelID, msgID] = args[0].split('/').slice(4);
            console.log(`[${this.name}] parsing message URL for guild ${guildID}, channel ${channelID}, msg ${msgID}`);
            
            let channel = message.client.channels.cache.get(channelID);
            return channel.messages.fetch(msgID).then((quotemsg) => {
                console.log(`[${this.name}] fetched message?`);
                if (quotemsg.id) {
                    // We got the linked message, now return the quote object
                    console.log(`[${this.name}] fetched message ${quotemsg.id} from ${quotemsg.author.username}!`);
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

            if (authorName.match(/^<!?@(\d+)>/)) {
                //if supplied name is a mention, parse it
                authorID = authorName.match(/^<@!?(\d+)>/)[1];
                authorName = message.guild.member(client.users.cache.get(authorID)) ? message.guild.member(client.users.cache.get(authorID)).nickname : client.users.cache.get(authorID).username;
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
        if (args.length === 0) {
            // Get all quotes from this guild
            const quotesAll = await message.client.quotes.findAll({ where: { guild: message.guild.id } }); 
            if (quotesAll.length === 0 ) { return message.channel.send(`${error} There aren't any quotes on this server!`) };
            // Pick a random one
            const rng = Math.floor(Math.random()*quotesAll.length);
            const quote = quotesAll[rng];
            // console.log("Quote object: " + JSON.stringify(quote, null, 4));

            // Post the quote and stop execution
            // An allowedMentions object is used here to disallow the bot from pinging anyone
            return message.channel.send(`${this.format(message, quote, rng+1, quotesAll.length)}`, { allowedMentions: { users: []}});
        }
        // Check if we need to ADD or SET something first
        switch (args[0]){
            case 'add': 
                args.shift();
                this.add(message, args, false);
                return;
            case 'set':
                return message.channel.send(`${error} There's nothing to set because this still isn't ready.`);
                break;
            case 'count':
                let count;
                if (args[1] && args[1] === "!all") {
                    count = await message.client.quotes.count();
                } else { count = await message.client.quotes.count({ where: { guild: message.guild.id }}); };
                return message.channel.send(`${success} I have ${count} quotes ${(args[1] && args[1] === "!all") ? "in all servers I'm in" : "in this server"}.`)
            default:
        }

        // If we get this far, we need to check what kind of quote they want to show
        if (args[0] === "!all") {
            // Get ALL quotes, from every guild
            const quotesAll = await message.client.quotes.findAll(); //no parameters
            if (quotesAll.length === 0 ) { return message.channel.send(`${error} There aren't any quotes *anywhere*!`) };
            const rng = Math.floor(Math.random()*quotesAll.length);
            const quote = quotesAll[rng];
            return message.channel.send(`${this.format(message, quote, rng+1, quotesAll.length)}`, { allowedMentions: { users: []}});
        }
        if (args[0] === "me") {
            // Get quotes only by the user asking
            let quotesMe;
            if (args[1] && args[1] === "!all") { quotesMe = await message.client.quotes.findAll( { where: { authorID: message.author.id }}); } //get their quotes from all servers
            else {quotesMe = await message.client.quotes.findAll( { where: { authorID: message.author.id, guild: message.guild.id }});} //no parameters
            if (quotesMe.length === 0 ) { return message.channel.send(`${error} You don't have any quotes saved.`) };
            const rng = Math.floor(Math.random()*quotesMe.length);
            const quote = quotesMe[rng];
            return message.channel.send(`${this.format(message, quote, rng+1, quotesMe.length)}`, { allowedMentions: { users: []}});

        }

    },
    async add(message, args, testmode) {
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

        // If we're testing the add mode, stop here and display the parsed quote
        if (testmode) { 
            message.channel.send(this.format(quote));

            // ALSO POST THE QUOTE OBJECT FOR DEBUGGING
            message.channel.send(JSON.stringify(quote, null, 4), { code: 'json' });
            return
        };

        try {
            const addedQuote = await message.client.quotes.create(quote);
            
            const embedQuote = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setTitle('Quote added successfully')
            .setDescription(this.format(addedQuote, addedQuote.id));
            
            message.channel.send(embedQuote);
            return message.react(':thumbsup:');
        } catch (e) {
            switch (e.name) {
                case 'SequelizeUniqueConstraintError':
                    return message.channel.send(`${error} For some reason, I tried saving to a quote ID that already exists. :thinking:`);
                default:
                    return message.channel.send(e.stack, { code: 'js' });
            }
        }

        // return message.channel.send(`${error} This also isn't ready yet.`);


    }
}