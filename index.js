const fs = require('fs');
const Discord = require('discord.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

// Load config into memory
const config = require('./config.json');
// And store it inside the client
client.config = config;

// Load idle system
client.idle = config.idle;
// Setup idle timer
client.idle.timers = [];
const idleTimeout = 6*60; // 6 hours
const idleTimeoutDev = 45 // 45 minutes


// load emoji variables for success/error messages
const { success, error } = config.emoji;

// CLIENT SETUP //

// Read commands into the client
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// add into commands collection
	client.commands.set(command.name, command);
	// Execute ready function for each command if needed
	if (command.ready) {command.ready(client);};
	console.log(`Loaded command: ${command.name}`);
}

client.once('ready', () => {
	console.log(`Logged in (${client.user.tag})`);
});

// Message Handler
client.on('message', message => {
	// Allow multiple prefixes?
	let prefix = false;
	for (const thisPrefix of client.config.prefix) {
		if (message.content.toLowerCase().startsWith(thisPrefix)) prefix = thisPrefix;
	}

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	
	// Command regex string match
	const regexMatch = client.commands.find(cmd => cmd.regexAlias && message.content.match(cmd.regexAlias))
	if ((!message.content.toLowerCase().startsWith(prefix) || message.author.bot) && regexMatch) {regexMatch.execute(message, []); return}

	if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) {
		// IDLE SYSTEM
		// We set a timer after each message here
		// It resets on each message
		// If the timer runs out, we execute a command with idle function

		function idleExecute(client, message) {

			let idleCmds = client.commands.filter(cmd => cmd.idle);
		
		
			console.log(`Executing idle for ${message.channel.name}`);
			const command = idleCmds.random();
			command.icon = '🕓'; // override icon to show this is an idle message
			command.idle(message);
		
		}

		if (client.idle.channels.includes(message.channel.id)) {
			// First, clear any existing timer
			clearTimeout(client.idle.timers[message.channel.id]);
			// Then, set it again
			client.idle.timers[message.channel.id] = setTimeout(idleExecute, idleTimeout*60*1000, client, message)
		}
		else if (client.idle.channelsDev.includes(message.channel.id)) {
			// same thing but faster
			clearTimeout(client.idle.timers[message.channel.id]);
			client.idle.timers[message.channel.id] = setTimeout(idleExecute, idleTimeoutDev*60*1000, client, message)
		}
		
		// then return, because we shouldn't try to process a command after this point
		return};
		
	// Commands by command
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (command.owner && config.owner !== message.author.id) return message.channel.send(`${error} That command requires you to be the owner of the bot, and I don't see you on the list. 🤨`)

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);

		// Compose error message
		let errormsg = `${config.emoji.error} I can't run that command for some reason...`;
		if (message.channel.type === 'dm') {
			if (message.author.id === config.owner) {errormsg = `${'```js\n' + error.stack + '\n```'}`}
			else {errormsg += "I'll let the bot owner know."}
		}
		else {
			if (message.guild && new Set(['206734382990360576','124680630075260928']).has(message.guild.id)) {
			// Big kids get to see the error stack
			errormsg += `\n${'```js\n' + error.stack + '\n```'}`
			} else {errormsg += ` Pinging <@${config.owner}>, go check it out!`}
		}
		

		message.channel.send(errormsg);

		if (message.channel.type === 'dm' && message.author.id !== config.owner) {
			const owner = client.users.cache.get(config.owner);
			owner.send(`${message.author} ran into a problem with \`${command.name}\`:\n${'```js\n'}${error.stack}${'\n```'}`)
		}
	}
});

client.login(config.token);
