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
        autoIncrement: true
    },
    content: Sequelize.TEXT,
    authorID: Sequelize.STRING,
    authorName: Sequelize.STRING,
    addedBy: Sequelize.STRING,
    guild: Sequelize.STRING,
    msgID: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true
    },
    timestamp: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
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
    format(quote){
        // This is the format that the quotes in other commands will use
        const { id, content, authorID, authorName, timestamp, } = quote;

        // Get timestamp format
        const timestampFormat = new Intl.DateTimeFormat('en-us', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        // QUOTE PARAMETERS
        // 
        // CONTENT = quote msg
        // authorID = quote author's ID
        // authorName = quote author's name (in case user no longer exists)
        // timestamp = timestamp of the created message
        return `"${content}"\n—*${authorID ? "<@" + authorID + ">" : authorName} / ${timestamp ? timestampFormat.format(timestamp) : "Octember 32, 2020"} [#${id}]*`
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
            let authorID, guild;
            let addedBy;

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
    execute(message, args) {
        if (args.length === 0) {
            // Not ready yet, so here's a demo
            let quote = {
                timestamp: null,
                authorID: "49345026618036224",
                authorName: "Ash",
                content: "Any ending wherein Luigi drowns himself is a good ending in my book"
                }
            return message.channel.send(`${error} This isn't ready yet, but enjoy a demonstration of what *should* happen:\n${this.format(quote)}`, { allowedMentions: 'none' });
        }
        // Check if we need to ADD or SET something
        switch (args[0]){
            case 'add': 
                args.shift();
                this.add(message, args, false);
                break;
            case 'set':
                message.channel.send(`${error} There's nothing to set because this still isn't ready.`);
                break;
            default:
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
            .setDescription(this.format(addedQuote));
            
            message.channel.send(embedQuote);
            return message.react(success);
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