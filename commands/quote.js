const { Sequelize, Op } = require('sequelize');
const moment = require('moment');
const Discord = require('discord.js');
const Format = Discord.Formatters;


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
        data: {
            name: 'quote',
            description: 'Save and recall quotable messages',
            options: [{
                name: 'get',
                type: 'SUB_COMMAND',
                description: 'Print a quote',
                options: [{
                    name: 'user',
                    type: 'USER',
                    description: 'User to search'
                },
                {
                    name: 'searchterm',
                    type: 'STRING',
                    description: 'A search term to look for'
                }]
            },
            {
                name: 'add',
                type: 'SUB_COMMAND_GROUP',
                description: 'Add a new quote',
                options: [{
                    name: 'url',
                    type: 'SUB_COMMAND',
                    description: 'Add quote by message URL',
                    options: [{
                        name: 'messageurl',
                        type: 'STRING',
                        description: 'Discord message URL to add',
                        required: true
                    }]
                },
                {
                    name: 'reply',
                    type: 'SUB_COMMAND',
                    description: "Add the message you reply to as a quote"
                },
                {
                    name: 'byhand',
                    type: 'SUB_COMMAND',
                    description: 'Add a quote by hand',
                    options: [{
                        name: 'user',
                        type: 'USER',
                        description: 'Author of the quote',
                        required: true
                    },
                    {
                        name: 'quote',
                        type: 'STRING',
                        description: 'Text of the quote',
                        required: true
                    }]
                }]
            },
            {
                name: 'remove',
                type: 'SUB_COMMAND',
                description: 'Delete a quote from the database',
                options: [{
                    name: 'user',
                    type: 'USER',
                    description: 'User to search'
                },
                {
                    name: 'searchterm',
                    type: 'STRING',
                    description: 'A search term to look for'
                }]
            }]
        },
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

    async execute(interaction) {
        console.log('Quote execution');
        const Mode = interaction.options.getSubcommand();
        const ModeGroup = interaction.options.getSubcommandGroup(false);

        console.log(`group: ${ModeGroup} | command: ${Mode}`);

        // Determine which script to run

        if (Mode === 'get' && ModeGroup === null) {
            //Get existing quotes
            const UserSearch = interaction.options.getUser('user');
            const StringSearch = interaction.options.getString('searchterm');
            console.log(`[Options] User: ${UserSearch ? UserSearch.toString() : 'none'} | Search Term: ${StringSearch}`)
            let qOptions = {
                where: { 
                    guild: interaction.guild.id 
                } 
            };
            
    
            // MODIFIERS 
            if (StringSearch) {
                // Find quotes with specific search terms
                qOptions.where.content = { [Op.substring]: StringSearch };
            }
            if (UserSearch) {
                // Find quotes by the given user
                    qOptions.where.authorID = { [Op.substring]: UserSearch.id } 
            }
    
            let qRNG;
            let qALL; 
            
            console.log(`Now processing query`)

            // Now process the command
            const quotes = await interaction.client.quotes.findAll(qOptions); 
            if (quotes.length === 0) { return interaction.reply({content: `${error} There aren't any quotes for this search!`, ephemeral: true}) };

            // Pick a random one
            // (OR get the ID the user has picked)

            // Old v12 code
            // qRNG = args.find(num => !isNaN(num) && num != qOptions.where.guild && num != qOptions.where.authorID) 
            //     ? Number.parseInt(args.find(num => !isNaN(num) && num != qOptions.where.guild && num != qOptions.where.authorID))-1 
            //     : Math.floor(Math.random()*quotes.length);

            qRNG = Math.floor(Math.random()*quotes.length);
            qID = null;
            if (qRNG >= quotes.length) { return interaction.reply({content: `${error} I only have **${quotes.length}** quotes to show.`, ephemeral: true}) };
            const quote = quotes[qRNG];
            qALL = quotes.length;
            // console.log("Quote object: " + JSON.stringify(quote, null, 4));
    
            const embedQuote = new Discord.MessageEmbed()
            .setDescription(this.format(interaction, quote, qRNG+1, qALL));
    
            // Post the quote and stop execution
            // An allowedMentions object is used here to disallow the bot from pinging anyone
            return interaction.reply({embeds: [embedQuote]});
            
        } else if (ModeGroup === 'add') {
            
            const QuoteRegex = new RegExp(/"(.+)" (.+)$/s);

            switch(Mode) {
                case 'byhand':
                    const Author = interaction.options.getUser('user');
                    const Quote = interaction.options.getString('quote');

                    this.add(interaction, {
                        content: Quote,
                        authorID: Author.id,
                        authorName: Author.username,
                        addedBy: interaction.user.id,
                        guild: interaction.guild.id,
                        msgID: interaction.webhook.id,
                        timestamp: Date.now().toFixed(0)
                    });

                    break;
                case 'url':
                    const DiscordRegex = new RegExp(/(|canary\.|ptb\.)discord(app)?\.com\/channels/i);
                    // Any URL passed into this must belong to Discord's app
                    const URL = interaction.options.getString('messageurl');

                    if (URL.match(DiscordRegex)) {
                        // Successful channel match
                        let [guildID, channelID, msgID] = URL.split('/').slice(4);
                        console.log(`[${this.name}] parsing message URL for guild ${guildID}, channel ${channelID}, msg ${msgID}`);
                        
                        let channel = interaction.client.channels.cache.get(channelID);
                        return channel.messages.fetch(msgID).then((quotemsg) => {
                            console.log(`[${this.name}] fetched message?`);
                            console.log(quotemsg);
                            if (quotemsg.content) {
                                // We got the linked message, now return the quote object
                                console.log(`[quote] fetched message ${quotemsg.id} from ${quotemsg.author.username}!`);
            
                                // If the message content starts with a mention, strip it
                                if (quotemsg.content.startsWith('<@')) {quotemsg.content = quotemsg.content.replace(/<@!?(\d+)>/, '').trim()};
                                this.add(interaction, {
                                    content: quotemsg.content,
                                    authorID: quotemsg.author.id,
                                    authorName: quotemsg.member ? quotemsg.member.nickname : quotemsg.author.username,
                                    addedBy: interaction.user.id,
                                    guild: quotemsg.channel.guild.id,
                                    msgID: quotemsg.id,
                                    timestamp: quotemsg.createdTimestamp
                                }); 
                            }
                
                        })
                        .catch((e) => {return interaction.reply({content: `${error} ${e}`, ephemeral: true});});
                    }
                    else if (!URL.match(DiscordRegex) && URL.match(/^https?:\/\//i)) {
                        return interaction.reply({content: `${error} You passed me a URL that is not a Discord message link.`, ephemeral: true});
                    }
                break;
            }
        }
    },
    format(interaction, quote, qid, qlength){
        // This is the format that the quotes in other commands will use
        const { content, authorID, authorName, timestamp } = quote;

        // Get timestamp format
        const timestampFormat = new Intl.DateTimeFormat('en-us', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        let authorCheck;
        try { authorCheck = interaction.guild.members.fetch(authorID) } catch (e) { authorCheck = null; }

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
    async add(message, args, parsemode) {

        const quote = args;
        // console.log("Quote object: " + JSON.stringify(quote, null, 4));

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
            
            return message.reply({embeds: [embedQuote]});
        } catch (e) {
            switch (e.name) {
                case 'SequelizeUniqueConstraintError':
                    return message.reply({content: `${error} For some reason, I tried saving to a quote ID that already exists. :thinking:`, ephemeral: true});
                default:
                    return message.reply({content: Format.codeBlock('js', e.stack)});
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
	    .then(messages => messages.find(msg => 
            msg != message 
            && (
                msg.author.username.toLowerCase().indexOf(author.toLowerCase()) != -1 
                || (msg.member.nickname && msg.member.nickname.toLowerCase().indexOf(author.toLowerCase()) != -1 )
            )
            && msg.content.toLowerCase().indexOf(search.toLowerCase()) != -1)
            )
            .catch(e => { return e });

    if (foundMessage.name && foundMessage.message)  { return message.channel.send(`${error} ${e.message}`) } // Treating as error
    
    if (!foundMessage.content) { return message.channel.send(`${error} I couldn't find a message matching that term in the last 50 messages.`) }
    
    this.add(message, foundMessage);
    }
}
