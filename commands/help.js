const Discord = require('discord.js');
const { prefix } = require('../config.json');
const { success, error } = require('../config.json').emoji;

module.exports = {
    name: 'help',
    shortDesc: "Help I'm Trapped Inside a Recursion Factory",
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
                    commandsEmbed.addField('Owner Commands', commands.filter(cmd => cmd.owner).map(command => `\`${prefix[0] + command.name}\``).join(', '), true);
                }
                commandsEmbed.addField('Commands', commands.filter(cmd => !cmd.owner).map(command => `\`${prefix[0] + command.name}\` - *${command.shortDesc}*`).join('\n'));

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
    }
}