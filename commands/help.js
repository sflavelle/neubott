const Discord = require('discord.js');
const { prefix } = require('../config.json');
const { success, error } = require('../config.json').emoji;

module.exports = {
    name: 'help',
    aliases: ['commands'],
    help: {
        visible: false,
        short: "Help I'm Trapped Inside a Recursion Factory",
        long: `Really?`,
        usage: [ 'help', 'help <command>' ]
    },
    execute(message, args) {
        const data = [];
        const { commands } = message.client;

        if (!args.length) {
            data.push('here are all my commands.');
            
            const commandsEmbed = new Discord.MessageEmbed()
                .setTitle('Commands List')
                .setAuthor(message.client.user.username, 'https://i.postimg.cc/6539VQv3/Custom-Summer.png', 'http://www.neurario.com')
                .addField('Command Prefixes', `\`${prefix.join('`, `')}\``, true)
                if (message.author.id === message.client.config.owner) {
                    commandsEmbed.addField('Owner Commands', commands.filter(cmd => cmd.owner && cmd.help.visible !== false).map(command => `\`${prefix[0] + command.name}\``).join(', '), true);
                }
                commandsEmbed.addField('Commands', commands.filter(cmd => !cmd.owner && cmd.help.visible !== false).map(command => `\`${prefix[0] + command.name}\` - *${command.help.short}*`).join('\n'));

            return message.reply(data, { embed: commandsEmbed, split: true })
                // .then(() => {
                //     if (message.channel.type === 'dm') return;
                //     message.reply(`${success} I sent my command list to you over DMs.`);
                // })
                .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    // message.send(`${error} It seems like I can't DM you! Do you have DMs disabled?`);
                })
        }

        // Detailed help command

        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) { return message.channel.send(`I *wish* I had that command. ${error}`) };

        const commandEmbed = new Discord.MessageEmbed()
            .setTitle(`${name}`);
        if (command.aliases) commandEmbed.addField('Command Aliases', `\`${command.aliases.join('`, `')}\``, true);
        if (command.help.usage) commandEmbed.addField('Usage', `\`${command.help.usage.join('`, `')}\``, true);
        commandEmbed.addField('Info', command.help.long || "I forgot to write a help line here... ", false);

        message.channel.send(commandEmbed);
    }
}