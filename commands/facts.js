const { Sequelize, Op } = require('sequelize');
const Discord = require('discord.js');

const config = {
    name: 'facts',
    icon: '🎙',
    help: {
        short: `totally true real facts`,
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
    help: config.help,
    async ready(client) {
        db.sync();
    },
    async execute(message, args) {
        let Options = {
            where: { 
                [Op.or]: [{ guild: message.guild.id }, { global: true }]
            } 
        };
        
        if (args.length > 0) {
            // Check if we need to ADD or SET something first
            switch (args[0]){
                case 'add': 
                    args.shift();
                    this.add(message, args);
                    return;
                case 'remove':
                    return message.channel.send(`${error} There's nothing to set because this isn't ready.`);
                default:
            }
        }

        // search term
        let searchTerm = args[1];
        if (searchTerm) Options.where.content = searchTerm;

        // Now process the command
        try {
            const item = await db.findAll(Options); 
            if (item.length === 0 ) { return message.channel.send(`${error} There aren't any ${config.msgs.descriptorPlural} for this search!`) };
            // Pick a random one
            // (OR get the ID the user has picked)
            let qRNG = Math.floor(Math.random()*item.length);
            const itemSelected = item[qRNG];

            // Post the quote and stop execution
            // An allowedMentions object is used here to disallow the bot from pinging anyone
            return message.channel.send(`${this.icon} ${itemSelected.content}`);
    } catch (e) {
        switch (e.name) {
            case 'SequelizeDatabaseError':
                return message.channel.send(`${error} I think that there aren't any ${config.msgs.descriptorPlural} to find.`)
            default:
                return message.channel.send(e.stack, { code: 'js' });
        }

    }
        

    },
    async add(message, args) {
        let global;
        if (args[0] === "!global") {
            if (message.author.id === message.client.config.owner) { args.shift(); global = true }
            else { args.shift(); message.reply(`Ignoring \`!global\` tag as you are not the bot owner.`); global = false }
        }
        let prefix = false;
        for (const thisPrefix of message.client.config.prefix) {
            if (message.content.toLowerCase().startsWith(thisPrefix)) prefix = thisPrefix;
        }
        for (string of args) {
            string.replace(/\?s=\d{2}$/, '')
        }
        const newItem = args.join('\n');

        try {
            const addedItem = await db.create({
                content: newItem,
                addedBy: message.author.id,
                guild: message.guild.id,
                global: global,
                timestamp: Date.now().toFixed(0)
            });
            
            const embedQuote = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setTitle(`${success} Item added successfully`)
            .setDescription(`Now I have **${addedItem.id}** ${addedItem.id > 0 ? config.msgs.descriptorPlural : config.msgs.descriptorSingular}.
            
                            ${addedItem.content}`);
            
            message.react('👍');
            return message.channel.send(embedQuote)
                .then((msg) => msg.delete({ timeout: 10000 }));
        } catch (e) {
            switch (e.name) {
                case 'SequelizeUniqueConstraintError':
                    return message.channel.send(`${error} I already have that! :D`);
                default:
                    return message.channel.send(e.stack, { code: 'js' });
            }
        }

        // return message.channel.send(`${error} This also isn't ready yet.`);


    }
}