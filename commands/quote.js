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
            \`quote 3\` *(not implemented)* will get quote 3 in the database.
            \`quote count\` gets you the number of quotes, if you just want a number.
            
            **ADDING QUOTES**
            You can add a quote in one of two ways:
            Sending me a message link: \`quote add https://discordapp.com/channels/...\`
            Or with text: \`quote add "This is the quote" @someone\`
            
            **MODIFIERS**
            Adding modifiers after certain quote commands can change how quotes are selected.
            \`!all\` will look at quotes from every server - not just this one.
            \`!guild <guild id>\` will look at quotes from the specified guild.
            `,
        usage: [ 'quote', 'quote me', 'quote !all', 'addquote' ]
    },
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
        let authorCheck;
        try { authorCheck = message.guild.member(authorID); console.log(JSON.stringify(authorCheck, null, 4)); } catch (e) { authorCheck = false; }

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
        let qOptions = {
            where: { 
                guild: message.guild.id 
            } 
        };
        

        // MODIFIERS 
        if (args && args.includes("!all")) {
            // Get ALL quotes, from every guild
            delete qOptions.where.guild;
        }
        if (args && args.includes("!guild")) {
            if (args.includes("!all")) { return message.channel.send(`${error} You can't use \`!all\` and \`!guild\` at the same time.`)};
            // search a different guild
            qOptions.where.guild = args[args.indexOf("!guild")+1];
        }

        let qRNG;
        let qALL; 

        if (args.length > 0) {
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
        qRNG = args.find(num => {typeof num === 'integer' && num !== qOptions.where.guild})
            ? args.find(num => {typeof num === 'integer' && num !== qOptions.where.guild})
            : Math.floor(Math.random()*quotes.length);

        const quote = quotes[qRNG];
        qALL = quotes.length;
        // console.log("Quote object: " + JSON.stringify(quote, null, 4));

        // Post the quote and stop execution
        // An allowedMentions object is used here to disallow the bot from pinging anyone
        return message.channel.send(`${this.format(message, quote, qRNG+1, qALL)}`, { allowedMentions: { users: []}});
        

    },
    async add(message, args, testmode) {
        if (this.readOnly) {return message.channel.send(`${error} Adding quotes is disabled at the moment - the bot owner is probably fixing something.`)};

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