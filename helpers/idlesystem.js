module.exports = async (client, message) => {
    const idleTimeout = 6*60; // 6 hours
    const idleTimeoutDev = 45 // 45 minutes


    // Allow multiple prefixes?
	let prefix = false;
	for (const thisPrefix of client.config.prefix) {
		if (message.content.toLowerCase().startsWith(thisPrefix)) prefix = thisPrefix;
	}

    if (!message.content.toLowerCase().startsWith(prefix) && !message.author.bot) {
		// IDLE SYSTEM
		// We set a timer after each message here
		// It resets on each message
		// If the timer runs out, we execute a command with idle function

		function idleExecute(client, message) {

			let idleCmds = client.commands.filter(cmd => cmd.idle);
		
		
			console.log(`Executing idle for ${message.channel.name}`);
			const command = idleCmds.random();
			// temporarily prepend idle icon
			let iconVar = command.icon;
			command.icon = "🕓";
			command.idle(message);
			// reset icon
			command.icon = iconVar;
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

}