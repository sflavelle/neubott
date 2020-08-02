const Chariot = require('chariot.js');
const FS = require("fs");

class BotFacts extends Chariot.Command {
    constructor() {
        super();

        this.name = 'facts';
        this.allowDMs = true;
        this.cooldown = 3;
        this.aliases = ['botfacts','bucketfacts'];
        this.subcommands = ['add', 'remove', 'gadd', 'gremove'];
        this.help = {
            message: "Bucket has a lot of true, definitely real facts",
            usage: 'facts',
            example: ['facts','botfacts', 'facts add <text>'],
            inline: true
        }

        FS.stat('./resources/facts/', function(err) {
            if (!err) { return }
            else if (err.code === 'ENOENT') {FS.mkdir('./resources/facts/', (err) => {
                if (err) throw err;})};
        })
    }

    async add(message, args, chariot){
        Chariot.Logger.event("Adding to facts: args: '" + args.join(' ') + "'");
        var file = (FS.existsSync(`./resources/facts/${message.channel.guild.id}.json`)) ? JSON.parse(FS.readFileSync(`./resources/facts/${message.channel.guild.id}.json`, 'utf8')) : new Array(); //Load the file into memory and parse it
        var newresponse = args.join(' ');
        file.push(newresponse);
        FS.writeFileSync(`./resources/facts/${message.channel.guild.id}.json`, JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/facts.json') }
        })
        message.channel.createMessage("✅ Saved! That's **" + file.length + "** totally true real things I know now.\nHere's what I just added: `" + newresponse + "`");
    }

    async remove(message, args, chariot){
        Chariot.Logger.event("Removing from facts: args: '" + args.join(' ') + "'");
        try {
            var file = JSON.parse(FS.readFileSync(`./resources/facts/${message.channel.guild.id}.json`, 'utf8'));
        } catch (e) {if (e.code === "ENOENT") {message.channel.createMessage("💥 I don't have any local facts yet!"); return null;}};

        var searchtext = args.join(' ');
        const searchindex = (element) => element.includes(searchtext);
        let delIndex = file.findIndex(searchindex);
        let deletedtext = file[delIndex];
        file.splice(delIndex,1);
        FS.writeFileSync(`./resources/facts/${message.channel.guild.id}.json`, JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/facts.json') }
        })
        message.channel.createMessage("✅ Deleted. I now have **" + file.length + "** real ~~fake~~ facts.\nWe removed: `" + deletedtext + "`");
    }

    async gadd(message, args, chariot){
        if (typeof chariot.chariotOptions.chariotConfig.owner === "string") {
            if (message.author.id != chariot.chariotOptions.chariotConfig.owner) {message.channel.createMessage("💥 Only the bot owner can remove from the " + this.name + " command."); return null;}
        }
        else if (typeof chariot.chariotOptions.chariotConfig.owner === "object") {
            if (chariot.chariotOptions.chariotConfig.owner.includes(message.author.id) === false) {message.channel.createMessage("💥 Only the bot owner can remove from the " + this.name + " command."); return null;}
        }
        
        Chariot.Logger.event("Adding to facts: args: '" + args.join(' ') + "'");
        var file = FS.existsSync('./resources/facts/global.json') ? JSON.parse(FS.readFileSync('./resources/facts/global.json', 'utf8')) : new Array(); //Load the file into memory and parse it
        var newresponse = args.join(' ');
        const searchindex = (element) => element.includes(newresponse);
        if (file.findIndex(searchindex) !== -1) {
            let oldtextIndex = file.findIndex(searchindex);
            let oldtext = file[oldtextIndex];
            message.channel.createMessage("💥 That already exists in my database!\nThe older message says:\n" + oldtext);
            return;
        };
        file.push(newresponse);
        FS.writeFileSync('./resources/facts/global.json', JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/facts/global.json') }
        })
        message.channel.createMessage("✅ Saved! I now have **" + file.length + "** global death messages.\nHere's what I just added:\n`" + newresponse.replace('`', '\`') + "`");
    }

    async gremove(message, args, chariot){
        if (typeof chariot.chariotOptions.chariotConfig.owner === "string") {
            if (message.author.id != chariot.chariotOptions.chariotConfig.owner) {message.channel.createMessage("💥 Only the bot owner can remove from the " + this.name + " command."); return null;}
        }
        else if (typeof chariot.chariotOptions.chariotConfig.owner === "object") {
            if (chariot.chariotOptions.chariotConfig.owner.includes(message.author.id) === false) {message.channel.createMessage("💥 Only the bot owner can remove from the " + this.name + " command."); return null;}
        }

        Chariot.Logger.event("Removing from facts: args: '" + args.join(' ') + "'");
        var file = JSON.parse(FS.readFileSync('./resources/facts/global.json', 'utf8')); //Load the file into memory and parse it
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
                Chariot.Logger.event(`Removing from facts: too many matches (${searchMatches.length})`);
                message.channel.createMessage(`💥 There are too many matches for that string (**${searchMatches.length}**)!\nPlease be more specific and match **only** one item.`);
                return;
            } else {
                let delIndex = file.findIndex(searchindex);
                let deletedtext = file[delIndex];

                file.splice(delIndex,1);
                FS.writeFileSync('./resources/facts/global.json', JSON.stringify(file, null, 2), function (err) {
                    if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/facts/global.json') }
                })
                message.channel.createMessage("✅ This global message has been removed. **" + file.length + "** facts remaining.\nWe removed: `" + deletedtext.replace('`', '\`') + "`");
                Chariot.Logger.event(`Removing from facts: removed`);
                }} else {
                message.channel.createMessage("💥 Nothing matches that.");
                Chariot.Logger.event(`Removing from facts: no matches`);
                return;
                };
    }


    async execute(message, args, chariot) {
        try {
            var global = JSON.parse(FS.readFileSync('./resources/facts/global.json', 'utf8')); //Load the file into memory and parse it
            var local = FS.existsSync(`./resources/facts/${message.channel.guild.id}.json`) ? JSON.parse(FS.readFileSync(`./resources/facts/${message.channel.guild.id}.json`, 'utf8')) : new Array();
            var merged = global.concat(local);
        } catch (e) {if (e.code === "ENOENT") {message.channel.createMessage("💥 I don't have anything yet!"); return null;}};
            var response = merged[Math.floor(Math.random()*merged.length)]; //Choose a response at random
            message.channel.createMessage(":microphone2: " + response); //Print it
    }
}

module.exports = new BotFacts;