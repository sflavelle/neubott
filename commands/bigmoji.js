const Discord = require('discord.js');
const { success, error } = require('../config.json').emoji;

module.exports = {
    name: "bigmoji",
    aliases: ["bogmiji"],
    help: {
        short: 'You are welcome Spicy',
        visible: true
    },
    execute(message, args) {
        const [, emojiname, emojicode] = args[0].match(/^<a?:(.+):(\d+)>$/);
        const emoji = message.client.emojis.cache.find(e => e.name === emojiname);
        if (!emoji) { 
            try {
                const emoji = args[0].match(/^<a/) ? `https://cdn.discordapp.com/emojis/${emojicode}.gif` : `https://cdn.discordapp.com/emojis/${emojicode}.png`;
                const Bigmoji = new Discord.MessageAttachment(emoji);
                return message.channel.send(Bigmoji); //Print it
            } catch (e) { return message.channel.send(`${error} I can't find it.`) }}
        const Bigmoji = new Discord.MessageAttachment(emoji.url)
        return message.channel.send(Bigmoji); //Print it
    }
}