const { success, error } = require('../config.json').emoji;

module.exports = {
    name: 'reload',
    shortDesc: 'Reloads a command',
    owner: true,
    execute(message, args) {
        if (!args.length) return message.channel.send(`${error} I kinda need a command name to reload, ${message.author}...`);

        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName)
            || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(`${error} \`${commandName}\` doesn't exist.`)

        // remove the command
        delete require.cache[require.resolve(`./${command.name}.js`)];
        // then re-add it
        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);
            if (newCommand.ready) {newCommand.ready(message.client);};
            message.channel.send(`${success} \`${command.name}\` was refreshed and reloaded.`);
        } catch (e) {
            console.log(e);
            message.channel.send(`${error} Something blew up while re-adding \`${command.name}\`:\n\`${e.message}\``);
        }

        console.log(`Reloaded command: ${commandName}`)
    }
}