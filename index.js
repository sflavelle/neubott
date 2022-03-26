const fs = require('node:fs');
const { Client, Collection, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require ('discord-api-types/v9');

const schedule = require('node-schedule');

const BotIntents = new Intents(['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES']);

const client = new Client({intents: BotIntents});
client.commands = new Collection();
client.commandGlobalData = new Array();
client.commandGuildData = new Collection();

const clientID = '250947682758164491';

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
	if (command.data && !command.guilds) {client.commandGlobalData.push(command.data);};
	// Push guild-specific data to array
	if (command.data && command.guilds) {
		command.guilds.forEach(g => {
			const guildData = client.commandGuildData.get(g);
			if (guildData === undefined) {client.commandGuildData.set(g, new Array()); console.log(`Creating new GuildData array for guild ${g}`)}

			client.commandGuildData.get(g).push(command.data);
		})
	}

	console.log(`Loaded command: ${command.name}`);
}

// console.log(client.commandGlobalData);
// console.log(client.commandGuildData)

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

/*
//Push global commands
const DiscordGlobalCommands = await client.application?.commands.set(client.commandGlobalData);
//Find all guild commands, and push them
const DiscordGuildCommands = client.commandGuildData.each(async (data, id) =>{
	console.log(await client.guilds.cache.get(id)?.commands.set(data));
});
console.log(DiscordGlobalCommands);
console.log();
	const CmdOwnerPerms = [{
		id: config.owner,
		type: 'USER',
		permission: true
	}]
await client.guilds.cache.get('124680630075260928')?.commands.permissions.set({ command: '871568972548546662', permissions: CmdOwnerPerms });
await client.guilds.cache.get('206734382990360576')?.commands.permissions.set({ command: '871655686159859722', permissions: CmdOwnerPerms });
*/

const rest = new REST({ version: '9'}).setToken(config.token);

(async () => {
	try {
		console.log('Started refreshing global commands.');
		await rest.put(
			Routes.applicationCommands(clientID),
			{ body: client.commandGlobalData }
		);

		console.log('Success! Global commands refreshed.');
	} catch (error) {
		console.error(error);
	}
})();

(async () => {
	try {
		console.log('Started refreshing guild commands.');
		
		client.commandGuildData.each(async (data, id) => {
			rest.put(
				Routes.applicationGuildCommands(clientID, id),
				{ body: data }
			);
		});
		console.log('Success! Guild commands refreshed.');
	} catch (error) {
		console.error(error)
	}
})();

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
