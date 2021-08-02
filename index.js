const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');

const schedule = require('node-schedule');

const BotIntents = new Intents(['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES']);

const client = new Client({intents: BotIntents});
client.commands = new Collection();
client.commandData = new Array();

// Load config into memory
const config = require('./config.json');
// And store it inside the client
client.config = config;

// Load idle system
client.idle = config.idle;
const idleExecute = require('./helpers/idlesystem');
// Setup idle timer
client.idle.timers = [];

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

	// Push command data to array
	if (command.data) {client.commandData.push(command.data);};

	console.log(`Loaded command: ${command.name}`);
}

console.log(client.commandData);

client.once('ready', () => {
	console.log(`Logged in (${client.user.tag})`);

	// Setup scheduled events
	const scheduleFiles = fs.readdirSync('./events/scheduled').filter(file => file.endsWith('.js'));
	for (const file of scheduleFiles) {
		const eventScheduled = require(`./events/scheduled/${file}`);

		console.log(`Loaded cron events`)
		eventScheduled.execute(client);
	}
});

// v13 Interaction Handler
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	if (!client.commands.has(interaction.commandName)) return;
	console.log(interaction);
	try {
		await client.commands.get(interaction.commandName).execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({content: `${error} Ah, fuck. I can't believe you've done this.`, ephemeral: true})
	}
});

// Message Handler
client.on('messageCreate', message => idleExecute(client, message));
client.on('messageCreate', async message => {
	if (message.content.toLowerCase() === '//cmdregister' && message.author.id === config.owner) {
		const DiscordCommands = await client.guilds.cache.get('124680630075260928')?.commands.set(client.commandData);

		const CmdOwnerPerms = [{
			id: '871568972548546662', //eval
			permissions: [{
				id: config.owner,
				type: 'USER',
				permission: true
			},
			{
				id: '158776702372151296',
				type: 'ROLE',
				permission: true
			}]
		}];

		await client.guilds.cache.get('124680630075260928')?.commands.permissions.set({ fullPermissions: CmdOwnerPerms });
		console.log(DiscordCommands);
	}
})

// client.on('messageCreate', message => {
// 	// Allow multiple prefixes?
// 	let prefix = false;
// 	for (const thisPrefix of client.config.prefix) {
// 		if (message.content.toLowerCase().startsWith(thisPrefix)) prefix = thisPrefix;
// 	}

// 	const args = message.content.slice(prefix.length).trim().split(/ +/);
	
// 	// Command regex string match
// 	const regexMatch = client.commands.find(cmd => cmd.regexAlias && message.content.match(cmd.regexAlias))
// 	if ((!message.content.toLowerCase().startsWith(prefix) || message.author.bot) && regexMatch) {regexMatch.execute(message, []); return}

// 	if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) {return};
		
// 	// Commands by command
// 	const commandName = args.shift().toLowerCase();

// 	const command = client.commands.get(commandName)
// 		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

// 	if (command.owner === true && config.owner !== message.author.id) return message.channel.send(`${error} That command requires you to be the owner of the bot, and I don't see you on the list. 🤨`)

// 	try {
// 		command.execute(message, args);
// 	} catch (error) {
// 		console.error(error);

// 		// Compose error message
// 		let errormsg = `${config.emoji.error} I can't run that command for some reason...`;
// 		if (message.channel.type === 'dm') {
// 			if (message.author.id === config.owner) {errormsg = `${'```js\n' + error.stack + '\n```'}`}
// 			else {errormsg += "I'll let the bot owner know."}
// 		}
// 		else {
// 			if (message.guild && new Set(['206734382990360576','124680630075260928']).has(message.guild.id)) {
// 			// Big kids get to see the error stack
// 			errormsg += `\n${'```js\n' + error.stack + '\n```'}`
// 			} else {errormsg += ` Pinging <@${config.owner}>, go check it out!`}
// 		}
		

// 		message.channel.send(errormsg);

// 		if (message.channel.type === 'dm' && message.author.id !== config.owner) {
// 			const owner = client.users.cache.get(config.owner);
// 			owner.send(`${message.author} ran into a problem with \`${command.name}\`:\n${'```js\n'}${error.stack}${'\n```'}`)
// 		}
// 	}
// });

client.login(config.token);
