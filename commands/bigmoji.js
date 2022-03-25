const Discord = require('discord.js');
const { success, error } = require('../config.json').emoji;

module.exports = {
    name: "bigmoji",
    // data: {
    //     name: 'bigmoji',
    //     description: 'Your Emojis, but Big',
    //     options: [{
    //         name: 'emoji',
    //         type: 'STRING',
    //         description: 'Emoji to choose',
    //     }]
    // },
    help: {
        short: 'You are welcome Spicy',
        visible: true
    },
    async execute(interaction) {
        const emojiParam = interaction.options.getString('emoji');

        const [, emojiname, emojicode] = emojiParam.match(/^<a?:(.+):(\d+)>$/);
        const emoji = interaction.client.emojis.cache.find(e => e.name === emojiname);
        if (!emoji) { 
            try {
                const emoji = args[0].match(/^<a/) ? `https://cdn.discordapp.com/emojis/${emojicode}.gif` : `https://cdn.discordapp.com/emojis/${emojicode}.png`;
                const Bigmoji = new Discord.MessageAttachment(emoji);
                return interaction.reply({files: [Bigmoji]}); //Print it
            } catch (e) { return interaction.reply({content: `${error} I can't find it.`, ephemeral: true}) }}
        const Bigmoji = new Discord.MessageAttachment(emoji.url)
        return interaction.reply({files: [Bigmoji]}); //Print it
    },
    async idle(message, args) {
        // A variation on the normal command
        // This version for the idle system grabs a random emoji from its cache

        const emoji = message.client.emojis.cache.random();
        const Bigmoji = new Discord.MessageAttachment(emoji.url)
        return message.channel.send({files: Bigmoji}); //Print it

    }

}