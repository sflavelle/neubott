const { Sequelize, Op } = require('sequelize');
const Discord = require('discord.js');

const config = {
    name: 'facts',
    icon: '🎙',
    regexAlias: /^(bott? ?|bucket |neubott )?facts$/i,
    help: {
        short: `totally true real facts`,
        long: `Bucket thinks he knows what's up. Spoiler alert, he doesn't. All of his facts are *almost* correct, except for the ones that are simply *in*correct.
        
        You can add more with the \`add\` subcommand, or delete one or more that might be in bad taste with the \`delete\` or \`remove\` command.
        By default servers will be shown 'global' items and items that were added in their own server.
        The bot owner can add items with the \`!global\` to allow them to show up in all servers.`,
        visible: true
    },
    msgs: {
        descriptorSingular: 'fact',
        descriptorPlural: 'facts'
    }
}

const sql = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    // logging: console.log,
    logging: false,
    storage: './data/simples.sqlite'
});

const db = sql.define('facts', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: Sequelize.TEXT,
        unique: false,
        allowNull: false
    },
    guild: Sequelize.STRING,
    global: {
        type: Sequelize.BOOLEAN
    },
    addedBy: Sequelize.STRING,
    timestamp: {
        type: Sequelize.INTEGER,
        defaultValue: 0    }
    }
);
    
const { success, error } = require('../config.json').emoji;
    
module.exports = {
    name: config.name,
    icon: config.icon,
    guilds: ['206734382990360576', '124680630075260928'],
    data: {
        name: 'facts',
        description: `totally true real facts`,
        options: [{
            name: 'get',
            type: 'SUB_COMMAND',
            description: "Tell me something I don't know!"
        },
        {
            name: 'add',
            type: 'SUB_COMMAND',
            description: 'give us more',
            options: [{
                name: 'url',
                type: 'STRING',
                description: 'the URL (or anything, really) to add'
            },
            {
                name: 'global',
                type: 'BOOLEAN',
                description: 'Add to all servers? (owner only)'
            }]
        },
        {
            name: 'remove',
            type: 'SUB_COMMAND',
            description: 'Remove an outdated fact'
        }
    ]
    },
    regexAlias: config.regexAlias,
    help: config.help,
    async ready(client) {
        db.sync();
    },
    async execute(interaction) {
        let Options = {
            where: { 
                [Op.or]: [{ guild: interaction.guild.id }, { global: true }]
            } 
        };
        const Mode = interaction.options.getSubcommand();

        if (Mode === 'get') {
    
            // Now process the command
            try {
                const item = await db.findAll(Options); 
                if (item.length === 0 ) { return interaction.reply({content: `${error} There aren't any ${config.msgs.descriptorPlural} for this search!`, ephemeral: true}) };
                // Pick a random one
                // (OR get the ID the user has picked)
                let qRNG = Math.floor(Math.random()*item.length);
                const itemSelected = item[qRNG];
    
                // Post the quote and stop execution
                // An allowedMentions object is used here to disallow the bot from pinging anyone
                return interaction.reply({content: `${isNaN(this.icon) ? this.icon : interaction.client.emojis.cache.get(this.icon)} ${itemSelected.content}`});
    
            } catch (e) {
                switch (e.name) {
                    case 'SequelizeDatabaseError':
                        return interaction.reply({content: `${error} I think that there aren't any ${config.msgs.descriptorPlural} to find.`, ephemeral: true})
                    default:
                        return interaction.reply({content: e.stack});
                }   
            }
        }
        else if (Mode === 'add') {
            const URL = interaction.options.getString('url');
            const GlobalBool = interaction.options.getBoolean('global');
            let IsGlobal;

            if (GlobalBool) {
                if (interaction.user.id === interaction.client.config.owner) { IsGlobal = true }
                else { IsGlobal = false } // Will follow up on this later
            }
    
            try {
                const addedItem = await db.create({
                    content: URL.replace(/\?s=\d{2}$/, ''),
                    addedBy: interaction.user.id,
                    guild: interaction.guild.id,
                    global: IsGlobal,
                    timestamp: Date.now().toFixed(0)
                });
                
                const embedQuote = new Discord.MessageEmbed()
                .setColor('#00ff00')
                .setTitle(`${success} Item added successfully`)
                .setDescription(`Now I have **${addedItem.id}** ${addedItem.id > 0 ? config.msgs.descriptorPlural : config.msgs.descriptorSingular}.
                
                                ${addedItem.content}`);
                
                interaction.reply({embeds: [embedQuote]});
                if (GlobalBool && IsGlobal === false) { //follow-up message if someone tried to set a global item without permission
                    interaction.followUp({ content: `Ignored \`global\` setting as you are not the bot owner.`, ephemeral: true});
                }
            } catch (e) {
                switch (e.name) {
                    case 'SequelizeUniqueConstraintError':
                        return interaction.reply({content: `${error} I already have that! :D`, ephemeral: true});
                    default:
                        return interaction.reply({content: e.stack, ephemeral: true});
                }
            }
        }
    },
    async add(message, args) {
        let global;
        if (args[0] === "!global") {
            if (message.author.id === message.client.config.owner) { args.shift(); global = true }
            else { args.shift();  global = false }
        }
        let prefix = false;
        for (const thisPrefix of message.client.config.prefix) {
            if (message.content.toLowerCase().startsWith(thisPrefix)) prefix = thisPrefix;
        }
        

        // return message.channel.send(`${error} This also isn't ready yet.`);


    },
    async remove(message, search, undo, undoitem) {
        switch (undo) {
            case 'true':
                /* 
                UNDO is a quick delete
                If called with an item it will delete it immediately
                If called without, it will delete the last item immediately
                */
                let deletedItem;
                if (undoitem) { deletedItem = undoitem; db.destroy({ where: item[0] });}
                else {
                    const delOptions = { order: [['createdAt', 'DESC']]};
                    deletedItem = db.findOne(delOptions);
                    db.destroy({ where: deletedItem });

                }
                
                const undoConfirm = new Discord.MessageEmbed()
                    .setColor('#ffff00')
                    .setTitle(`Undid your mistake.`)
                    .setDescription(deletedItem.content);

                return message.channel.send(undoConfirm)
                .then((msg) => msg.delete({ timeout: 10000 }));
            case 'false':
            default:
                // If undo is false, start search

                if (!search) return message.channel.send(`${error} Are you really going to ask me to delete something without knowing what you want to delete?`)

                let Options = {
                    where: {
                        [Op.or]: [{ guild: message.guild.id }, { global: true }],
                        content: { [Op.substring]: search }
                    }
                };
                
                const item = await db.findAll(Options); 

                // create embed to act on later
                let deleteConfirm = new Discord.MessageEmbed();

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
                                    db.destroy(Options);
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

                    switch (item.length) {
                        case 0:
                            return message.channel.send(`${error} There aren't any ${config.msgs.descriptorPlural} for this search!`);
                        case 1:
                            deleteConfirm.setColor('#ffff00')
                                .setTitle(`Found your ${config.msgs.descriptorSingular}. Delete?`)
                                .setDescription(item[0].content)
                                .setFooter('React with ✔ or ❌ below.');
                            

                            
                            message.channel.send(deleteConfirm)
                                .then((msg) => delConfirmFunc(msg));
                            break;
                        default:
                            let matchesText = '';
                            item.forEach(value => {
                                matchesText += `${value.content}\n`
                            });

                            deleteConfirm.setColor('#ffff00')
                            .setTitle(`Matched ${item.length} ${config.msgs.descriptorPlural}. Delete?`)
                            .setDescription(matchesText)
                            .setFooter('React with ✔ or ❌ below.');

                            message.channel.send(deleteConfirm)
                                .then((msg) => delConfirmFunc(msg))
                                .catch(e => {
                                    if (e.code === 50035) return message.channel.send(`${error} That's too many items **(${item.length})**!`)
                                });
                            
                    }
        }
    },
    async idle(message, args) {
        // Defines a script to execute for the idle function
        // In this case, simply calls execute() with no arguments
        this.execute(message, []);
    }

}