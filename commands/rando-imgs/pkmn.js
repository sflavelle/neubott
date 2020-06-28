const Chariot = require('chariot.js');
const FS = require("fs");

class PokemanPics extends Chariot.Command {
    constructor() {
        super();

        this.name = 'pokemon';
        this.allowDMs = true;
        this.cooldown = 3;
        this.aliases = ['pkmn'];
        this.subcommands = ['add', 'remove'];
        this.help = {
            message: 'Pokemon images. This will go well',
            usage: 'pokemon',
            example: ['pokemon', 'pkmn add <text or an url>', 'pkmn <search term>'],
            inline: true
        }
    }

    async add(message, args, chariot){
        Chariot.Logger.event("Adding to pkmn: args: '" + args.join(' ') + "'");
        let filename;
        if (message.channel.nsfw) {filename = 'pkmn.nsfw.json'} else {filename = 'pkmn.json'};
        //Load the file into memory and parse it
        let file = (FS.existsSync('./resources/' + filename)) ? JSON.parse(FS.readFileSync('./resources/' + filename, 'utf8')) : new Array();

        var newresponse = args.join(' ');
        const searchindex = (element) => element.includes(newresponse);
        if (file.findIndex(searchindex) !== -1) {
            let oldtextIndex = file.findIndex(searchindex);
            let oldtext = file[oldtextIndex];
            message.channel.createMessage("💥 That already exists in my database!\nThe older message says: `" + oldtext + "`");
            return;
        };
        file.push(newresponse);
        FS.writeFileSync('./resources/' + filename, JSON.stringify(file, null, 2), function (err) {
            if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/' + filename) }
        })
        message.channel.createMessage(`✅ Saved! I now have **${file.length}** ${message.channel.nsfw ? "lewd " : ""}pokeymans.\nHere's what I just added: \`${newresponse}\``);
    }

    async remove(message, args, chariot){
        Chariot.Logger.event("Removing from pkmn: args: '" + args.join(' ') + "'");
        let filename;
        if (message.channel.nsfw) {filename = 'pkmn.nsfw.json'} else {filename = 'pkmn.json'};

        try {
            var file = JSON.parse(FS.readFileSync('./resources/' + filename, 'utf8'));
        } catch (e) {if (e.code === "ENOENT" || file.length === 0) {message.channel.createMessage(`💥 I don't have anything yet!${message.channel.nsfw ? "\nKeep in mind that the image pool is different for NSFW channels." : ""}`); return null;}};
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
                Chariot.Logger.event(`Removing from pkmn: too many matches (${searchMatches.length})`);
                message.channel.createMessage(`💥 There are too many matches for that string (**${searchMatches.length}**)!\nPlease be more specific and match **only** one item.`);
                return;
            } else {
                let delIndex = file.findIndex(searchindex);
                let deletedtext = file[delIndex];

                file.splice(delIndex,1);
                FS.writeFileSync('./resources/' + filename, JSON.stringify(file, null, 2), function (err) {
                    if (err) { Chariot.Logger.error('Write failed','Could not write to /resources/' + filename) }
                })
                message.channel.createMessage(`✅ Deleted. I now have **${file.length}** ${message.channel.nsfw ? "lewd " : ""}pokeymans.\nWe removed:\`${deletedtext}\``);
                Chariot.Logger.event(`Removing from pkmn: removed`);
                }} else {
                message.channel.createMessage("💥 Nothing matches that.");
                Chariot.Logger.event(`Removing from pkmn: no matches`);
                return;
                };
    }

    async execute(message, args, chariot) {

        let filename;
        if (message.channel.nsfw) {filename = 'pkmn.nsfw.json'} else {filename = 'pkmn.json'};

        try {
            var file = JSON.parse(FS.readFileSync('./resources/' + filename, 'utf8'));
        } catch (e) {if (e.code === "ENOENT"|| file.length === 0) {message.channel.createMessage(`💥 I don't have anything yet!${message.channel.nsfw ? "\nKeep in mind that the image pool is different for NSFW channels." : ""}`); return null;}};

        if (args === undefined || args.length == 0) {}
        else {
            file = file.filter(link => link.toLowerCase().includes(args.join(" ")));
            if (file.length == 0) {message.channel.createMessage(`💥 Nothing matches that. *Is the search term in lowercase?*${message.channel.nsfw ? "\nKeep in mind that the image pool is different for NSFW channels." : ""}`); return null;}
        }
        var response = file[Math.floor(Math.random()*file.length)]; //Choose a response at random
        message.channel.createMessage(response); //Print it
    }
}

module.exports = new PokemanPics;