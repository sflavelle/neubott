const Chariot = require('chariot.js');
const FS = require("fs");

class DeathMsgs extends Chariot.Command {
    constructor() {
        super();

        this.name = 'deathmsgs';
        this.allowDMs = true;
        this.cooldown = 3;
        this.aliases = ['deaths'];
        this.subcommands = ['add', 'remove', 'gadd', 'gremove'];
        this.help = {
            message: `Manage death messages used in the server.
            
            Use these variables to substitute for the last person who talked, and the server name: \\\u0060user\\\u0060, \\\u0060server\\\u0060
            You can also use \\\u0060USER\\\u0060 and \\\u0060SERVER\\\u0060 if you need TO YELL AT PEOPLE
            
            The bot owner can add messages that display across all servers with \`gadd\`.`,
            usage: 'deaths',
            example: ['deaths', 'deaths add <text>'],
            inline: true
        }

        FS.stat('./resources/deaths/', function(err) {
            if (!err) { return }
            else if (err.code === 'ENOENT') {FS.mkdir('./resources/deaths/', (err) => {
                if (err) throw err;})};
        })

    }

    async add(message, args, chariot){
        Chariot.Logger.event("Adding to deaths: args: '" + args.join(' ') + "'");
        var file = FS.existsSync(`./resources/deaths/${message.channel.guild.id}.json`) ? JSON.parse(FS.readFileSync(`./resources/deaths/${message.channel.guild.id}.json`, 'utf8')) : new Array(); //Load the file into memory and parse it
        var newresponse = args.join(' ');
        const searchindex = (element) => element.includes(newresponse);
        if (file.findIndex(searchindex) !== -1) {
            let oldtextIndex = file.findIndex(searchindex);
            let oldtext = file[oldtextIndex];
            message.channel.createMessage("💥 That already exists in my database!\nThe older message says:\n" + oldtext);
            return;
        };
        file.push(newresponse);
        FS.writeFileSync(`./resources/deaths/${message.channel.guild.id}.json`, JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed',`Could not write to resources/deaths/${message.channel.guild.id}.json`) }
        })
        message.channel.createMessage("✅ Saved! I now have **" + file.length + "** death messages.\nHere's what I just added:\n\`" + newresponse + "\`");
    }

    async remove(message, args, chariot){
        Chariot.Logger.event("Removing from deaths: args: '" + args.join(' ') + "'");
        var file = JSON.parse(FS.readFileSync(`./resources/deaths/${message.channel.guild.id}.json`, 'utf8')); //Load the file into memory and parse it
        var searchtext = args.join(' ');
        const searchindex = (element) => element.includes(searchtext);
        if (file.findIndex(searchindex) !== -1) {
            let searchMatches = file.reduce(function(a, e, i){
                if (e.search(searchtext) !== -1)
                a.push(i);
                return a;
            }, []); // source: https://stackoverflow.com/a/20798754
            // message.channel.createMessage("⌨ match results: `" + searchMatches.join(",") + "`");
            if (searchMatches.length > 1) {
                Chariot.Logger.event(`Removing from deaths: too many matches (${searchMatches.length})`);
                message.channel.createMessage(`💥 There are too many matches for that string (**${searchMatches.length}**)!\nPlease be more specific and match **only** one item.`);
                return;
            } else {
                let delIndex = file.findIndex(searchindex);
                let deletedtext = file[delIndex];

                file.splice(delIndex,1);
                FS.writeFileSync(`./resources/deaths/${message.channel.guild.id}.json`, JSON.stringify(file, null, 2), function (err) {
                    if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/idle/deaths.json') }
                })
                message.channel.createMessage("This message has been killed. **" + file.length + "** deaths remaining.\nWe removed: `" + deletedtext + "`");
                Chariot.Logger.event(`Removing from deaths: removed`);
                }} else {
                message.channel.createMessage("💥 Nothing matches that.");
                Chariot.Logger.event(`Removing from deaths: no matches`);
                return;
                };
    }

    async gadd(message, args, chariot){
        if (message.author.id != chariot.chariotOptions.chariotConfig.owner) {message.channel.createMessage("💥 Only the bot owner can add to the " + this.name + " command."); return null;}
        Chariot.Logger.event("Adding to deaths: args: '" + args.join(' ') + "'");
        var file = FS.existsSync('./resources/deaths/global.json') ? JSON.parse(FS.readFileSync('./resources/deaths/global.json', 'utf8')) : new Array(); //Load the file into memory and parse it
        var newresponse = args.join(' ');
        const searchindex = (element) => element.includes(newresponse);
        if (file.findIndex(searchindex) !== -1) {
            let oldtextIndex = file.findIndex(searchindex);
            let oldtext = file[oldtextIndex];
            message.channel.createMessage("💥 That already exists in my database!\nThe older message says:\n" + oldtext);
            return;
        };
        file.push(newresponse);
        FS.writeFileSync('./resources/deaths/global.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/deaths/global.json') }
        })
        message.channel.createMessage("✅ Saved! I now have **" + file.length + "** death messages.\nHere's what I just added:\n\`" + newresponse + "\`");
    }

    async gremove(message, args, chariot){
        if (message.author.id != chariot.chariotOptions.chariotConfig.owner) {message.channel.createMessage("💥 Only the bot owner can remove from the " + this.name + " command."); return null;}

        Chariot.Logger.event("Removing from deaths: args: '" + args.join(' ') + "'");
        var file = JSON.parse(FS.readFileSync('./resources/deaths/global.json', 'utf8')); //Load the file into memory and parse it
        var searchtext = args.join(' ');
        const searchindex = (element) => element.includes(searchtext);
        if (file.findIndex(searchindex) !== -1) {
            let searchMatches = file.reduce(function(a, e, i){
                if (e.search(searchtext) !== -1)
                a.push(i);
                return a;
            }, []); // source: https://stackoverflow.com/a/20798754
            // message.channel.createMessage("⌨ match results: `" + searchMatches.join(",") + "`");
            if (searchMatches.length > 1) {
                Chariot.Logger.event(`Removing from deaths: too many matches (${searchMatches.length})`);
                message.channel.createMessage(`💥 There are too many matches for that string (**${searchMatches.length}**)!\nPlease be more specific and match **only** one item.`);
                return;
            } else {
                let delIndex = file.findIndex(searchindex);
                let deletedtext = file[delIndex];

                file.splice(delIndex,1);
                FS.writeFileSync('./resources/deaths/global.json', JSON.stringify(file, null, 2), function (err) {
                    if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/deaths/global.json') }
                })
                message.channel.createMessage("This message has been killed. **" + file.length + "** deaths remaining.\nWe removed: `" + deletedtext + "`");
                Chariot.Logger.event(`Removing from deaths: removed`);
                }} else {
                message.channel.createMessage("💥 Nothing matches that.");
                Chariot.Logger.event(`Removing from deaths: no matches`);
                return;
                };
    }

    async execute(message, args, chariot) {
            var global = JSON.parse(FS.readFileSync('./resources/deaths/global.json', 'utf8')); //Load the file into memory and parse it
            var local = FS.existsSync(`./resources/deaths/${message.channel.guild.id}.json`) ? JSON.parse(FS.readFileSync(`./resources/deaths/${message.channel.guild.id}.json`, 'utf8')) : new Array();
            message.channel.createMessage(`There are **${global.concat(local).length}** death messages at the moment (including **${global.length}** messages used globally).\nThese are displayed at random when <#${message.channel.id}> is inactive.`);
    }
}

module.exports = new DeathMsgs;